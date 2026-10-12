import uuid
from datetime import timedelta

from django.conf import settings
from django.db.models import F
from django.utils import timezone

from journals.models import LogLevel, LogSource
from journals.services import record_log
from notifications.models import DeliveryState, EmailNotification
from notifications.transport import send_email


def notification_body(notification):
    if notification.schedule_notification:
        schedule = notification.schedule
        user = notification.user
        if (
            not schedule
            or schedule.requires_reassignment
            or not user
            or not user.is_active
            or user.email.casefold() != notification.recipient.casefold()
            or (schedule.assignee_id and schedule.assignee_id != user.pk)
            or (
                not schedule.assignee_id
                and (user.role != "Coach" or not schedule.team.coaches.filter(pk=user.pk).exists())
            )
            or (
                not user.is_superuser
                and not schedule.team.organization.users.filter(pk=user.pk).exists()
            )
        ):
            return None
    if not notification.invitation:
        return notification.body
    from identities.application.invitations import invitation_url

    user = notification.user
    if (
        not user
        or not user.is_active
        or user.has_usable_password()
        or user.email.casefold() != notification.recipient.casefold()
        or notification.created_at
        < timezone.now() - timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT)
    ):
        return None
    return notification.body.replace("{invitation_url}", invitation_url(user))


def record_delivery(notification, state):
    record_log(
        level=LogLevel.INFO if state == DeliveryState.SENT else LogLevel.WARNING,
        source=LogSource.NOTIFICATIONS,
        actor=notification.user,
        organization=notification.organization,
        team=notification.team,
        evaluation=notification.evaluation,
        operation="Envoi d’une notification par courriel",
        category=state,
        message=(
            "Notification d’évaluation envoyée."
            if state == DeliveryState.SENT and notification.evaluation_id
            else f"Notification par courriel : {state}. Référence : {notification.pk}."
        ),
    )


def deliver_email(notification_id):
    now = timezone.now()
    claim = uuid.uuid4()
    ready = EmailNotification.objects.filter(
        pk=notification_id,
        state__in=[DeliveryState.PENDING, DeliveryState.RETRY],
        next_attempt_at__lte=now,
    )
    if not ready.update(
        state=DeliveryState.SENDING, claim=claim, claimed_at=now, attempts=F("attempts") + 1
    ):
        return "skipped"
    notification = EmailNotification.objects.select_related(
        "user", "organization", "team", "evaluation"
    ).get(pk=notification_id)
    # The claim is committed before any network I/O in the worker or on_commit callback.
    body = notification_body(notification)
    state, error = (
        (DeliveryState.CANCELLED, "")
        if body is None
        else send_email(notification.subject, body, notification.recipient, notification.pk)
    )
    if state == DeliveryState.RETRY and notification.attempts >= settings.EMAIL_MAX_ATTEMPTS:
        state = DeliveryState.FAILED
    delay = min(60 * 2 ** min(notification.attempts - 1, 10), 3600)
    EmailNotification.objects.filter(pk=notification_id, claim=claim).update(
        state=state,
        error_code=error,
        claim=None,
        next_attempt_at=now + timedelta(seconds=delay),
        sent_at=timezone.now() if state == DeliveryState.SENT else None,
    )
    record_delivery(notification, state)
    return state


def deliver_pending_emails(limit=100):
    now = timezone.now()
    interrupted = EmailNotification.objects.filter(
        state=DeliveryState.SENDING, claimed_at__lt=now - timedelta(minutes=5)
    )
    # An idle poll must not acquire SQLite's writer lock.
    if interrupted.exists():
        interrupted.update(state=DeliveryState.UNKNOWN, error_code="worker_interrupted", claim=None)
    pending = EmailNotification.objects.filter(
        state__in=[DeliveryState.PENDING, DeliveryState.RETRY], next_attempt_at__lte=now
    ).order_by("next_attempt_at", "pk")
    counts = {}
    for notification_id in list(pending.values_list("pk", flat=True)[:limit]):
        state = str(deliver_email(notification_id))
        counts[state] = counts.get(state, 0) + 1
    return counts


def retry_notifications(queryset):
    # A sent or in-flight notification can never be intentionally resent by this action.
    return queryset.filter(state__in=[DeliveryState.FAILED, DeliveryState.RETRY]).update(
        state=DeliveryState.PENDING, next_attempt_at=timezone.now(), attempts=0, error_code=""
    )


def retry_uncertain_notifications(queryset):
    # Explicit operator action only, after checking the SMTP acceptance logs.
    return queryset.filter(state=DeliveryState.UNKNOWN).update(
        state=DeliveryState.PENDING, next_attempt_at=timezone.now(), attempts=0, error_code=""
    )


def confirm_accepted_notifications(queryset):
    return queryset.filter(state=DeliveryState.UNKNOWN).update(
        state=DeliveryState.SENT, sent_at=timezone.now(), error_code="", claim=None
    )
