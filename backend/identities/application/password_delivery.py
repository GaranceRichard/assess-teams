from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from identities.application.passwords import public_password_url
from identities.models import User
from identities.password_models import PasswordResetDelivery


@transaction.atomic
def claim_password_email(delivery_id: int):
    PasswordResetDelivery.objects.filter(pk=delivery_id).update(attempts=F("attempts"))
    delivery = PasswordResetDelivery.objects.select_for_update().filter(pk=delivery_id).first()
    now = timezone.now()
    if not delivery or delivery.next_attempt_at > now:
        return None, "skipped"
    if delivery.created_at < now - timedelta(minutes=15) or delivery.attempts >= 3:
        delivery.delete()
        return None, "discarded"
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
    delivery.save(update_fields=["attempts", "next_attempt_at"])
    return candidates[0], "ready"


def deliver_password_email(delivery_id: int) -> str:
    user, result = claim_password_email(delivery_id)
    if user is None:
        return result
    # Network delivery happens outside the database writer lock.
    try:
        send_mail(
            "Réinitialiser votre mot de passe Assess teams",
            "Pour choisir un nouveau mot de passe, ouvrez ce lien à usage unique "
            f"(valable {settings.PASSWORD_RECOVERY_TIMEOUT // 60} minutes) :\n\n"
            f"{public_password_url(user)}\n\n"
            "Si vous n'avez pas demandé ce changement, ignorez ce message.",
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
    except Exception:
        # SMTP exceptions may contain the full message, URL or recipient: never log them.
        return "retry"
    PasswordResetDelivery.objects.filter(pk=delivery_id).delete()
    return "sent"


def deliver_pending_password_emails() -> dict[str, int]:
    counts = {"sent": 0, "discarded": 0, "retry": 0, "skipped": 0}
    pending = PasswordResetDelivery.objects.filter(next_attempt_at__lte=timezone.now())
    for delivery_id in list(pending.order_by("pk").values_list("pk", flat=True)[:100]):
        result = deliver_password_email(delivery_id)
        counts[result] += 1
    return counts
