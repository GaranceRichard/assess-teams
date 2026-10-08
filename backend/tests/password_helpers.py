import pytest
from django.core import mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from identities.application.passwords import recovery_tokens
from identities.models import User
from tests.identity_helpers import TEST_CREDENTIAL
from tests.managed_user_helpers import csrf_post

NEW_CREDENTIAL = "Test-recovery-phrase-2026!"


@pytest.fixture
def password_context(settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.FRONTEND_URL = "https://public.example.com"
    user = User.objects.create_user(
        username="member", email="member@example.com", role="Viewer", password=TEST_CREDENTIAL
    )
    client = APIClient(enforce_csrf_checks=True)
    client.get(reverse("session-current"))
    return client, user


def reset_payload(user, password=NEW_CREDENTIAL):
    return {
        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
        "token": recovery_tokens.make_token(user),
        "password": password,
        "password_confirmation": password,
    }


def change_payload(current=TEST_CREDENTIAL, password=NEW_CREDENTIAL):
    return {"current_password": current, "password": password, "password_confirmation": password}


def post(client, name, data):
    return csrf_post(client, reverse(name), data)


def delivered_payload():
    link = next(word for word in mail.outbox[-1].body.split() if "/password/reset#" in word)
    uid, token = link.split("#")[1].split("/")
    return {
        "uid": uid,
        "token": token,
        "password": NEW_CREDENTIAL,
        "password_confirmation": NEW_CREDENTIAL,
    }
