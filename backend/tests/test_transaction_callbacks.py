from unittest.mock import patch

import pytest
from django.db import connection
from django.urls import reverse

from identities.models import User
from journals.models import ActivityEntry
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, taking_context

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


@pytest.mark.parametrize("action", ["invite", "update", "deactivate", "reactivate"])
def test_mail_failure_after_commit_preserves_identity_success(action, caplog):
    organization, coach, admin, run = taking_context()
    if action == "reactivate":
        coach.is_active = False
        coach.save(update_fields=["is_active"])
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    client = client_for(admin)
    target = (
        "identities.adapters.api.admin_views.send_invitation"
        if action == "invite"
        else "identities.adapters.api.admin_views.send_update_notice"
        if action == "update"
        else "identities.adapters.api.lifecycle_views.send_activation_notice"
    )

    def unavailable(*args):
        assert not connection.in_atomic_block
        raise RuntimeError("smtp-unavailable")

    with patch(target, unavailable):
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
    assert "smtp-unavailable" in caplog.text
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
