import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization, User
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_put


def client_for(user: User) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def update_payload(user: User, **changes) -> dict:
    return {
        "identifier": user.username,
        "email": user.email or f"{user.username}@example.com",
        **changes,
    }


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_scope_protects_peer_admins_and_other_organization_members() -> None:
    root = create_superuser()
    admin_a = create_user("admin-a", Role.ADMIN)
    admin_b = create_user("admin-b", Role.ADMIN)
    coach_a = create_user("coach-a", Role.COACH)
    viewer_a = create_user("viewer-a", Role.VIEWER)
    admin_c = create_user("admin-c", Role.ADMIN)
    admin_d = create_user("admin-d", Role.ADMIN)
    coach_b = create_user("coach-b", Role.COACH)
    viewer_b = create_user("viewer-b", Role.VIEWER)
    organization_a = Organization.objects.create(name="A")
    organization_b = Organization.objects.create(name="B")
    organization_a.users.set([admin_a, admin_b, coach_a, viewer_a])
    organization_b.users.set([admin_c, admin_d, coach_b, viewer_b])
    client = client_for(admin_a)

    visible_ids = {item["id"] for item in client.get(reverse("managed-user-list")).json()}
    assert visible_ids == {admin_a.pk, admin_b.pk, coach_a.pk, viewer_a.pk}
    protected_members = csrf_put(
        client,
        reverse("organization-members", kwargs={"organization_id": organization_a.pk}),
        {"user_ids": [root.pk, admin_a.pk, admin_b.pk, coach_a.pk, viewer_a.pk]},
    )
    assert protected_members.status_code == 400
    assert root not in organization_a.users.all()
    assert (
        csrf_put(
            client,
            reverse("managed-user-detail", kwargs={"user_id": viewer_a.pk}),
            update_payload(viewer_a, is_active=False),
        ).status_code
        == 200
    )
    assert (
        csrf_put(
            client,
            reverse("managed-user-detail", kwargs={"user_id": admin_b.pk}),
            update_payload(admin_b, is_active=False),
        ).status_code
        == 403
    )
    assert (
        csrf_put(
            client,
            reverse("managed-user-detail", kwargs={"user_id": viewer_b.pk}),
            update_payload(viewer_b, is_active=False),
        ).status_code
        == 404
    )
    assert (
        csrf_put(
            client,
            reverse("managed-user-detail", kwargs={"user_id": admin_a.pk}),
            update_payload(admin_a, role=Role.COACH.value),
        ).status_code
        == 403
    )

    admin_response = csrf_put(
        client_for(root),
        reverse("managed-user-detail", kwargs={"user_id": admin_b.pk}),
        update_payload(admin_b, is_active=False),
    )
    viewer_a.refresh_from_db()
    admin_b.refresh_from_db()
    assert not viewer_a.is_active
    assert admin_response.status_code == 200
    assert not admin_b.is_active
    root_client = client_for(root)
    deleted = root_client.delete(
        reverse("managed-user-detail", kwargs={"user_id": admin_b.pk}),
        HTTP_X_CSRFTOKEN=root_client.cookies["csrftoken"].value,
    )
    assert deleted.status_code == 204
    assert not User.objects.filter(pk=admin_b.pk).exists()
