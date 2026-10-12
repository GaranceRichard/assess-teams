from datetime import timedelta
from smtplib import SMTPDataError, SMTPRecipientsRefused, SMTPServerDisconnected
from unittest.mock import patch

import pytest
from django.core import mail
from django.core.management import call_command
from django.db import transaction
from django.utils import timezone

from identities.application.invitations import send_invitation
from identities.models import User
from journals.models import LogEntry
from notifications.delivery import (
    deliver_email,
    deliver_pending_emails,
    retry_notifications,
    retry_uncertain_notifications,
)
from notifications.models import DeliveryState, EmailNotification
from notifications.queue import enqueue_email

pytestmark = [pytest.mark.django_db, pytest.mark.functional]


@pytest.fixture(autouse=True)
def email_settings(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.EMAIL_DELIVER_ON_COMMIT = False


def queued(**kwargs):
    return enqueue_email(
        recipient="member@example.com", subject="Notification", body="Message", **kwargs
    )


def test_persistent_queue_deduplicates_and_sends_once_with_stable_message_id():
    notification = queued(event_key="one-event")
    assert queued(event_key="one-event").pk == notification.pk
    assert not mail.outbox
    assert deliver_email(notification.pk) == DeliveryState.SENT
    assert deliver_email(notification.pk) == "skipped"
    assert len(mail.outbox) == 1
    assert mail.outbox[0].extra_headers["Message-ID"] == f"<{notification.pk}@assess-teams.local>"
    notification.refresh_from_db()
    assert notification.sent_at and notification.attempts == 1
    assert LogEntry.objects.get().category == "sent"


def test_queue_rolls_back_with_business_operation_and_does_not_send(settings):
    settings.EMAIL_DELIVER_ON_COMMIT = True
    with pytest.raises(ValueError), transaction.atomic():
        queued()
        raise ValueError("business refused")
    assert not EmailNotification.objects.exists()
    assert not mail.outbox


@pytest.mark.parametrize(
    "failure,state",
    [
        (ConnectionRefusedError("private"), "retry"),
        (SMTPDataError(451, b"private"), "retry"),
        (SMTPDataError(550, b"private"), "failed"),
        (SMTPRecipientsRefused({"private": (450, b"private")}), "retry"),
        (SMTPRecipientsRefused({"private": (550, b"private")}), "failed"),
        (TimeoutError("private"), "unknown"),
        (SMTPServerDisconnected("private"), "unknown"),
        (RuntimeError("private"), "failed"),
    ],
)
def test_failures_are_classified_without_sensitive_exception_text(failure, state, caplog):
    notification = queued()
    with patch("notifications.transport.EmailMessage.send", side_effect=failure):
        assert deliver_email(notification.pk) == state
    notification.refresh_from_db()
    assert notification.state == state and notification.error_code
    assert "private" not in caplog.text + str(list(LogEntry.objects.values()))
    assert deliver_email(notification.pk) == "skipped"


def test_retry_waits_is_bounded_and_admin_recovery_never_resends_sent_or_inflight():
    notification = queued()
    with patch("notifications.transport.EmailMessage.send", return_value=0):
        for attempt in range(5):
            EmailNotification.objects.update(next_attempt_at=timezone.now())
            assert deliver_email(notification.pk) == ("retry" if attempt < 4 else "failed")
            notification.refresh_from_db()
            assert notification.next_attempt_at > timezone.now()
    assert retry_notifications(EmailNotification.objects.all()) == 1
    call_command("send_pending_notifications")
    assert len(mail.outbox) == 1
    assert retry_notifications(EmailNotification.objects.all()) == 0
    notification.state = "sending"
    notification.claimed_at = timezone.now() - timedelta(minutes=6)
    notification.save()
    assert deliver_pending_emails() == {}
    notification.refresh_from_db()
    assert notification.state == "unknown"
    assert retry_notifications(EmailNotification.objects.all()) == 0
    assert retry_uncertain_notifications(EmailNotification.objects.all()) == 1
    assert retry_uncertain_notifications(EmailNotification.objects.all()) == 0


def test_timeout_before_submission_retries_and_failed_quit_does_not_resend():
    notification = queued()
    with patch("notifications.transport.get_connection") as connection:
        connection.return_value.open.side_effect = TimeoutError
        assert deliver_email(notification.pk) == "retry"
    EmailNotification.objects.update(next_attempt_at=timezone.now())
    with patch("notifications.transport.get_connection") as connection:
        connection.return_value.close.side_effect = OSError
        with patch("notifications.transport.EmailMessage.send", return_value=1):
            assert deliver_email(notification.pk) == "sent"


@pytest.mark.parametrize("change", ["none", "inactive", "password", "email", "expired", "deleted"])
def test_invitation_generates_token_only_at_delivery_and_cancels_stale_links(change):
    user = User.objects.create_user(username="member", email="member@example.com", role="Coach")
    user.set_unusable_password()
    user.save()
    send_invitation(user)
    notification = EmailNotification.objects.get()
    assert "{invitation_url}" in notification.body and "/invitation/" not in notification.body
    if change == "inactive":
        user.is_active = False
    elif change == "password":
        user.set_password("A-new-password-123!")
    elif change == "email":
        user.email = "new@example.com"
    user.save()
    if change == "expired":
        EmailNotification.objects.update(created_at=timezone.now() - timedelta(days=4))
    elif change == "deleted":
        user.delete()
    assert deliver_email(notification.pk) == ("sent" if change == "none" else "cancelled")
    assert len(mail.outbox) == (1 if change == "none" else 0)
    if change == "none":
        assert "/invitation/" in mail.outbox[0].body


def test_worker_watch_delivers_without_printing_private_payload(capsys):
    queued()
    with (
        patch(
            "notifications.management.commands.send_pending_notifications.time.sleep",
            side_effect=KeyboardInterrupt,
        ),
        pytest.raises(KeyboardInterrupt),
    ):
        call_command("send_pending_notifications", watch=True)
    assert len(mail.outbox) == 1
    output = capsys.readouterr().out
    assert "member@example.com" not in output and "Message" not in output
    assert "'sent': 1" in output
