from unittest.mock import patch

import pytest
from django.db import IntegrityError
from django.urls import reverse

from identities.domain.users import Role
from identities.models import Organization, User
from journals.models import ActivityEntry
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, taking_context

pytestmark = [
    pytest.mark.django_db(transaction=True),
    pytest.mark.functional,
    pytest.mark.integration,
]


def fail_after_first_activity():
    original = ActivityEntry.objects.create

    def write_then_fail(**kwargs):
        original(**kwargs)
        raise IntegrityError("activity-storage-failed")

    return patch("journals.services.ActivityEntry.objects.create", write_then_fail)


def test_failed_invitation_removes_identity_membership_and_activity():
    organization, _, admin, _ = taking_context()
    with (
        fail_after_first_activity(),
        patch("identities.adapters.api.admin_views.send_invitation") as notification,
    ):
        response = csrf_post(
            client_for(admin),
            reverse("managed-user-list"),
            {"identifier": "invited", "email": "invited@example.com", "role": "Viewer"},
        )
    assert response.status_code == 500
    assert not User.objects.filter(username="invited").exists()
    assert organization.users.count() == 2
    assert not ActivityEntry.objects.exists()
    notification.assert_not_called()


def test_failed_team_update_restores_name_coaches_and_partial_activity():
    organization, coach, admin, run = taking_context()
    team = run.team
    team.coaches.add(coach)
    replacement = create_user("replacement", Role.COACH)
    organization.users.add(replacement)
    with fail_after_first_activity():
        response = csrf_put(
            client_for(admin),
            reverse("team-detail", kwargs={"team_id": team.pk}),
            {"name": "Changed", "coach_ids": [replacement.pk]},
        )
    assert response.status_code == 500
    team.refresh_from_db()
    assert team.name == "North Team"
    assert list(team.coaches.values_list("pk", flat=True)) == [coach.pk]
    assert run.team_id == team.pk
    assert not ActivityEntry.objects.exists()


def test_failed_membership_replacement_restores_removed_links():
    organization, coach, admin, _ = taking_context()
    replacement = create_user("replacement", Role.VIEWER)
    with fail_after_first_activity():
        response = csrf_put(
            client_for(admin),
            reverse("organization-members", kwargs={"organization_id": organization.pk}),
            {"user_ids": [admin.pk, replacement.pk]},
        )
    assert response.status_code == 500
    assert set(organization.users.values_list("pk", flat=True)) == {coach.pk, admin.pk}
    assert not replacement.organizations.exists()
    assert not ActivityEntry.objects.exists()


def test_failed_organization_creation_removes_members_and_partial_audit():
    admin = create_user("admin", Role.ADMIN)
    with fail_after_first_activity():
        response = csrf_post(
            client_for(create_superuser()),
            reverse("organization-list"),
            {"name": "New", "user_ids": [admin.pk]},
        )
    assert response.status_code == 500
    assert not Organization.objects.exists()
    assert not admin.organizations.exists()
    assert not ActivityEntry.objects.exists()
