from datetime import timedelta
from unittest.mock import patch

import pytest
from django.contrib import admin
from django.test import Client, RequestFactory
from django.utils import timezone

from identities.models import User
from identities.password_models import PasswordResetDelivery
from notifications.models import EmailNotification
from notifications.queue import enqueue_email
from tests.identity_helpers import create_superuser

pytestmark = [pytest.mark.django_db, pytest.mark.functional]


@pytest.fixture(autouse=True)
def queue_only(settings):
    settings.EMAIL_DELIVER_ON_COMMIT = False


def test_superadmin_sees_notification_states_and_can_retry_without_exposing_payload():
    notification = enqueue_email(
        recipient="private@example.com", subject="Invitation", body="private content"
    )
    notification.state = "failed"
    notification.save()
    client = Client()
    client.force_login(create_superuser())
    url = "/admin/notifications/emailnotification/"
    response = client.get(url, {"state__exact": "failed"})
    assert response.status_code == 200
    assert str(notification.pk) in response.content.decode()
    detail = client.get(f"{url}{notification.pk}/change/")
    assert detail.status_code == 200
    assert "private@example.com" not in detail.content.decode()
    assert "private content" not in detail.content.decode()
    assert (
        client.post(
            url, {"action": "retry_failed", "_selected_action": [notification.pk], "index": 0}
        ).status_code
        == 302
    )
    notification.refresh_from_db()
    assert notification.state == "pending"


def test_staff_business_admin_cannot_access_global_notification_queue():
    client = Client()
    user = User.objects.create_user(username="staff", role="Admin", is_staff=True)
    client.force_login(user)
    assert client.get("/admin/notifications/emailnotification/").status_code == 403
    assert client.get("/admin/identities/passwordresetdelivery/").status_code == 403


def test_password_requeue_preserves_expiry_and_uncertain_delivery_requires_separate_action():
    current = PasswordResetDelivery.objects.create(email="private@example.com", state="failed")
    old = PasswordResetDelivery.objects.create(
        email="old@example.com", state="failed", created_at=timezone.now() - timedelta(minutes=16)
    )
    uncertain = PasswordResetDelivery.objects.create(email="uncertain@example.com", state="unknown")
    model_admin = admin.site._registry[PasswordResetDelivery]
    request = RequestFactory().get("/admin/")
    request.user = create_superuser()
    with patch.object(model_admin, "message_user"):
        model_admin.retry_failed(request, PasswordResetDelivery.objects.all())
        uncertain.refresh_from_db()
        assert uncertain.state == "unknown"
        model_admin.retry_uncertain(request, PasswordResetDelivery.objects.all())
    current.refresh_from_db()
    old.refresh_from_db()
    uncertain.refresh_from_db()
    assert current.state == uncertain.state == "pending" and old.state == "failed"
    assert not model_admin.has_add_permission(request)
    assert not model_admin.has_delete_permission(request)


def test_operator_can_close_confirmed_acceptance_without_sending_again():
    notification = enqueue_email(recipient="private@example.com", subject="Test", body="Message")
    notification.state = "unknown"
    notification.save()
    password = PasswordResetDelivery.objects.create(email="private@example.com", state="unknown")
    request = RequestFactory().get("/admin/")
    request.user = create_superuser()
    for model in [EmailNotification, PasswordResetDelivery]:
        model_admin = admin.site._registry[model]
        with patch.object(model_admin, "message_user"):
            model_admin.confirm_accepted(request, model.objects.all())
    notification.refresh_from_db()
    assert notification.state == "sent" and notification.sent_at
    assert not PasswordResetDelivery.objects.filter(pk=password.pk).exists()
