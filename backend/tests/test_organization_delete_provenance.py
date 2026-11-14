from unittest.mock import patch

import pytest
from django.db import IntegrityError

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry, LogEntry
from journals.services import record_activity, record_log
from notifications.models import EmailNotification
from tests.identity_helpers import create_superuser, create_user
from tests.isolation_helpers import business_snapshot
from tests.managed_user_helpers import csrf_post
from tests.organization_delete_helpers import assert_refused, delete
from tests.test_organization_delete import logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_real_creation_then_deletion_preserves_origin_names_and_residual_scope():
    root = create_superuser()
    admin = create_user("owner", Role.ADMIN)
    other_admin = create_user("other", Role.ADMIN)
    client = logged_in_client(root)
    created = csrf_post(
        client, "/api/admin/organizations/", {"name": "Homonym", "user_ids": [admin.pk]}
    )
    assert created.status_code == 201
    organization = Organization.objects.get(pk=created.json()["id"])
    origin = organization.pk
    other = Organization.objects.create(name="Homonym")
    other.users.add(other_admin)
    record_log(organization=organization, level="INFO", source="organizations", message="Before")
    original_ids = set(
        ActivityEntry.objects.filter(organization=organization).values_list("id", flat=True)
    )
    organization.name = "Renamed"
    organization.save()
    admin_client = logged_in_client(admin)
    assert delete(client, organization).status_code == 204
    assert not admin.organizations.exists()
    for entry in ActivityEntry.objects.filter(pk__in=original_ids):
        assert entry.organization_id is None
        assert entry.organization_origin_id == origin
        assert entry.organization_name == "Homonym"
    success = ActivityEntry.objects.get(action=ActivityAction.ORGANIZATION_DELETED)
    assert success.organization_origin_id == origin
    assert success.organization_name == "Renamed"
    assert success.actor_id == root.pk
    http_log = LogEntry.objects.get(method="DELETE", status_code=204)
    assert http_log.organization_id is None
    assert http_log.organization_origin_id == origin
    for endpoint in ("activity-journal", "logs"):
        route = f"/api/admin/{endpoint}/?organization_origin_id={origin}"
        response = client.get(route)
        assert response.status_code == 200
        assert response.json()["count"] > 0
        assert all(row["organization_origin_id"] == origin for row in response.json()["results"])
        assert admin_client.get(route).status_code == 403
        assert logged_in_client(other_admin).get(route).json()["count"] == 0
        other.users.add(admin)
        assert admin_client.get(route).json()["count"] == 0
        other.users.remove(admin)


@pytest.mark.parametrize("model", [ActivityEntry, LogEntry])
def test_missing_or_inconsistent_origin_refuses_without_repairing_history(model):
    root = create_superuser()
    organization = Organization.objects.create(name="History")
    if model is ActivityEntry:
        entry = record_activity(
            actor=root,
            organization=organization,
            action=ActivityAction.ORGANIZATION_CREATED,
            description="Before",
        )
    else:
        entry = record_log(
            organization=organization, level="INFO", source="system", message="Before"
        )
    for origin in (None, organization.pk + 100):
        model.objects.filter(pk=entry.pk).update(organization_origin_id=origin)
        assert_refused(organization, "provenance", root)


def test_personal_notification_does_not_block_and_account_is_not_changed():
    root = create_superuser()
    admin = create_user("owner", Role.ADMIN)
    organization = Organization.objects.create(name="Empty")
    organization.users.add(admin)
    notification = EmailNotification.objects.create(user=admin, recipient="owner@example.com")
    client = logged_in_client(root)
    before = type(admin).objects.values().get(pk=admin.pk)
    assert delete(client, organization).status_code == 204
    notification.refresh_from_db()
    admin.refresh_from_db()
    assert notification.user_id == admin.pk and notification.state == "pending"
    assert type(admin).objects.values().get(pk=admin.pk) == before


def test_failure_after_physical_delete_rolls_back_members_and_success_activity():
    root = create_superuser()
    admin = create_user("owner", Role.ADMIN)
    organization = Organization.objects.create(name="Atomic")
    organization.users.add(admin)
    client = logged_in_client(root)
    before = business_snapshot()
    original = Organization.delete

    def fail(instance, *args, **kwargs):
        original(instance, *args, **kwargs)
        raise RuntimeError("Failure before commit")

    with patch.object(Organization, "delete", fail):
        response = delete(client, organization)
    assert response.status_code == 500
    assert business_snapshot() == before
    assert not ActivityEntry.objects.filter(action=ActivityAction.ORGANIZATION_DELETED).exists()
    assert LogEntry.objects.filter(method="DELETE", status_code=500).exists()


def test_late_log_keeps_trusted_origin_even_when_its_loaded_organization_disappears():
    root = create_superuser()
    organization = Organization.objects.create(name="Gone")
    stale = Organization.objects.get(pk=organization.pk)
    origin = organization.pk
    assert delete(logged_in_client(root), organization).status_code == 204
    entry = record_log(organization=stale, level="INFO", source="system", message="Late response")
    assert entry.organization_id is None
    assert entry.organization_origin_id == origin
    assert entry.organization_name == "Gone"


@pytest.mark.django_db(transaction=True)
@pytest.mark.parametrize("linked", [False, True])
def test_unrelated_integrity_failure_does_not_produce_a_detached_success_log(linked):
    actor = create_user("removed", Role.VIEWER)
    stale = type(actor).objects.get(pk=actor.pk)
    actor.delete()
    organization = Organization.objects.create(name="Still here") if linked else None
    with pytest.raises(IntegrityError):
        record_log(
            actor=stale,
            organization=organization,
            level="INFO",
            source="system",
            message="No success",
        )
    assert not LogEntry.objects.exists()
