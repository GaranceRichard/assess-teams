from datetime import timedelta

from django.conf import settings
from django.db.models import F
from django.utils import timezone

from config.sqlite_contention import retryable_sqlite_atomic
from identities.application.passwords import public_password_url
from identities.models import User
from identities.password_models import PasswordResetDelivery
from journals.models import LogLevel, LogSource
from journals.services import record_log
from notifications.errors import delivery_error
from notifications.models import DeliveryState
from notifications.transport import send_email


@retryable_sqlite_atomic
def claim_password_email(delivery_id: int):
    PasswordResetDelivery.objects.filter(pk=delivery_id).update(attempts=F("attempts"))
    delivery = PasswordResetDelivery.objects.select_for_update().filter(pk=delivery_id).first()
    now = timezone.now()
    if not delivery or delivery.next_attempt_at > now or delivery.state not in {"pending", "retry"}:
        return None, "skipped"
    if delivery.created_at < now - timedelta(minutes=15):
        delivery.delete()
        return None, "discarded"
    if delivery.attempts >= 3:
        delivery.state = "failed"
        delivery.save(update_fields=["state"])
        return None, "failed"
    candidates = list(User.objects.filter(email__iexact=delivery.email)[:2])
    if (
        len(candidates) != 1
        or not candidates[0].is_active
        or not candidates[0].has_usable_password()
    ):
        delivery.delete()
        return None, "discarded"
    delivery.attempts += 1
    delivery.next_attempt_at = now + timedelta(minutes=1)
    delivery.state = "sending"
    delivery.save(update_fields=["attempts", "next_attempt_at", "state"])
    return candidates[0], "ready"


def deliver_password_email(delivery_id: int) -> str:
    user, result = claim_password_email(delivery_id)
    if user is None:
        return result
    # Network delivery happens outside the database writer lock.
    try:
        state, error = send_email(
            "Réinitialiser votre mot de passe Assess teams",
            "Pour choisir un nouveau mot de passe, ouvrez ce lien à usage unique "
            f"(valable {settings.PASSWORD_RECOVERY_TIMEOUT // 60} minutes) :\n\n"
            f"{public_password_url(user)}\n\n"
            "Si vous n'avez pas demandé ce changement, ignorez ce message.",
            user.email,
            f"password-{delivery_id}",
        )
    except Exception as exc:
        # Link/configuration errors must not leak recipients or generated tokens either.
        state, error = delivery_error(exc)
    if state == DeliveryState.RETRY:
        exhausted = PasswordResetDelivery.objects.filter(pk=delivery_id, attempts__gte=3).exists()
        if exhausted:
            state = DeliveryState.FAILED
    record_log(
        level=LogLevel.INFO if state == DeliveryState.SENT else LogLevel.WARNING,
        source=LogSource.NOTIFICATIONS,
        actor=user,
        organization=user.organizations.first(),
        operation="Envoi du courriel de récupération",
        category=state,
        message=f"Courriel de récupération : {state}. Référence : {delivery_id}.",
    )
    if state != DeliveryState.SENT:
        PasswordResetDelivery.objects.filter(pk=delivery_id).update(state=state, error_code=error)
        return state
    PasswordResetDelivery.objects.filter(pk=delivery_id).delete()
    return "sent"


def deliver_pending_password_emails() -> dict[str, int]:
    counts = {"sent": 0, "discarded": 0, "retry": 0, "skipped": 0, "failed": 0, "unknown": 0}
    now = timezone.now()
    interrupted = PasswordResetDelivery.objects.filter(
        state="sending", next_attempt_at__lt=now - timedelta(minutes=4)
    )
    # Preserve business writer access when this worker has nothing to recover.
    if interrupted.exists():
        interrupted.update(state="unknown", error_code="worker_interrupted")
    pending = PasswordResetDelivery.objects.filter(
        state__in=["pending", "retry"], next_attempt_at__lte=now
    )
    for delivery_id in list(pending.order_by("pk").values_list("pk", flat=True)[:100]):
        result = deliver_password_email(delivery_id)
        counts[result] += 1
    return counts
