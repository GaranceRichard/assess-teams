from unittest.mock import patch

import pytest
from django.db import connection
from django.urls import reverse

from identities.models import User
from journals.models import ActivityEntry
from notifications.models import EmailNotification
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, taking_context

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


@pytest.mark.parametrize("action", ["invite", "update", "deactivate", "reactivate"])
def test_mail_failure_after_commit_preserves_identity_success(action, caplog, settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    organization, coach, admin, run = taking_context()
    if action == "reactivate":
        coach.is_active = False
        coach.save(update_fields=["is_active"])
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    client = client_for(admin)

    def unavailable(*args, **kwargs):
        assert not connection.in_atomic_block
        raise ConnectionRefusedError("smtp-unavailable")

    with patch("notifications.transport.EmailMessage.send", unavailable):
        if action == "invite":
            response = csrf_post(
                client,
                reverse("managed-user-list"),
                {"identifier": "pending", "email": "pending@example.com", "role": "Viewer"},
            )
        elif action == "update":
            response = csrf_put(
                client,
                reverse("managed-user-detail", kwargs={"user_id": coach.pk}),
                {"identifier": coach.username, "email": "changed@example.com"},
            )
        else:
            response = csrf_post(
                client,
                reverse(f"user-{action}", kwargs={"user_id": coach.pk}),
                {},
            )

    assert response.status_code == (201 if action == "invite" else 200)
    assert "smtp-unavailable" not in caplog.text
    assert EmailNotification.objects.exists()
    assert set(EmailNotification.objects.values_list("state", flat=True)) == {"retry"}
    assert ActivityEntry.objects.count() == 1
    if action == "invite":
        invited = User.objects.get(username="pending")
        assert organization.users.filter(pk=invited.pk).exists()
        assert not invited.has_usable_password()
    else:
        coach.refresh_from_db()
        assert coach.is_active == (action != "deactivate")
        if action == "update":
            assert coach.email == "changed@example.com"
        assert organization.users.filter(pk=coach.pk).exists()
        run.refresh_from_db()
        assert run.assignee_id == coach.pk
