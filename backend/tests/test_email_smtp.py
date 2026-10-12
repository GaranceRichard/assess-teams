import pytest
from django.utils import timezone

from notifications.delivery import deliver_email
from notifications.models import EmailNotification
from notifications.queue import enqueue_email
from tests.smtp_helpers import smtp_server

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


def configure_smtp(settings, server):
    settings.EMAIL_DELIVER_ON_COMMIT = False
    settings.EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    settings.EMAIL_HOST = "127.0.0.1"
    settings.EMAIL_PORT = server.server_address[1]
    settings.EMAIL_HOST_USER = ""
    settings.EMAIL_HOST_PASSWORD = ""
    settings.EMAIL_USE_TLS = False
    settings.EMAIL_TIMEOUT = 0.1


@pytest.mark.parametrize("code,state", [(250, "sent"), (450, "retry"), (550, "failed")])
def test_actual_smtp_acceptance_and_recipient_refusal(settings, code, state):
    with smtp_server(code=code) as server:
        configure_smtp(settings, server)
        notification = enqueue_email(recipient="member@example.com", subject="Test", body="Message")
        assert deliver_email(notification.pk) == state
        assert len(server.messages) == (1 if code == 250 else 0)
        if code == 450:
            server.recipient_code = 250
            EmailNotification.objects.update(next_attempt_at=timezone.now())
            assert deliver_email(notification.pk) == "sent"
            assert len(server.messages) == 1
        if code != 550:
            assert deliver_email(notification.pk) == "skipped"
            assert (
                f"Message-ID: <{notification.pk}@assess-teams.local>".encode() in server.messages[0]
            )


def test_unresponsive_smtp_connection_is_bounded_and_recovers(settings):
    with smtp_server(greeting=False) as server:
        configure_smtp(settings, server)
        notification = enqueue_email(recipient="member@example.com", subject="Test", body="Message")
        assert deliver_email(notification.pk) == "retry"
        notification.refresh_from_db()
        assert notification.error_code == "connection_unavailable"
        server.greeting = True
        EmailNotification.objects.update(next_attempt_at=timezone.now())
        assert deliver_email(notification.pk) == "sent"
        assert len(server.messages) == 1
