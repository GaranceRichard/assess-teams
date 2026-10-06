import pytest
from django.urls import reverse

from identities.domain.users import Role
from identities.models import Organization, User
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_user
from tests.managed_user_helpers import authenticated_superadmin_client, csrf_post, csrf_put
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def activation(client, user, active=False):
    return csrf_post(
        client,
        reverse("user-reactivate" if active else "user-deactivate", kwargs={"user_id": user.pk}),
        {},
    )


def test_lifecycle_is_reversible_and_idempotent_with_journal_and_identity_preserved():
    client, root = authenticated_superadmin_client()
    user = create_user("member", Role.COACH)
    organization = Organization.objects.create(name="North")
    organization.users.add(user)
    original = (user.pk, user.username, user.email, user.role)
    assert activation(client, user).status_code == 200
    assert activation(client, user).status_code == 200
    user.refresh_from_db()
    assert not user.is_active
    assert (user.pk, user.username, user.email, user.role) == original
    assert list(user.organizations.all()) == [organization]
    assert activation(client, user, True).status_code == 200
    assert activation(client, user, True).status_code == 200
    user.refresh_from_db()
    assert user.is_active
    entries = ActivityEntry.objects.filter(
        action__in=[ActivityAction.USER_DEACTIVATED, ActivityAction.USER_REACTIVATED]
    )
    assert entries.count() == 2
    assert all(
        entry.actor_id == root.pk
        and entry.organization_id == organization.pk
        and entry.target_user_id == user.pk
        and entry.target_user_name == user.username
        for entry in entries
    )


@pytest.mark.parametrize("operation", ["deactivate", "demote", "put-inactive", "detach"])
def test_last_active_admin_refusal_is_atomic(operation):
    client, _ = authenticated_superadmin_client()
    admin = create_user("admin", Role.ADMIN)
    inactive = create_user("inactive", Role.ADMIN, is_active=False)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin, inactive)
    before = ActivityEntry.objects.count()
    if operation == "deactivate":
        response = activation(client, admin)
    elif operation == "detach":
        response = csrf_put(
            client,
            reverse("organization-members", kwargs={"organization_id": organization.pk}),
            {"user_ids": [inactive.pk]},
        )
    else:
        data = {"identifier": "changed", "email": "changed@example.com"}
        data.update({"role": "Coach"} if operation == "demote" else {"is_active": False})
        response = csrf_put(
            client, reverse("managed-user-detail", kwargs={"user_id": admin.pk}), data
        )
    assert response.status_code == 400
    assert "autre Admin" in str(response.json())
    admin.refresh_from_db()
    assert admin.is_active and admin.role == "Admin" and admin.username == "admin"
    assert set(organization.users.all()) == {admin, inactive}
    assert ActivityEntry.objects.count() == before


def test_superadmin_can_manage_admin_after_explicit_replacement():
    client, _ = authenticated_superadmin_client()
    first, second = create_user("first", Role.ADMIN), create_user("second", Role.ADMIN)
    organization = Organization.objects.create(name="North")
    organization.users.add(first, second)
    assert activation(client, first).status_code == 200
    assert activation(client, second).status_code == 400
    assert activation(client, first, True).status_code == 200
    assert activation(client, second).status_code == 200


@pytest.mark.parametrize(
    "role,target_role,status",
    [
        (Role.ADMIN, Role.ADMIN, 403),
        (Role.COACH, Role.COACH, 403),
        (Role.VIEWER, Role.VIEWER, 403),
        (Role.ADMIN, Role.COACH, 200),
        (Role.COACH, Role.VIEWER, 200),
    ],
)
def test_existing_authorities_also_govern_reactivation(role, target_role, status):
    actor = create_user("actor", role)
    target = create_user("target", target_role)
    organization = Organization.objects.create(name="North")
    organization.users.add(actor, target)
    client = client_for(actor)
    assert activation(client, target).status_code == status
    target.is_active = False
    target.save(update_fields=["is_active"])
    expected = 404 if status == 403 and role != Role.VIEWER else status
    assert activation(client, target, True).status_code == expected


def test_reactivation_refuses_legacy_identity_conflict_and_multi_membership():
    client, _ = authenticated_superadmin_client()
    target = create_user("target", Role.COACH, is_active=False)
    target.email = "target@example.com"
    target.save(update_fields=["email"])
    first = Organization.objects.create(name="First")
    second = Organization.objects.create(name="Second")
    first.users.add(target)
    second.users.add(target)
    assert activation(client, target, True).status_code == 400
    second.users.remove(target)
    peer = create_user("peer", Role.VIEWER)
    peer.email = target.email
    peer.save(update_fields=["email"])
    assert activation(client, target, True).status_code == 400
    peer.email = "other@example.com"
    peer.save(update_fields=["email"])
    assert activation(client, target, True).status_code == 200
    assert User.objects.filter(pk=target.pk, is_active=True).exists()


def test_cross_organization_and_self_activation_are_refused():
    client, root = authenticated_superadmin_client()
    assert activation(client, root).status_code == 403
    assert activation(client, root, True).status_code == 403
    actor = create_user("admin", Role.ADMIN)
    target = create_user("target", Role.VIEWER, is_active=False)
    Organization.objects.create(name="North").users.add(actor)
    Organization.objects.create(name="South").users.add(target)
    assert activation(client_for(actor), target, True).status_code == 404


def test_put_can_correct_a_legacy_mail_conflict_and_reactivate_atomically():
    client, _ = authenticated_superadmin_client()
    target = create_user("target", Role.VIEWER, is_active=False)
    peer = create_user("peer", Role.VIEWER)
    for user in (target, peer):
        user.email = "shared@example.com"
        user.save(update_fields=["email"])
    response = csrf_put(
        client,
        reverse("managed-user-detail", kwargs={"user_id": target.pk}),
        {
            "identifier": "target",
            "email": "unique@example.com",
            "is_active": True,
        },
    )
    assert response.status_code == 200
    target.refresh_from_db()
    assert target.is_active and target.email == "unique@example.com"


def test_new_organization_requires_active_business_admin_and_is_atomic():
    client, root = authenticated_superadmin_client()
    coach = create_user("coach", Role.COACH)
    inactive = create_user("inactive", Role.ADMIN, is_active=False)
    for member in (root, coach, inactive):
        response = csrf_post(
            client,
            reverse("organization-list"),
            {
                "name": "Invalid",
                "user_ids": [member.pk],
            },
        )
        assert response.status_code == 400
        assert not Organization.objects.exists()
        assert not member.organizations.exists()
