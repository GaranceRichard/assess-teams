import pytest
from django.core import mail
from django.urls import reverse

from identities.domain.users import Role
from identities.models import User
from tests.managed_user_helpers import (
    authenticated_superadmin_client,
    csrf_post,
    invitation_route,
)


@pytest.fixture(autouse=True)
def email_settings(settings) -> None:
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.FRONTEND_URL = "http://testserver"


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_invites_user_and_user_chooses_password(
    django_capture_on_commit_callbacks,
) -> None:
    client, _ = authenticated_superadmin_client()
    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(
            client,
            reverse("managed-user-list"),
            {"name": "Alice Martin", "email": "Alice@example.com", "role": Role.COACH.value},
        )

    user = User.objects.get(email="alice@example.com")
    assert response.status_code == 201
    assert response.json()["pending"] is True
    assert user.first_name == "Alice Martin"
    assert user.role == Role.COACH.value
    assert user.is_active and not user.has_usable_password()
    assert len(mail.outbox) == 1
    assert "http://testserver/invitation/" in mail.outbox[0].body

    client.logout()
    client.get(reverse("session-current"))
    acceptance = csrf_post(client, invitation_route(), {"password": "chosen-password"})

    user.refresh_from_db()
    assert acceptance.status_code == 204
    assert user.check_password("chosen-password")


@pytest.mark.django_db
@pytest.mark.api
def test_invitation_rejects_invalid_token_and_short_password(
    django_capture_on_commit_callbacks,
) -> None:
    client, _ = authenticated_superadmin_client()
    with django_capture_on_commit_callbacks(execute=True):
        csrf_post(
            client,
            reverse("managed-user-list"),
            {"name": "Alice", "email": "alice@example.com", "role": Role.VIEWER.value},
        )
    route = invitation_route()
    client.logout()
    client.get(reverse("session-current"))

    invalid = csrf_post(
        client, route.replace(route.split("/")[-2], "invalid"), {"password": "long-enough"}
    )
    too_short = csrf_post(client, route, {"password": "short"})

    assert invalid.status_code == 400
    assert too_short.status_code == 400
    assert not User.objects.get(email="alice@example.com").has_usable_password()


@pytest.mark.django_db
@pytest.mark.api
def test_invitation_rejects_duplicate_email_and_non_superadmin() -> None:
    client, _ = authenticated_superadmin_client()
    payload = {"name": "Alice", "email": "alice@example.com", "role": Role.ADMIN.value}
    assert csrf_post(client, reverse("managed-user-list"), payload).status_code == 201
    assert csrf_post(client, reverse("managed-user-list"), payload).status_code == 400

    credential = "viewer-credential"
    viewer = User.objects.create_user(
        username="viewer@example.com",
        email="viewer@example.com",
        role=Role.VIEWER.value,
        password=credential,
    )
    client.force_login(viewer)
    client.get(reverse("session-current"))
    assert csrf_post(client, reverse("managed-user-list"), payload).status_code == 403
