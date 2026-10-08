import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from tests.identity_helpers import authenticate, create_superuser
from tests.password_helpers import post

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@pytest.mark.parametrize("weak", ["password", "123456789", "member123"])
def test_invitation_applies_same_policy_without_consuming_link(password_context, weak):
    client, user = password_context
    user.set_unusable_password()
    user.save()
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    route = reverse("invitation-accept", kwargs={"uid": uid, "token": token})
    response = client.post(
        route, {"password": weak}, format="json", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value
    )
    assert response.status_code == 400 and "password" in response.json()
    user.refresh_from_db()
    assert not user.has_usable_password()
    assert default_token_generator.check_token(user, token)


@pytest.mark.parametrize("weak", ["password", "123456789", "member123"])
def test_technical_creation_applies_same_policy(password_context, weak):
    client, _ = password_context
    create_superuser()
    authenticate(client, "root")
    response = post(
        client, "user-create", {"username": "member1234", "password": weak, "role": "Viewer"}
    )
    assert response.status_code == 400 and "password" in response.json()


def test_recovery_timeout_does_not_shorten_existing_invitations(password_context):
    from datetime import datetime, timedelta
    from unittest.mock import patch

    from identities.application.passwords import recovery_tokens

    _, user = password_context
    user.set_unusable_password()
    user.save()
    start = datetime(2026, 10, 8, 12)
    with patch.object(default_token_generator, "_now", return_value=start):
        invitation = default_token_generator.make_token(user)
    with patch.object(recovery_tokens, "_now", return_value=start):
        recovery = recovery_tokens.make_token(user)
    with patch.object(default_token_generator, "_now", return_value=start + timedelta(hours=2)):
        assert default_token_generator.check_token(user, invitation)
    with patch.object(recovery_tokens, "_now", return_value=start + timedelta(hours=2)):
        assert not recovery_tokens.check_token(user, recovery)
    with patch.object(
        default_token_generator, "_now", return_value=start + timedelta(days=3, seconds=1)
    ):
        assert not default_token_generator.check_token(user, invitation)
