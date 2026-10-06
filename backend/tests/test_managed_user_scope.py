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


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_coach_or_viewer_lists_only_organization_members(role: Role) -> None:
    create_superuser()
    actor = create_user("actor", role)
    peer_role = Role.VIEWER if role is Role.COACH else Role.COACH
    peer = create_user("peer", peer_role)
    create_user("outsider", Role.VIEWER)
    organization = Organization.objects.create(name="North")
    organization.users.add(actor, peer)

    response = logged_in_client(actor).get(reverse("managed-user-list"))

    if role is Role.VIEWER:
        assert response.status_code == 403
    else:
        assert response.status_code == 200
        assert {entry["id"] for entry in response.json()} == {actor.pk, peer.pk}


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_coach_or_viewer_without_organization_lists_nobody(role: Role) -> None:
    actor = create_user("actor", role)
    create_user("other", Role.VIEWER)

    response = logged_in_client(actor).get(reverse("managed-user-list"))

    if role is Role.VIEWER:
        assert response.status_code == 403
    else:
        assert response.status_code == 200
        assert response.json() == []


@pytest.mark.django_db
@pytest.mark.api
def test_coach_cannot_change_a_viewer_from_another_organization() -> None:
    coach = create_user("coach", Role.COACH)
    viewer = create_user("viewer", Role.VIEWER)
    Organization.objects.create(name="North").users.add(coach)
    Organization.objects.create(name="South").users.add(viewer)
    client = logged_in_client(coach)
    route = reverse("managed-user-detail", kwargs={"user_id": viewer.pk})
    payload = {"identifier": "changed", "email": "changed@example.com"}

    changed = csrf_put(client, route, payload)
    removed = client.delete(
        route,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )

    assert changed.status_code == 404
    assert removed.status_code == 404
    assert User.objects.filter(pk=viewer.pk, username="viewer").exists()


@pytest.mark.django_db
@pytest.mark.api
def test_viewer_cannot_access_organization_users() -> None:
    actor = create_user("actor", Role.VIEWER)
    peer = create_user("peer", Role.VIEWER)
    Organization.objects.create(name="North").users.add(actor, peer)
    client = logged_in_client(actor)
    assert client.get(reverse("managed-user-list")).status_code == 403
    detail = reverse("managed-user-detail", kwargs={"user_id": peer.pk})
    payload = {"identifier": "changed", "email": "changed@example.com"}

    created = csrf_post(
        client,
        reverse("managed-user-list"),
        {**payload, "role": Role.VIEWER.value},
    )
    changed = csrf_put(client, detail, payload)
    removed = client.delete(
        detail,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )

    assert {created.status_code, changed.status_code, removed.status_code} == {403}
    assert User.objects.filter(pk=peer.pk, username="peer").exists()
