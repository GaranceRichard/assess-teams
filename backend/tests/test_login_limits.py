from datetime import timedelta
from unittest.mock import patch

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.password_models import PasswordRateLimit
from tests.identity_helpers import TEST_CREDENTIAL, create_user

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.fixture(autouse=True)
def limits(settings):
    settings.LOGIN_ACCOUNT_LIMIT = 3
    settings.LOGIN_ORIGIN_LIMIT = 5
    settings.LOGIN_LIMIT_SECONDS = 60


def attempt(username="member", password="wrong", origin="192.0.2.1", **headers):
    client = APIClient(enforce_csrf_checks=True)
    client.get("/api/session/")
    return client.post(
        "/api/session/login/",
        {"username": username, "password": password},
        REMOTE_ADDR=origin,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
        **headers,
    )


def test_account_limit_spans_origins_blocks_valid_login_and_expires():
    create_user("member", Role.VIEWER)
    now = timezone.now()
    with patch("identities.application.login_limits.timezone.now", return_value=now):
        assert attempt(origin="192.0.2.1").status_code == 401
        assert attempt(origin="192.0.2.2").status_code == 401
        restricted = attempt(origin="192.0.2.3")
        assert restricted.status_code == 429
        assert restricted["Retry-After"] == "60"
        counts = list(PasswordRateLimit.objects.values_list("count", flat=True))
        with patch("identities.application.login_limits.authenticate") as authenticate:
            denied = attempt(password=TEST_CREDENTIAL, origin="192.0.2.4")
            assert denied.status_code == 429
            assert denied.json() == restricted.json()
            authenticate.assert_not_called()
        assert list(PasswordRateLimit.objects.values_list("count", flat=True)) == counts
        assert "sessionid" not in denied.cookies
    with patch(
        "identities.application.login_limits.timezone.now", return_value=now + timedelta(seconds=60)
    ):
        assert attempt(password=TEST_CREDENTIAL).status_code == 200


def test_origin_limit_spans_accounts_success_does_not_clear_origin_failures():
    create_user("member", Role.COACH)
    for index in range(4):
        assert attempt(username=f"absent-{index}").status_code == 401
    assert attempt(password=TEST_CREDENTIAL).status_code == 200
    assert attempt(username="another-absent").status_code == 429
    assert attempt(password=TEST_CREDENTIAL).status_code == 429
    assert attempt(password=TEST_CREDENTIAL, origin="192.0.2.2").status_code == 200
    # Rejected spraying cannot grow persistent storage with new identifiers.
    count = PasswordRateLimit.objects.count()
    assert attempt(username="yet-another").status_code == 429
    assert PasswordRateLimit.objects.count() == count


@pytest.mark.parametrize("kind", ["active", "inactive", "pending", "absent"])
def test_failures_do_not_reveal_account_existence(kind):
    if kind != "absent":
        user = create_user("member", Role.VIEWER, is_active=kind != "inactive")
        if kind == "pending":
            user.set_unusable_password()
            user.save()
    responses = [attempt() for _ in range(3)]
    assert [response.status_code for response in responses] == [401, 401, 429]
    assert responses[0].json() == {"detail": "Identifiant ou mot de passe invalide."}
    assert responses[-1]["Retry-After"] in {"59", "60"}
    assert "member" not in str(responses[-1].json())
    assert all("sessionid" not in response.cookies for response in responses)
    assert all("member" not in bucket.key for bucket in PasswordRateLimit.objects.all())


def test_success_resets_account_failures_and_preserves_password_spaces():
    create_user("member", Role.ADMIN)
    assert attempt().status_code == 401
    assert attempt(password=TEST_CREDENTIAL).status_code == 200
    assert attempt().status_code == 401
    assert attempt().status_code == 401
    assert attempt(password=f" {TEST_CREDENTIAL} ").status_code == 429


def test_identifiers_share_normalized_limit_and_csrf_is_preserved():
    assert attempt(username="Member").status_code == 401
    assert attempt(username="ｍｅｍｂｅｒ").status_code == 401
    assert attempt().status_code == 429
    client = APIClient(enforce_csrf_checks=True)
    assert (
        client.post("/api/session/login/", {"username": "member", "password": "wrong"}).status_code
        == 403
    )
