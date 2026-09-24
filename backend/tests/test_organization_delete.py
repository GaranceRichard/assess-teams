import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization, User
from tests.identity_helpers import create_superuser, create_user


def logged_in_client(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def csrf_delete(client: APIClient, route: str):
    return client.delete(
        route,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_deletes_an_organization_but_keeps_its_users() -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    viewer = create_user("viewer", Role.VIEWER)
    organization = Organization.objects.create(name="North")
    organization.users.set([admin, viewer])
    other = Organization.objects.create(name="South")
    other.users.add(viewer)

    response = csrf_delete(
        logged_in_client(root),
        reverse(
            "organization-detail",
            kwargs={"organization_id": organization.pk},
        ),
    )

    assert response.status_code == 204
    assert not Organization.objects.filter(pk=organization.pk).exists()
    assert Organization.objects.filter(pk=other.pk).exists()
    assert User.objects.filter(pk__in=[admin.pk, viewer.pk]).count() == 2


@pytest.mark.django_db
@pytest.mark.api
def test_organization_delete_refuses_non_superadmins_and_unknown_targets() -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    route = reverse(
        "organization-detail",
        kwargs={"organization_id": organization.pk},
    )

    admin_response = csrf_delete(logged_in_client(admin), route)
    coach_response = csrf_delete(logged_in_client(coach), route)
    missing = csrf_delete(
        logged_in_client(root),
        reverse("organization-detail", kwargs={"organization_id": 99999}),
    )

    assert admin_response.status_code == 403
    assert coach_response.status_code == 403
    assert missing.status_code == 404
    assert Organization.objects.filter(pk=organization.pk).exists()
