import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from notifications.models import DeliveryState, EmailNotification


def enqueue_email(*, recipient, subject, body, event_key=None, **context):
    defaults = {"recipient": recipient, "subject": subject, "body": body, **context}
    notification, created = EmailNotification.objects.get_or_create(
        event_key=event_key or str(uuid.uuid4()),
        defaults=defaults,
    )
    if not created:
        # A cancelled message was never submitted. A newly eligible intention can be resumed.
        created = bool(
            EmailNotification.objects.filter(
                pk=notification.pk, state=DeliveryState.CANCELLED
            ).update(
                **defaults, state=DeliveryState.PENDING, attempts=0, next_attempt_at=timezone.now()
            )
        )
    if created and settings.EMAIL_DELIVER_ON_COMMIT:
        from notifications.delivery import deliver_email

        transaction.on_commit(lambda: deliver_email(notification.pk), robust=True)
    return notification
