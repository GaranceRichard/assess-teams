from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from rest_framework.test import APIClient

from identities.application.passwords import recovery_tokens
from identities.models import Organization
from journals.models import LogEntry
from tests.identity_helpers import TEST_CREDENTIAL
from tests.password_helpers import (
    NEW_CREDENTIAL,
    post,
    reset_payload,
)

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


def test_reset_is_single_use_revokes_sessions_and_preserves_identity(password_context):
    client, user = password_context
    organization = Organization.objects.create(name="Own organization")
    organization.users.add(user)
    others = [APIClient(), APIClient()]
    for other in others:
        other.force_login(user)
    payload = reset_payload(user)
    before = (user.role, user.is_superuser, user.is_staff, user.interface_palette)
    assert post(client, "password-reset", payload).status_code == 204
    assert post(client, "password-reset", payload).status_code == 400
    assert client.get(reverse("session-current")).status_code == 403
    assert all(other.get(reverse("session-current")).status_code == 403 for other in others)
    user.refresh_from_db()
    assert user.check_password(NEW_CREDENTIAL)
    assert before == (user.role, user.is_superuser, user.is_staff, user.interface_palette)
    assert list(user.organizations.all()) == [organization]
    logs = str(list(LogEntry.objects.values()))
    assert payload["token"] not in logs and NEW_CREDENTIAL not in logs
    assert "password/reset#" not in logs


def test_token_expires_at_configured_timeout(password_context, settings):
    client, user = password_context
    settings.PASSWORD_RECOVERY_TIMEOUT = 3600
    start = datetime(2026, 10, 8, 12)
    with patch.object(recovery_tokens, "_now", return_value=start):
        payload = reset_payload(user)
    with patch.object(recovery_tokens, "_now", return_value=start + timedelta(seconds=3601)):
        assert post(client, "password-reset", payload).status_code == 400
    user.refresh_from_db()
    assert user.check_password(TEST_CREDENTIAL)


@pytest.mark.parametrize(
    "kind",
    [
        "uid",
        "nonexistent",
        "huge",
        "token",
        "inactive",
        "pending",
        "invitation",
        "changed",
        "login",
    ],
)
def test_invalid_links_are_indistinguishable_and_never_mutate(password_context, kind):
    client, user = password_context
    payload = reset_payload(user)
    if kind == "uid":
        payload["uid"] = "invalid!"
    elif kind == "nonexistent":
        payload["uid"] = "OTk5OTk5"
    elif kind == "huge":
        payload["uid"] = "OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5"
    elif kind == "token":
        payload["token"] = "bad"
    elif kind == "inactive":
        user.is_active = False
        user.save()
    elif kind == "pending":
        user.set_unusable_password()
        user.save()
    elif kind == "invitation":
        payload["token"] = default_token_generator.make_token(user)
    elif kind == "changed":
        user.set_password("Other-test-credential-2026!")
        user.save()
    else:
        other = APIClient()
        other.force_login(user)
    user.refresh_from_db()
    stored = user.password
    response = post(client, "password-reset", payload)
    assert response.status_code == 400
    assert response.json() == {
        "detail": ["Ce lien est invalide ou expiré. Demandez un nouveau lien."]
    }
    user.refresh_from_db()
    assert user.password == stored


@pytest.mark.parametrize(
    "password", ["short", "12345678901", "password", "member123", TEST_CREDENTIAL]
)
def test_password_policy_rejects_weak_similar_and_current_passwords(password_context, password):
    client, user = password_context
    response = post(client, "password-reset", reset_payload(user, password))
    assert response.status_code == 400 and "password" in response.json()
    user.refresh_from_db()
    assert user.check_password(TEST_CREDENTIAL)


def test_reset_rejects_confirmation_fields_csrf_and_abuse(password_context):
    client, user = password_context
    payload = reset_payload(user)
    assert client.post(reverse("password-reset"), payload, format="json").status_code == 403
    for invalid in [
        {**payload, "password_confirmation": "Mismatch-test-only"},
        {**payload, "user_id": user.pk},
        {},
    ]:
        assert post(client, "password-reset", invalid).status_code == 400
    payload["token"] = "bad"
    for _ in range(9):
        assert post(client, "password-reset", payload).status_code == 400
    assert post(client, "password-reset", payload).status_code == 429
    for number in range(17):
        assert post(client, "password-reset", {**payload, "uid": str(number)}).status_code == 400
    assert post(client, "password-reset", payload).status_code == 429
