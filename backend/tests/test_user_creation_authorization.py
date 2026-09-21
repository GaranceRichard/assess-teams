import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import User
from tests.identity_helpers import (
    TEST_CREDENTIAL,
    authenticate,
    create_superuser,
    create_user,
    valid_payload,
)


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", list(Role))
def test_superadmin_can_create_each_business_role(api_client: APIClient, role: Role) -> None:
    create_superuser()
    authenticate(api_client, "root")

    response = api_client.post(reverse("user-create"), valid_payload(role=role.value))

    assert response.status_code == 201
    created = User.objects.get(pk=response.json()["id"])
    assert response.json() == {
        "id": created.pk,
        "username": "new-user",
        "role": role.value,
        "is_active": True,
    }
    assert created.check_password(TEST_CREDENTIAL)
    assert not created.is_superuser


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_admin_can_create_coach_or_viewer(api_client: APIClient, role: Role) -> None:
    create_user("admin", Role.ADMIN)
    authenticate(api_client, "admin")

    response = api_client.post(reverse("user-create"), valid_payload(role=role.value))

    assert response.status_code == 201
    assert User.objects.get(username="new-user").role == role.value


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_cannot_create_admin(api_client: APIClient) -> None:
    create_user("admin", Role.ADMIN)
    authenticate(api_client, "admin")

    response = api_client.post(
        reverse("user-create"),
        valid_payload(role=Role.ADMIN.value),
    )

    assert response.status_code == 403
    assert not User.objects.filter(username="new-user").exists()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("caller_role", [Role.COACH, Role.VIEWER])
def test_coach_and_viewer_cannot_create_users(
    api_client: APIClient,
    caller_role: Role,
) -> None:
    create_user("caller", caller_role)
    authenticate(api_client, "caller")

    response = api_client.post(reverse("user-create"), valid_payload())

    assert response.status_code == 403
    assert not User.objects.filter(username="new-user").exists()


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.api
def test_anonymous_request_is_rejected(api_client: APIClient) -> None:
    response = api_client.post(reverse("user-create"), valid_payload())

    assert response.status_code == 401
    assert User.objects.count() == 0


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.api
def test_inactive_account_cannot_authenticate(api_client: APIClient) -> None:
    create_user("inactive-admin", Role.ADMIN, is_active=False)
    authenticate(api_client, "inactive-admin")

    response = api_client.post(reverse("user-create"), valid_payload())

    assert response.status_code == 401
    assert not User.objects.filter(username="new-user").exists()
