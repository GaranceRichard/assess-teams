import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def logged_in_client(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_creates_an_organization_with_several_users() -> None:
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    client = logged_in_client(root)

    response = csrf_post(
        client,
        reverse("organization-list"),
        {"name": "North", "user_ids": [admin.pk, coach.pk]},
    )

    organization = Organization.objects.get()
    assert response.status_code == 201
    assert response.json()["name"] == "North"
    assert {user["id"] for user in response.json()["users"]} == {admin.pk, coach.pk}
    assert set(organization.users.all()) == {admin, coach}


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_lists_only_its_organization_and_cannot_create_another() -> None:
    admin = create_user("admin", Role.ADMIN)
    peer = create_user("peer", Role.ADMIN)
    client = logged_in_client(create_superuser())
    route = reverse("organization-list")

    first = csrf_post(
        client,
        route,
        {"name": "East", "user_ids": [admin.pk, peer.pk]},
    )
    outsider = create_user("outsider", Role.ADMIN)
    second = csrf_post(client, route, {"name": "West", "user_ids": [outsider.pk]})
    admin_client = logged_in_client(admin)
    forbidden = csrf_post(admin_client, route, {"name": "Blocked", "user_ids": [admin.pk]})
    listed = admin_client.get(route)
    hidden_detail = admin_client.get(
        reverse("organization-detail", kwargs={"organization_id": second.json()["id"]})
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert forbidden.status_code == 403
    assert listed.status_code == 200
    assert [entry["name"] for entry in listed.json()] == ["East"]
    assert hidden_detail.status_code == 404
    assert admin.organizations.count() == 1
    assert peer.organizations.count() == 1


@pytest.mark.django_db
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH, Role.VIEWER])
def test_creation_refuses_a_second_organization_for_every_business_role(role) -> None:
    root = create_superuser()
    member = create_user("member", role)
    existing = Organization.objects.create(name="Existing")
    existing.users.add(member)

    response = csrf_post(
        logged_in_client(root),
        reverse("organization-list"),
        {"name": "Blocked", "user_ids": [member.pk]},
    )

    assert response.status_code == 400
    assert list(member.organizations.all()) == [existing]
    assert not Organization.objects.filter(name="Blocked").exists()


@pytest.mark.django_db
@pytest.mark.api
def test_organization_creation_refuses_unauthorized_or_invalid_requests() -> None:
    coach = create_user("coach", Role.COACH)
    client = logged_in_client(coach)
    route = reverse("organization-list")

    forbidden = csrf_post(client, route, {"name": "Blocked", "user_ids": [coach.pk]})
    client.logout()
    anonymous = client.get(route)

    root_client = logged_in_client(create_superuser())
    missing_users = csrf_post(root_client, route, {"name": "Empty", "user_ids": []})
    unknown_user = csrf_post(root_client, route, {"name": "Unknown", "user_ids": [99999]})

    assert forbidden.status_code == 403
    assert anonymous.status_code == 403
    assert missing_users.status_code == 400
    assert unknown_user.status_code == 400
    assert not Organization.objects.exists()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_adds_and_removes_organization_members() -> None:
    admin = create_user("admin", Role.ADMIN)
    peer = create_user("peer", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    viewer = create_user("viewer", Role.VIEWER)
    organization = Organization.objects.create(name="North")
    organization.users.set([admin, peer, coach])
    client = logged_in_client(admin)

    response = csrf_put(
        client,
        reverse("organization-members", kwargs={"organization_id": organization.pk}),
        {"user_ids": [admin.pk, peer.pk, viewer.pk]},
    )

    assert response.status_code == 200
    assert {user["id"] for user in response.json()["users"]} == {
        admin.pk,
        peer.pk,
        viewer.pk,
    }
    assert set(organization.users.all()) == {admin, peer, viewer}

    blocked = csrf_put(
        client,
        reverse("organization-members", kwargs={"organization_id": organization.pk}),
        {"user_ids": [admin.pk, viewer.pk]},
    )
    assert blocked.status_code == 400
    assert peer in organization.users.all()


@pytest.mark.django_db
@pytest.mark.api
def test_member_update_refuses_invalid_or_unauthorized_requests() -> None:
    admin = create_user("admin", Role.ADMIN)
    other_admin = create_user("other-admin", Role.ADMIN)
    coach = create_user("coach", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    other = Organization.objects.create(name="Other")
    other.users.add(coach)
    route = reverse(
        "organization-members",
        kwargs={"organization_id": organization.pk},
    )

    forbidden = csrf_put(logged_in_client(coach), route, {"user_ids": [coach.pk]})
    admin_client = logged_in_client(admin)
    empty = csrf_put(admin_client, route, {"user_ids": []})
    unknown = csrf_put(admin_client, route, {"user_ids": [99999]})
    last_admin = csrf_put(admin_client, route, {"user_ids": [coach.pk]})
    duplicate_membership = csrf_put(
        admin_client,
        route,
        {"user_ids": [admin.pk, coach.pk]},
    )
    missing = csrf_put(
        admin_client,
        reverse("organization-members", kwargs={"organization_id": 99999}),
        {"user_ids": [admin.pk]},
    )
    outside_scope = csrf_put(
        logged_in_client(other_admin),
        route,
        {"user_ids": [other_admin.pk]},
    )

    assert forbidden.status_code == 403
    assert empty.status_code == 400
    assert unknown.status_code == 400
    assert last_admin.status_code == 400
    assert duplicate_membership.status_code == 400
    assert missing.status_code == 404
    assert outside_scope.status_code == 404
    assert set(organization.users.all()) == {admin}
