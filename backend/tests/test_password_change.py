import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.models import Organization, User
from journals.models import LogEntry
from tests.identity_helpers import TEST_CREDENTIAL
from tests.password_helpers import (
    NEW_CREDENTIAL,
    change_payload,
    post,
    reset_payload,
)

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@pytest.mark.parametrize("role", ["Viewer", "Coach", "Admin", "Superadmin"])
def test_every_role_can_change_only_its_own_password_and_keep_current_session(
    password_context, role
):
    client, user = password_context
    user.role = None if role == "Superadmin" else role
    user.is_superuser = role == "Superadmin"
    user.is_staff = role == "Superadmin"
    user.save()
    if role != "Superadmin":
        organization = Organization.objects.create(name="Own organization")
        organization.users.add(user)
    memberships = list(user.organizations.values_list("pk", flat=True))
    foreign = User.objects.create_user(username="foreign", role="Viewer", password=TEST_CREDENTIAL)
    other = APIClient()
    other.force_login(user)
    client.force_login(user)
    client.get(reverse("session-current"))
    token = reset_payload(user)
    before_session = client.cookies["sessionid"].value
    response = post(client, "session-password", change_payload())
    assert response.status_code == 204 and response.content == b""
    assert client.cookies["sessionid"].value != before_session
    assert client.get(reverse("session-current")).status_code == 200
    assert other.get(reverse("session-current")).status_code == 403
    assert post(client, "password-reset", token).status_code == 400
    user.refresh_from_db()
    foreign.refresh_from_db()
    assert user.check_password(NEW_CREDENTIAL) and foreign.check_password(TEST_CREDENTIAL)
    assert user.role == (None if role == "Superadmin" else role)
    assert user.is_superuser == (role == "Superadmin")
    assert list(user.organizations.values_list("pk", flat=True)) == memberships
    logs = str(list(LogEntry.objects.values()))
    assert NEW_CREDENTIAL not in logs and TEST_CREDENTIAL not in logs
    assert token["token"] not in logs


def test_password_change_requires_real_session_and_csrf(password_context):
    client, user = password_context
    assert post(client, "session-password", change_payload()).status_code == 403
    client.credentials(HTTP_AUTHORIZATION="Basic bWVtYmVyOnRlc3Qtb25seS1jcmVkZW50aWFs")
    assert post(client, "session-password", change_payload()).status_code == 403
    client.credentials()
    client.force_login(user)
    assert (
        client.post(reverse("session-password"), change_payload(), format="json").status_code == 403
    )
    user.is_active = False
    user.save()
    assert post(client, "session-password", change_payload()).status_code == 403


@pytest.mark.parametrize("kind", ["current", "confirmation", "weak", "target", "privileges"])
def test_change_refuses_invalid_password_or_target_without_side_effect(password_context, kind):
    client, user = password_context
    client.force_login(user)
    data = change_payload()
    if kind == "current":
        data["current_password"] = "wrong-test-only"
    elif kind == "confirmation":
        data["password_confirmation"] = "different-test-only"
    elif kind == "weak":
        weak_credential = "123456789"
        data.update(password=weak_credential, password_confirmation=weak_credential)
    elif kind == "target":
        data["user_id"] = 9999
    else:
        data.update(role="Admin", is_superuser=True, organizations=[1])
    response = post(client, "session-password", data)
    assert response.status_code == 400
    assert NEW_CREDENTIAL not in str(response.json()) and "wrong-test-only" not in str(
        response.json()
    )
    user.refresh_from_db()
    assert user.check_password(TEST_CREDENTIAL) and user.role == "Viewer"
    assert client.get(reverse("session-current")).status_code == 200


def test_change_throttles_failed_current_password_attempts(password_context):
    client, user = password_context
    client.force_login(user)
    for _ in range(5):
        assert (
            post(client, "session-password", change_payload(current="wrong-test-only")).status_code
            == 400
        )
    response = post(client, "session-password", change_payload())
    assert response.status_code == 429 and response["Retry-After"] == "900"
    user.refresh_from_db()
    assert user.check_password(TEST_CREDENTIAL)


def test_long_legacy_current_password_remains_usable_for_profile_change(password_context):
    client, user = password_context
    legacy_credential = "Legacy-test-long-phrase!" * 10
    user.set_password(legacy_credential)
    user.save(update_fields=["password"])
    client.force_login(user)
    assert (
        post(client, "session-password", change_payload(current=legacy_credential)).status_code
        == 204
    )
    user.refresh_from_db()
    assert user.check_password(NEW_CREDENTIAL)
