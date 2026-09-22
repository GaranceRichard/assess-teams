import pytest
from django.core import mail
from django.urls import reverse

from identities.domain.users import Role
from identities.models import User
from tests.managed_user_helpers import authenticated_superadmin_client, csrf_put


@pytest.fixture(autouse=True)
def email_settings(settings) -> None:
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    settings.FRONTEND_URL = "http://testserver"


def create_managed_user(email: str = "member@example.com") -> User:
    credential = "member-credential"
    return User.objects.create_user(
        username=email,
        email=email,
        first_name="Initial Name",
        role=Role.VIEWER.value,
        password=credential,
    )


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_lists_all_users_with_status() -> None:
    client, root = authenticated_superadmin_client()
    active = create_managed_user()
    pending = User.objects.create_user(
        username="pending@example.com",
        email="pending@example.com",
        first_name="Pending",
        role=Role.COACH.value,
    )
    pending.set_unusable_password()
    pending.save()

    response = client.get(reverse("managed-user-list"))

    assert response.status_code == 200
    users = {entry["id"]: entry for entry in response.json()}
    assert users[root.pk]["user_type"] == "Superadmin"
    assert users[active.pk]["pending"] is False
    assert users[pending.pk]["pending"] is True


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_update_sends_notice_to_old_and_new_email(
    django_capture_on_commit_callbacks,
) -> None:
    client, _ = authenticated_superadmin_client()
    user = create_managed_user()

    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_put(
            client,
            reverse("managed-user-detail", kwargs={"user_id": user.pk}),
            {"name": "Updated Name", "email": "new@example.com"},
        )

    user.refresh_from_db()
    assert response.status_code == 200
    assert (user.first_name, user.email, user.username) == (
        "Updated Name",
        "new@example.com",
        "new@example.com",
    )
    assert len(mail.outbox) == 2
    assert {message.to[0] for message in mail.outbox} == {
        "member@example.com",
        "new@example.com",
    }
    assert "invitation/" not in mail.outbox[0].body


@pytest.mark.django_db
@pytest.mark.api
def test_update_same_email_sends_one_notice_and_rejects_duplicate(
    django_capture_on_commit_callbacks,
) -> None:
    client, _ = authenticated_superadmin_client()
    user = create_managed_user()
    create_managed_user("other@example.com")
    route = reverse("managed-user-detail", kwargs={"user_id": user.pk})

    with django_capture_on_commit_callbacks(execute=True):
        same = csrf_put(client, route, {"name": "Renamed", "email": user.email})
    duplicate = csrf_put(client, route, {"name": "Renamed", "email": "other@example.com"})

    assert same.status_code == 200
    assert mail.outbox[0].to == ["member@example.com"]
    assert duplicate.status_code == 400


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_delete_removes_user_and_sends_notice(django_capture_on_commit_callbacks) -> None:
    client, _ = authenticated_superadmin_client()
    user = create_managed_user()
    route = reverse("managed-user-detail", kwargs={"user_id": user.pk})

    with django_capture_on_commit_callbacks(execute=True):
        response = client.delete(
            route,
            HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
        )

    assert response.status_code == 204
    assert not User.objects.filter(pk=user.pk).exists()
    assert mail.outbox[0].to == ["member@example.com"]


@pytest.mark.django_db
@pytest.mark.api
def test_superadmin_cannot_delete_self() -> None:
    client, root = authenticated_superadmin_client()
    route = reverse("managed-user-detail", kwargs={"user_id": root.pk})

    response = client.delete(route, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)

    assert response.status_code == 400
    assert User.objects.filter(pk=root.pk).exists()


@pytest.mark.django_db
@pytest.mark.api
def test_missing_managed_user_returns_not_found() -> None:
    client, _ = authenticated_superadmin_client()
    route = reverse("managed-user-detail", kwargs={"user_id": 999_999})

    response = csrf_put(client, route, {"name": "Nobody", "email": "none@example.com"})

    assert response.status_code == 404
