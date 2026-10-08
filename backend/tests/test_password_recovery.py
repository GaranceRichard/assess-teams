from datetime import timedelta
from unittest.mock import patch

import pytest
from django.core import mail
from django.core.management import call_command
from django.urls import reverse
from django.utils import timezone

from identities.application.password_delivery import deliver_password_email
from identities.password_models import PasswordRateLimit, PasswordResetDelivery
from tests.password_helpers import delivered_payload, post

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@pytest.mark.parametrize("kind", ["active", "missing", "inactive", "pending", "ambiguous"])
def test_requests_have_identical_response_and_no_synchronous_lookup(password_context, kind):
    client, user = password_context
    email = user.email
    if kind == "missing":
        email = "absent@example.com"
    elif kind == "inactive":
        user.is_active = False
        user.save()
    elif kind == "pending":
        user.set_unusable_password()
        user.save()
    elif kind == "ambiguous":
        type(user).objects.create_user(username="duplicate", email=email, role="Coach")
    with patch("identities.models.User.objects.filter", side_effect=AssertionError("lookup")):
        response = post(client, "password-recovery", {"email": email.upper()})
    assert response.status_code == 202
    assert response.json() == {
        "detail": "Si un compte actif correspond à cette adresse, un lien vous sera envoyé."
    }
    assert response["Cache-Control"] == "no-store"
    assert len(mail.outbox) == 0
    assert PasswordResetDelivery.objects.count() == 1
    call_command("send_password_reset_emails")
    assert len(mail.outbox) == (1 if kind == "active" else 0)
    assert not PasswordResetDelivery.objects.exists()
    if kind == "active":
        assert mail.outbox[-1].to == [user.email]
        assert "https://public.example.com/password/reset#" in mail.outbox[-1].body
        assert post(client, "password-reset", delivered_payload()).status_code == 204


def test_address_suppression_and_ip_limits_do_not_depend_on_account_existence(password_context):
    client, user = password_context
    for _ in range(4):
        assert post(client, "password-recovery", {"email": user.email}).status_code == 202
    assert PasswordResetDelivery.objects.count() == 3
    for number in range(16):
        assert (
            post(client, "password-recovery", {"email": f"missing{number}@example.com"}).status_code
            == 202
        )
    response = post(client, "password-recovery", {"email": "unknown@example.com"})
    assert response.status_code == 429 and response["Retry-After"] == "3600"
    assert PasswordRateLimit.objects.filter(key__contains="example.com").count() == 0
    PasswordRateLimit.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    assert post(client, "password-recovery", {"email": user.email}).status_code == 202


def test_public_requests_require_csrf_and_valid_strict_payload(password_context):
    client, _ = password_context
    assert client.post(reverse("password-recovery"), {"email": "a@example.com"}).status_code == 403
    for data in [{}, {"email": "invalid"}, {"email": "a@example.com", "user_id": 1}]:
        assert post(client, "password-recovery", data).status_code == 400
    assert not PasswordResetDelivery.objects.exists()


def test_worker_retries_without_leaking_smtp_exception(password_context, capsys, caplog):
    client, user = password_context
    post(client, "password-recovery", {"email": user.email})
    with patch(
        "identities.application.password_delivery.send_mail",
        side_effect=RuntimeError("sensitive-url-and-token"),
    ):
        call_command("send_password_reset_emails")
    delivery = PasswordResetDelivery.objects.get()
    assert delivery.attempts == 1
    assert deliver_password_email(delivery.pk) == "skipped"
    assert deliver_password_email(999999) == "skipped"
    assert "sensitive-url-and-token" not in capsys.readouterr().out + caplog.text
    PasswordResetDelivery.objects.update(next_attempt_at=timezone.now())
    call_command("send_password_reset_emails")
    assert len(mail.outbox) == 1 and not PasswordResetDelivery.objects.exists()


@pytest.mark.parametrize("expired", [True, False])
def test_worker_discards_expired_or_exhausted_jobs(password_context, expired):
    _, user = password_context
    delivery = PasswordResetDelivery.objects.create(email=user.email)
    if expired:
        delivery.created_at -= timedelta(minutes=16)
    else:
        delivery.attempts = 3
    delivery.save()
    assert deliver_password_email(delivery.pk) == "discarded"
    assert not mail.outbox


def test_worker_watch_delivers_and_never_prints_sensitive_fields(password_context, capsys):
    client, user = password_context
    post(client, "password-recovery", {"email": user.email})
    with (
        patch(
            "identities.management.commands.send_password_reset_emails.time.sleep",
            side_effect=KeyboardInterrupt,
        ),
        pytest.raises(KeyboardInterrupt),
    ):
        call_command("send_password_reset_emails", watch=True)
    output = capsys.readouterr().out
    assert user.email not in output and "password/reset#" not in output
    assert len(mail.outbox) == 1
