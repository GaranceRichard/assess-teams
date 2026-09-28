import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry
from journals.services import record_activity
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def client_for(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_successful_team_action_is_recorded_only_after_success() -> None:
    admin = create_user("Marie Martin", Role.ADMIN)
    coach = create_user("Paul Durand", Role.COACH)
    organization = Organization.objects.create(name="DEDN")
    organization.users.add(admin, coach)
    client = client_for(admin)
    route = reverse("team-list", kwargs={"organization_id": organization.pk})

    created = csrf_post(
        client,
        route,
        {"name": "Architecture", "coach_ids": [coach.pk]},
    )
    failed = csrf_post(
        client,
        route,
        {"name": "Architecture", "coach_ids": []},
    )

    entries = ActivityEntry.objects.all()
    creation = entries.get(action=ActivityAction.TEAM_CREATED)
    assert created.status_code == 201
    assert failed.status_code == 400
    assert entries.count() == 2
    assert creation.organization == organization
    assert creation.organization_name == "DEDN"
    assert creation.actor == admin
    assert creation.actor_name == "Marie Martin"
    assert creation.team_name == "Architecture"
    assert creation.description == "Création de l’équipe"
    assert creation.created_at <= timezone.now()


@pytest.mark.django_db
@pytest.mark.api
def test_refused_action_does_not_create_success_entry() -> None:
    coach = create_user("coach", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(coach)
    client = client_for(coach)

    response = csrf_post(
        client,
        reverse("team-list", kwargs={"organization_id": organization.pk}),
        {"name": "Forbidden", "coach_ids": []},
    )

    assert response.status_code == 403
    assert not ActivityEntry.objects.exists()


@pytest.mark.django_db
@pytest.mark.api
def test_admin_scope_filters_activity_while_superadmin_sees_all() -> None:
    admin_a = create_user("admin-a", Role.ADMIN)
    admin_b = create_user("admin-b", Role.ADMIN)
    root = create_superuser()
    organization_a = Organization.objects.create(name="A")
    organization_b = Organization.objects.create(name="B")
    organization_a.users.add(admin_a)
    organization_b.users.add(admin_b)
    for number in range(21):
        record_activity(
            actor=admin_a,
            organization=organization_a,
            action=ActivityAction.USER_UPDATED,
            description=f"Action A {number}",
        )
    record_activity(
        actor=admin_b,
        organization=organization_b,
        action=ActivityAction.USER_UPDATED,
        description="Action B",
    )

    admin_client = client_for(admin_a)
    first_page = admin_client.get(reverse("activity-journal")).json()
    second_page = admin_client.get(reverse("activity-journal"), {"page": 2}).json()
    forced_scope = admin_client.get(
        reverse("activity-journal"), {"organization_id": organization_b.pk}
    ).json()
    root_page = client_for(root).get(reverse("activity-journal")).json()

    assert first_page["count"] == 21
    assert len(first_page["results"]) == 20
    assert second_page["results"][0]["description"] == "Action A 0"
    assert root_page["count"] == 22
    assert forced_scope["count"] == 0
    assert first_page["results"][0]["description"] == "Action A 20"
    assert first_page["results"][0]["team_name"] == ""
    assert all(entry["organization_name"] == "A" for entry in first_page["results"])


@pytest.mark.django_db
@pytest.mark.api
def test_activity_filters_and_snapshots_survive_related_deletion() -> None:
    root = create_superuser()
    organization = Organization.objects.create(name="Legacy")
    team = Team.objects.create(name="BI", organization=organization)
    entry = record_activity(
        actor=root,
        organization=organization,
        team=team,
        action=ActivityAction.TEAM_ARCHIVED,
        description="Archivage de l’équipe",
    )
    root.delete()
    organization.delete()

    entry.refresh_from_db()
    response = client_for(create_superuser("new-root")).get(
        reverse("activity-journal"),
        {"player": "Superadmin", "team": "BI"},
    )

    assert entry.actor is None
    assert entry.organization is None
    assert entry.team is None
    assert entry.actor_name == "Superadmin"
    assert entry.organization_name == "Legacy"
    assert entry.team_name == "BI"
    assert response.json()["count"] == 1


@pytest.mark.django_db
@pytest.mark.api
def test_activity_journal_is_read_only_and_admin_only() -> None:
    admin = create_user("admin", Role.ADMIN)
    viewer = create_user("viewer", Role.VIEWER)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin, viewer)
    route = reverse("activity-journal")
    admin_client = client_for(admin)
    csrf = admin_client.cookies["csrftoken"].value

    assert client_for(viewer).get(route).status_code == 403
    assert admin_client.post(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert admin_client.put(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert admin_client.delete(route, HTTP_X_CSRFTOKEN=csrf).status_code == 405
