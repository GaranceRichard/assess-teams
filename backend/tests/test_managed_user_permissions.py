import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization, User
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def logged_in_client(user: User) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def delete(client: APIClient, user: User):
    return client.delete(
        reverse("managed-user-detail", kwargs={"user_id": user.pk}),
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


def update(client: APIClient, user: User, role: Role | None = None):
    payload = {
        "identifier": f"{user.username}-updated",
        "email": f"{user.username}-updated@example.com",
    }
    if role:
        payload["role"] = role.value
    return csrf_put(
        client,
        reverse("managed-user-detail", kwargs={"user_id": user.pk}),
        payload,
    )


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH])
def test_admin_and_coach_list_every_user(role: Role) -> None:
    create_superuser()
    actor = create_user("actor", role)
    viewer = create_user("viewer", Role.VIEWER)

    response = logged_in_client(actor).get(reverse("managed-user-list"))

    assert response.status_code == 200
    assert {entry["id"] for entry in response.json()} == {
        actor.pk,
        viewer.pk,
        User.objects.get(is_superuser=True).pk,
    }


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_invites_and_changes_only_coach_or_viewer() -> None:
    admin = create_user("admin", Role.ADMIN)
    client = logged_in_client(admin)
    route = reverse("managed-user-list")
    coach_payload = {
        "identifier": "invited-coach",
        "email": "coach@example.com",
        "role": Role.COACH.value,
    }

    allowed = csrf_post(client, route, coach_payload)
    forbidden = csrf_post(
        client,
        route,
        {**coach_payload, "identifier": "admin-2", "email": "admin@example.com", "role": "Admin"},
    )
    coach = User.objects.get(username="invited-coach")
    changed = update(client, coach, Role.VIEWER)

    coach.refresh_from_db()
    assert allowed.status_code == 201
    assert forbidden.status_code == 403
    assert changed.status_code == 200
    assert coach.role == Role.VIEWER.value


@pytest.mark.django_db
@pytest.mark.api
def test_admin_cannot_manage_admin_or_promote_viewer() -> None:
    actor = create_user("actor", Role.ADMIN)
    other_admin = create_user("other-admin", Role.ADMIN)
    viewer = create_user("viewer", Role.VIEWER)
    client = logged_in_client(actor)

    assert update(client, other_admin).status_code == 403
    assert delete(client, other_admin).status_code == 403
    assert update(client, viewer, Role.ADMIN).status_code == 403
    assert User.objects.filter(pk=other_admin.pk).exists()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_coach_updates_and_deletes_viewer_without_changing_role() -> None:
    coach = create_user("coach", Role.COACH)
    viewer = create_user("viewer", Role.VIEWER)
    client = logged_in_client(coach)

    changed = update(client, viewer)
    viewer.refresh_from_db()
    removed = delete(client, viewer)

    assert changed.status_code == 200
    assert viewer.role == Role.VIEWER.value
    assert removed.status_code == 204
    assert not User.objects.filter(pk=viewer.pk).exists()


@pytest.mark.django_db
@pytest.mark.api
def test_coach_cannot_promote_viewer_or_manage_coach() -> None:
    actor = create_user("actor", Role.COACH)
    other_coach = create_user("other-coach", Role.COACH)
    viewer = create_user("viewer", Role.VIEWER)
    client = logged_in_client(actor)

    assert update(client, viewer, Role.COACH).status_code == 403
    assert update(client, other_coach).status_code == 403
    assert delete(client, other_coach).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_superadmin_cannot_update_or_delete_self() -> None:
    root = create_superuser()
    client = logged_in_client(root)

    assert update(client, root).status_code == 403
    assert delete(client, root).status_code == 403
    assert User.objects.filter(pk=root.pk).exists()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_role_change_refuses_multi_organization_coach_or_viewer(role) -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    first = Organization.objects.create(name="First")
    second = Organization.objects.create(name="Second")
    first.users.add(admin)
    second.users.add(admin)

    response = update(logged_in_client(root), admin, role)

    admin.refresh_from_db()
    assert response.status_code == 400
    assert admin.role == Role.ADMIN.value
    assert admin.organizations.count() == 2


@pytest.mark.django_db
@pytest.mark.api
def test_viewer_cannot_open_user_management() -> None:
    viewer = create_user("viewer", Role.VIEWER)

    response = logged_in_client(viewer).get(reverse("managed-user-list"))

    assert response.status_code == 403
