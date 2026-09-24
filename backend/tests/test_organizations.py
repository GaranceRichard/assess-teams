import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def logged_in_client(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_creates_an_organization_with_several_users() -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    client = logged_in_client(root)

    response = csrf_post(
        client,
        reverse("organization-list"),
        {"name": "North", "user_ids": [admin.pk, coach.pk]},
    )

    organization = Organization.objects.get()
    assert response.status_code == 201
    assert response.json()["name"] == "North"
    assert {user["id"] for user in response.json()["users"]} == {admin.pk, coach.pk}
    assert set(organization.users.all()) == {admin, coach}


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_creates_organizations_with_a_shared_user_and_lists_them() -> None:
    admin = create_user("admin", Role.ADMIN)
    viewer = create_user("viewer", Role.VIEWER)
    client = logged_in_client(admin)
    route = reverse("organization-list")

    first = csrf_post(client, route, {"name": "East", "user_ids": [viewer.pk]})
    second = csrf_post(client, route, {"name": "West", "user_ids": [viewer.pk]})
    listed = client.get(route)

    assert first.status_code == 201
    assert second.status_code == 201
    assert listed.status_code == 200
    assert [entry["name"] for entry in listed.json()] == ["East", "West"]
    assert viewer.organizations.count() == 2


@pytest.mark.django_db
@pytest.mark.api
def test_organization_creation_refuses_unauthorized_or_invalid_requests() -> None:
    coach = create_user("coach", Role.COACH)
    client = logged_in_client(coach)
    route = reverse("organization-list")

    forbidden = csrf_post(client, route, {"name": "Blocked", "user_ids": [coach.pk]})
    client.logout()
    anonymous = client.get(route)

    admin = create_user("admin", Role.ADMIN)
    admin_client = logged_in_client(admin)
    missing_users = csrf_post(admin_client, route, {"name": "Empty", "user_ids": []})
    unknown_user = csrf_post(admin_client, route, {"name": "Unknown", "user_ids": [99999]})

    assert forbidden.status_code == 403
    assert anonymous.status_code == 403
    assert missing_users.status_code == 400
    assert unknown_user.status_code == 400
    assert not Organization.objects.exists()
