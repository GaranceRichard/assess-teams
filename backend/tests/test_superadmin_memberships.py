import pytest
from django.core.exceptions import ValidationError
from django.db import transaction
from django.urls import reverse

from identities.adapters.api.admin_serializers import ManagedUserSerializer
from identities.adapters.api.organization_serializers import OrganizationSerializer
from identities.domain.users import Role
from identities.models import Organization
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.integration]


@pytest.mark.api
@pytest.mark.parametrize("operation", ["create", "members"])
def test_superadmin_membership_is_rejected_atomically(operation):
    root = create_superuser()
    admin = create_user("admin", Role.ADMIN)
    org = Organization.objects.create(name="Existing")
    org.users.add(admin)
    client = client_for(root)
    if operation == "create":
        response = csrf_post(
            client,
            reverse("organization-list"),
            {
                "name": "Blocked",
                "user_ids": [create_user("new-admin", Role.ADMIN).pk, root.pk],
            },
        )
    else:
        response = csrf_put(
            client,
            reverse(
                "organization-members",
                kwargs={
                    "organization_id": org.pk,
                },
            ),
            {"user_ids": [admin.pk, root.pk]},
        )
    assert response.status_code == 400
    assert "user_ids" in response.json()
    assert not root.organizations.exists()
    assert set(org.users.all()) == {admin}
    assert not Organization.objects.filter(name="Blocked").exists()


@pytest.mark.parametrize("reverse_relation", [False, True])
@pytest.mark.parametrize("method", ["add", "set"])
def test_orm_rejects_superadmin_membership_from_either_side(reverse_relation, method):
    root = create_superuser()
    org = Organization.objects.create(name="North")
    manager = root.organizations if reverse_relation else org.users
    target = org if reverse_relation else root
    with pytest.raises(ValidationError, match="Superadmin"), transaction.atomic():
        getattr(manager, method)([target] if method == "set" else target)
    assert not root.organizations.exists()


def test_promotion_requires_removing_membership_first():
    member = create_user("member", Role.ADMIN)
    org = Organization.objects.create(name="North")
    org.users.add(member)
    member.is_superuser, member.role = True, None
    with pytest.raises(ValidationError, match="Superadmin"):
        member.save()
    member.refresh_from_db()
    assert not member.is_superuser
    assert member.organizations.get() == org
    member.organizations.clear()
    member.is_superuser, member.role = True, None
    member.save()
    assert not member.organizations.exists()


def test_serializer_never_exposes_legacy_membership_as_superadmin_belonging():
    root = create_superuser()
    org = Organization.objects.create(name="Legacy")
    Organization.users.through.objects.create(user=root, organization=org)
    assert ManagedUserSerializer(root).data["organizations"] == []

    assert OrganizationSerializer(org).data["users"] == []
