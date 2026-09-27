import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization, User
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def logged_in_client(user: User) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def archive(client: APIClient, team: Team):
    return client.delete(
        reverse("team-detail", kwargs={"team_id": team.pk}),
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_creates_updates_and_archives_a_team_with_coaches() -> None:
    root = create_superuser()
    first = create_user("first-coach", Role.COACH)
    second = create_user("second-coach", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(first, second)
    client = logged_in_client(root)
    collection = reverse("team-list", kwargs={"organization_id": organization.pk})

    created = csrf_post(
        client,
        collection,
        {"name": "Alpha", "coach_ids": [first.pk, second.pk]},
    )
    team = Team.objects.get()
    updated = csrf_put(
        client,
        reverse("team-detail", kwargs={"team_id": team.pk}),
        {"name": "Beta", "coach_ids": [second.pk]},
    )
    removed = archive(client, team)

    team.refresh_from_db()
    assert created.status_code == 201
    assert created.json()["organization_id"] == organization.pk
    assert {coach["id"] for coach in created.json()["coaches"]} == {
        first.pk,
        second.pk,
    }
    assert updated.status_code == 200
    assert updated.json()["name"] == "Beta"
    assert [coach["id"] for coach in updated.json()["coaches"]] == [second.pk]
    assert removed.status_code == 204
    assert team.organization == organization
    assert team.is_active is False
    assert client.get(collection).json() == []


@pytest.mark.django_db
@pytest.mark.api
def test_team_name_is_unique_per_organization_including_archived_teams() -> None:
    root = create_superuser()
    first = Organization.objects.create(name="North")
    second = Organization.objects.create(name="South")
    Team.objects.create(name="Alpha", organization=first, is_active=False)
    client = logged_in_client(root)
    payload = {"name": " alpha ", "coach_ids": []}

    duplicate = csrf_post(
        client,
        reverse("team-list", kwargs={"organization_id": first.pk}),
        payload,
    )
    allowed = csrf_post(
        client,
        reverse("team-list", kwargs={"organization_id": second.pk}),
        payload,
    )

    assert duplicate.status_code == 400
    assert allowed.status_code == 201
    assert Team.objects.filter(name="alpha").count() == 1


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_manages_only_teams_from_an_attached_organization() -> None:
    admin = create_user("admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    accessible = Organization.objects.create(name="North")
    inaccessible = Organization.objects.create(name="South")
    accessible.users.add(admin, coach)
    hidden = Team.objects.create(name="Hidden", organization=inaccessible)
    client = logged_in_client(admin)
    accessible_route = reverse("team-list", kwargs={"organization_id": accessible.pk})

    created = csrf_post(
        client,
        accessible_route,
        {"name": "Visible", "coach_ids": [coach.pk]},
    )

    assert created.status_code == 201
    assert [team["name"] for team in client.get(accessible_route).json()] == ["Visible"]
    assert (
        client.get(reverse("team-list", kwargs={"organization_id": inaccessible.pk})).status_code
        == 404
    )
    assert archive(client, hidden).status_code == 404
    assert Team.objects.filter(pk=hidden.pk, is_active=True).exists()


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_team_management_refuses_coach_and_viewer(role: Role) -> None:
    actor = create_user("actor", role)
    organization = Organization.objects.create(name="North")
    organization.users.add(actor)
    client = logged_in_client(actor)

    response = client.get(reverse("team-list", kwargs={"organization_id": organization.pk}))

    assert response.status_code == 403


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("invalid_kind", ["viewer", "outsider", "inactive"])
def test_team_refuses_an_ineligible_coach(invalid_kind: str) -> None:
    root = create_superuser()
    organization = Organization.objects.create(name="North")
    if invalid_kind == "viewer":
        invalid = create_user("invalid", Role.VIEWER)
        organization.users.add(invalid)
    elif invalid_kind == "inactive":
        invalid = create_user("invalid", Role.COACH, is_active=False)
        organization.users.add(invalid)
    else:
        invalid = create_user("invalid", Role.COACH)
    client = logged_in_client(root)

    response = csrf_post(
        client,
        reverse("team-list", kwargs={"organization_id": organization.pk}),
        {"name": "Alpha", "coach_ids": [invalid.pk]},
    )

    assert response.status_code == 400
    assert not Team.objects.exists()
