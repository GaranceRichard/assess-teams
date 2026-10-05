import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from journals.models import LogEntry, LogLevel, LogSource
from journals.services import record_log
from teams.models import Team
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def client_for(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    LogEntry.objects.filter(method="GET", operation="session-current").delete()
    return client


def add_log(actor, organization, level, message, source=LogSource.SYSTEM):
    return record_log(
        actor=actor,
        organization=organization,
        level=level,
        source=source,
        operation=message,
        category="ValidationError",
        message=message,
    )


@pytest.mark.django_db
@pytest.mark.api
def test_log_scope_separates_organizations_and_system_logs() -> None:
    admin_a = create_user("admin-a", Role.ADMIN)
    admin_b = create_user("admin-b", Role.ADMIN)
    root = create_superuser()
    organization_a = Organization.objects.create(name="A")
    organization_b = Organization.objects.create(name="B")
    organization_a.users.add(admin_a)
    organization_b.users.add(admin_b)
    add_log(admin_a, organization_a, LogLevel.INFO, "Log A")
    add_log(admin_b, organization_b, LogLevel.WARNING, "Log B")
    add_log(None, None, LogLevel.ERROR, "Log système")
    entries_a = client_for(admin_a).get(reverse("logs")).json()
    entries_b = client_for(admin_b).get(reverse("logs")).json()
    all_entries = client_for(root).get(reverse("logs")).json()
    forced = client_for(admin_a).get(reverse("logs"), {"organization_id": organization_b.pk}).json()
    assert [entry["message"] for entry in entries_a["results"]] == ["Log A"]
    assert [entry["message"] for entry in entries_b["results"]] == ["Log B"]
    assert forced["count"] == 0
    assert all_entries["count"] == 5
    assert any(entry["organization_name"] == "" for entry in all_entries["results"])


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_failed_operation_records_sanitized_error_for_its_organization() -> None:
    admin = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="DEDN")
    organization.users.add(admin)
    client = client_for(admin)
    secret = "password=private-token; cookie=session-secret"
    response = csrf_post(
        client,
        reverse("team-list", kwargs={"organization_id": organization.pk}),
        {"name": secret, "coach_ids": [99999]},
    )
    entry = LogEntry.objects.get(method="POST")
    payload = client.get(reverse("logs")).json()["results"][0]
    assert response.status_code == 400
    assert entry.level == LogLevel.WARNING
    assert entry.source == LogSource.TEAMS
    assert entry.organization == organization
    assert entry.actor == admin
    assert secret not in str(payload)
    assert not {"traceback", "token", "cookie", "password"} & set(
        str(payload).lower().replace("=", " ").replace(";", " ").split()
    )
    assert set(payload) == {
        "id",
        "created_at",
        "organization_id",
        "organization_name",
        "actor_name",
        "team_name",
        "actor_id",
        "team_id",
        "evaluation_id",
        "evaluation_name",
        "method",
        "status_code",
        "level",
        "source",
        "operation",
        "category",
        "message",
        "correlation_id",
    }


@pytest.mark.django_db
@pytest.mark.api
def test_logs_are_ordered_paginated_filtered_and_read_only() -> None:
    admin = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    for number in range(21):
        add_log(
            admin,
            organization,
            LogLevel.ERROR if number == 20 else LogLevel.INFO,
            f"Événement {number}",
            LogSource.ASSESSMENTS,
        )
    client = client_for(admin)
    route = reverse("logs")
    first = client.get(route).json()
    second = client.get(route, {"page": 2, "source": LogSource.ASSESSMENTS}).json()
    filtered = client.get(route, {"level": LogLevel.ERROR, "source": LogSource.ASSESSMENTS}).json()
    csrf = client.cookies["csrftoken"].value
    assert first["count"] == 21
    assert first["results"][0]["message"] == "Événement 20"
    assert second["results"][0]["message"] == "Événement 0"
    assert [entry["level"] for entry in filtered["results"]] == [LogLevel.ERROR]
    assert client.get(route, {"level": "DEBUG"}).status_code == 400
    assert client.post(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert client.put(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert client.patch(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert client.delete(route, HTTP_X_CSRFTOKEN=csrf).status_code == 405


@pytest.mark.django_db
@pytest.mark.api
def test_logs_refuse_non_admin() -> None:
    viewer = create_user("viewer", Role.VIEWER)
    assert client_for(viewer).get(reverse("logs")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_log_snapshots_survive_related_objects_deletion() -> None:
    root = create_superuser()
    organization = Organization.objects.create(name="Legacy")
    team = Team.objects.create(name="BI", organization=organization)
    entry = record_log(
        level=LogLevel.WARNING,
        source=LogSource.TEAMS,
        message="Équipe sans coach.",
        actor=root,
        organization=organization,
        team=team,
    )
    root.delete()
    organization.delete()
    entry.refresh_from_db()
    response = client_for(create_superuser("new-root")).get(
        reverse("logs"),
        {"level": LogLevel.WARNING},
    )
    assert entry.actor is None
    assert entry.organization is None
    assert entry.team is None
    assert entry.actor_name == "Superadmin"
    assert entry.organization_name == "Legacy"
    assert entry.team_name == "BI"
    assert response.json()["count"] == 1
