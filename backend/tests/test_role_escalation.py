import pytest
from django.urls import reverse

from identities.domain.users import Role
from tests.identity_helpers import create_user
from tests.isolation_helpers import business_snapshot, request, session
from tests.taking_helpers import revision_answers

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def update_payload(user, **extra):
    return {
        "identifier": f"{user.username}-changed",
        "email": f"changed-{user.pk}@example.com",
        **extra,
    }


@pytest.mark.parametrize("actor", ["root", "admin", "coach"])
@pytest.mark.parametrize(
    "extra",
    [
        {"is_superuser": True},
        {"is_staff": True},
        {"groups": [1]},
        {"user_permissions": [1]},
        {"role_id": 1},
        {"organizations": [1]},
    ],
    ids=["superuser", "staff", "groups", "permissions", "role-id", "membership"],
)
@pytest.mark.parametrize("operation", ["invite", "update"])
def test_forged_administrative_fields_are_rejected_atomically(isolation, actor, extra, operation):
    user = isolation.root if actor == "root" else getattr(isolation.a, actor)
    client = session(user)
    target = isolation.a.viewer
    if operation == "invite":
        url = reverse("managed-user-list")
        payload = {
            "identifier": "invited",
            "email": "invited@example.com",
            "role": "Viewer",
            **extra,
        }
        method = "post"
    else:
        url = reverse("managed-user-detail", kwargs={"user_id": target.pk})
        payload = update_payload(target, **extra)
        method = "put"
    before = business_snapshot()

    response = request(client, method, url, payload)

    assert response.status_code == 400
    assert business_snapshot() == before


@pytest.mark.parametrize("role", list(Role))
@pytest.mark.parametrize("target_name", ["self", "viewer"])
def test_role_promotion_cannot_partially_update_an_identity(isolation, role, target_name):
    actor = getattr(isolation.a, role.value.lower())
    target = actor if target_name == "self" else isolation.a.viewer
    client = session(actor)
    before = business_snapshot()

    response = request(
        client,
        "put",
        reverse("managed-user-detail", kwargs={"user_id": target.pk}),
        update_payload(target, role="Admin", is_active=False),
    )

    assert response.status_code == 403
    assert business_snapshot() == before


@pytest.mark.parametrize("active", [True, False])
@pytest.mark.parametrize("operation", ["update", "deactivate", "reactivate", "delete", "members"])
def test_admin_cannot_manage_a_peer_even_with_forged_fields(isolation, active, operation):
    side = isolation.a
    peer = create_user("peer-admin", Role.ADMIN, is_active=active)
    side.organization.users.add(peer)
    client = session(side.admin)
    kwargs = {"user_id": peer.pk}
    data = {}
    if operation == "members":
        url = reverse("organization-members", kwargs={"organization_id": side.organization.pk})
        method, expected = "put", 400
        data = {"user_ids": [side.admin.pk, side.coach.pk, side.viewer.pk]}
    elif operation == "update":
        url = reverse("managed-user-detail", kwargs=kwargs)
        method, expected = "put", 403
        data = update_payload(peer, role="Viewer", is_active=not active)
    elif operation == "delete":
        url = reverse("managed-user-detail", kwargs=kwargs)
        method, expected = "delete", 403
    else:
        url = reverse(f"user-{operation}", kwargs=kwargs)
        method, expected = "post", 403
        data = {"role": "Viewer", "user_id": side.viewer.pk}
    before = business_snapshot()

    response = request(client, method, url, data)

    assert response.status_code == (404 if not active and operation != "members" else expected)
    assert business_snapshot() == before


def test_current_session_obeys_a_role_change_without_reauthentication(isolation):
    side = isolation.a
    client = session(side.coach)
    root = session(isolation.root)
    url = reverse("managed-user-detail", kwargs={"user_id": side.coach.pk})
    payload = {"identifier": side.coach.username, "email": side.coach.email}

    assert client.get(reverse("managed-user-list")).status_code == 200
    assert request(root, "put", url, {**payload, "role": "Viewer"}).status_code == 200
    assert client.get(reverse("session-current")).json()["role"] == "Viewer"
    assert client.get(reverse("managed-user-list")).status_code == 403
    before = business_snapshot()
    assert request(client, "post", f"/api/evaluations/{side.waiting.pk}/").status_code == 403
    assert business_snapshot() == before

    assert request(root, "put", url, {**payload, "role": "Coach"}).status_code == 200
    assert client.get(reverse("session-current")).json()["role"] == "Coach"
    assert client.get(reverse("managed-user-list")).status_code == 200
    before = business_snapshot()
    response = request(
        client, "put", f"/api/evaluations/{side.run.pk}/revision/", revision_answers(side.run)
    )
    assert response.status_code == 403
    assert business_snapshot() == before
