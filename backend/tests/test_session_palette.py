import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.palettes import InterfacePalette
from identities.domain.users import Role
from tests.identity_helpers import create_superuser, create_user
from tests.test_product_session import open_session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def patch_palette(client, data):
    return client.patch(
        reverse("session-current"),
        data,
        format="json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


@pytest.mark.parametrize("role", [*Role, None])
@pytest.mark.parametrize("palette", InterfacePalette.values())
def test_palette_is_personal_persistent_and_restored_on_new_session(role, palette):
    member = create_user("member", role) if role else create_superuser()
    other = create_user("other", Role.VIEWER)
    client = APIClient(enforce_csrf_checks=True)
    assert open_session(client, member.username).json()["interface_palette"] == "green"

    response = patch_palette(client, {"interface_palette": palette})

    assert response.status_code == 200
    assert response.json()["id"] == member.pk
    assert response.json()["interface_palette"] == palette
    member.refresh_from_db()
    other.refresh_from_db()
    assert member.interface_palette == palette
    assert other.interface_palette == "green"
    assert client.get(reverse("session-current")).json()["interface_palette"] == palette
    assert (
        client.post(
            reverse("session-logout"), HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value
        ).status_code
        == 204
    )

    fresh_browser = APIClient(enforce_csrf_checks=True)
    assert open_session(fresh_browser, member.username).json()["interface_palette"] == palette
    second_user = APIClient(enforce_csrf_checks=True)
    assert open_session(second_user, other.username).json()["interface_palette"] == "green"


@pytest.mark.parametrize(
    "data",
    [
        {},
        {"interface_palette": "purple"},
        {"interface_palette": "#123456"},
        {"interface_palette": ""},
        {"interface_palette": None},
        {"interface_palette": ["blue"]},
        {"interface_palette": "blue", "user_id": 999},
        {"interface_palette": "blue", "role": "Admin"},
        {"interface_palette": "blue", "organization_id": 999},
        ["blue"],
    ],
)
def test_invalid_preferences_are_refused_without_mutation(data):
    member = create_user("member", Role.VIEWER)
    client = APIClient(enforce_csrf_checks=True)
    open_session(client, member.username)

    response = patch_palette(client, data)

    assert response.status_code == 400
    assert response.json()
    member.refresh_from_db()
    assert member.interface_palette == "green"
    assert member.role == Role.VIEWER


def test_palette_requires_authentication_and_csrf():
    member = create_user("member", Role.VIEWER)
    client = APIClient(enforce_csrf_checks=True)
    assert client.patch(reverse("session-current"), {}).status_code == 403
    open_session(client, member.username)
    response = client.patch(reverse("session-current"), {"interface_palette": "red"}, format="json")
    assert response.status_code == 403
    member.refresh_from_db()
    assert member.interface_palette == "green"


def test_database_rejects_palette_outside_the_allowlist():
    member = create_user("member", Role.VIEWER)
    with pytest.raises(IntegrityError), transaction.atomic():
        type(member).objects.filter(pk=member.pk).update(interface_palette="css")
    member.refresh_from_db()
    assert member.interface_palette == "green"
