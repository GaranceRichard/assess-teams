import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import User
from tests.identity_helpers import TEST_CREDENTIAL, authenticate, create_superuser, valid_payload


@pytest.fixture
def authenticated_client() -> APIClient:
    client = APIClient()
    create_superuser()
    authenticate(client, "root")
    return client


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize(
    ("payload", "field"),
    [
        ({"username": "new-user", "password": TEST_CREDENTIAL}, "role"),
        (valid_payload(role=[Role.COACH.value, Role.VIEWER.value]), "role"),
        (valid_payload(role="Unknown"), "role"),
        (valid_payload(role="Superadmin"), "role"),
        (valid_payload(username=""), "username"),
        (valid_payload(username="invalid/name"), "username"),
        ({"username": "new-user", "password": "short", "role": "Viewer"}, "password"),
    ],
)
def test_invalid_required_data_or_role_is_rejected_without_creation(
    authenticated_client: APIClient,
    payload: dict,
    field: str,
) -> None:
    response = authenticated_client.post(reverse("user-create"), payload, format="json")

    assert response.status_code == 400
    assert field in response.json()
    assert User.objects.count() == 1


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_duplicate_identity_is_rejected_without_partial_creation(
    authenticated_client: APIClient,
) -> None:
    first = authenticated_client.post(reverse("user-create"), valid_payload())
    duplicate = authenticated_client.post(reverse("user-create"), valid_payload())

    assert first.status_code == 201
    assert duplicate.status_code == 400
    assert "username" in duplicate.json()
    assert User.objects.filter(username="new-user").count() == 1


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("forbidden_field", ["is_superuser", "is_staff", "is_active"])
def test_privilege_and_state_fields_are_refused(
    authenticated_client: APIClient,
    forbidden_field: str,
) -> None:
    payload = valid_payload()
    payload[forbidden_field] = True

    response = authenticated_client.post(reverse("user-create"), payload, format="json")

    assert response.status_code == 400
    assert forbidden_field in response.json()
    assert not User.objects.filter(username="new-user").exists()


@pytest.mark.django_db
@pytest.mark.api
def test_user_collection_does_not_expose_read_operation(
    authenticated_client: APIClient,
) -> None:
    response = authenticated_client.get(reverse("user-create"))

    assert response.status_code == 405


@pytest.mark.django_db
@pytest.mark.integration
def test_database_requires_one_role_for_non_superusers() -> None:
    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user(username="no-role", password=TEST_CREDENTIAL)


@pytest.mark.django_db
@pytest.mark.integration
def test_django_bootstrap_creates_superuser_without_business_role() -> None:
    superuser = create_superuser()

    assert superuser.is_superuser
    assert superuser.role is None
