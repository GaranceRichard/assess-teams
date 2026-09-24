import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_put


def logged_in_client(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_and_attached_admin_rename_an_organization() -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    route = reverse(
        "organization-detail",
        kwargs={"organization_id": organization.pk},
    )

    admin_response = csrf_put(logged_in_client(admin), route, {"name": " East "})
    root_response = csrf_put(logged_in_client(root), route, {"name": "Central"})

    organization.refresh_from_db()
    assert admin_response.status_code == 200
    assert admin_response.json()["name"] == "East"
    assert root_response.status_code == 200
    assert organization.name == "Central"


@pytest.mark.django_db
@pytest.mark.api
def test_organization_rename_refuses_invalid_or_unauthorized_requests() -> None:
    admin = create_user("admin", Role.ADMIN)
    other_admin = create_user("other-admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    route = reverse(
        "organization-detail",
        kwargs={"organization_id": organization.pk},
    )

    forbidden = csrf_put(logged_in_client(coach), route, {"name": "Blocked"})
    outside_scope = csrf_put(
        logged_in_client(other_admin),
        route,
        {"name": "Hidden"},
    )
    blank = csrf_put(logged_in_client(admin), route, {"name": "   "})
    missing = csrf_put(
        logged_in_client(admin),
        reverse("organization-detail", kwargs={"organization_id": 99999}),
        {"name": "Missing"},
    )

    organization.refresh_from_db()
    assert forbidden.status_code == 403
    assert outside_scope.status_code == 404
    assert blank.status_code == 400
    assert missing.status_code == 404
    assert organization.name == "North"
