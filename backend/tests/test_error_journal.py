import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import Organization
from journals.models import ErrorEntry
from journals.services import record_error
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post


def client_for(user) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


@pytest.mark.django_db
@pytest.mark.api
def test_error_scope_separates_organizations_and_system_errors() -> None:
    admin_a = create_user("admin-a", Role.ADMIN)
    admin_b = create_user("admin-b", Role.ADMIN)
    root = create_superuser()
    organization_a = Organization.objects.create(name="A")
    organization_b = Organization.objects.create(name="B")
    organization_a.users.add(admin_a)
    organization_b.users.add(admin_b)
    record_error(
        actor=admin_a,
        organization=organization_a,
        operation="Échec A",
        category="ValidationError",
        message="Message sûr",
    )
    record_error(
        actor=admin_b,
        organization=organization_b,
        operation="Échec B",
        category="ValidationError",
        message="Message sûr",
    )
    record_error(
        actor=None,
        organization=None,
        operation="Erreur interne lors du traitement",
        category="RuntimeError",
        message="Une erreur interne est survenue.",
    )

    entries_a = client_for(admin_a).get(reverse("error-journal")).json()
    entries_b = client_for(admin_b).get(reverse("error-journal")).json()
    all_entries = client_for(root).get(reverse("error-journal")).json()

    assert [entry["operation"] for entry in entries_a["results"]] == ["Échec A"]
    assert [entry["operation"] for entry in entries_b["results"]] == ["Échec B"]
    assert all_entries["count"] == 3
    assert all_entries["results"][0]["organization_name"] == ""


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
    entry = ErrorEntry.objects.get()
    payload = client.get(reverse("error-journal")).json()["results"][0]

    assert response.status_code == 400
    assert entry.organization == organization
    assert entry.actor == admin
    assert entry.operation == "Échec de création de l’équipe"
    assert secret not in str(payload)
    assert "traceback" not in str(payload).lower()
    assert set(payload) == {
        "id",
        "created_at",
        "organization_id",
        "organization_name",
        "actor_name",
        "team_name",
        "operation",
        "category",
        "message",
        "correlation_id",
    }


@pytest.mark.django_db
@pytest.mark.api
def test_error_journal_is_ordered_paginated_and_read_only() -> None:
    admin = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    for number in range(21):
        record_error(
            actor=admin,
            organization=organization,
            operation=f"Échec {number}",
            category="ValidationError",
            message="Message sûr",
        )
    client = client_for(admin)
    route = reverse("error-journal")

    first = client.get(route).json()
    second = client.get(route, {"page": 2}).json()
    csrf = client.cookies["csrftoken"].value

    assert first["count"] == 21
    assert first["results"][0]["operation"] == "Échec 20"
    assert second["results"][0]["operation"] == "Échec 0"
    assert client.post(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert client.put(route, {}, format="json", HTTP_X_CSRFTOKEN=csrf).status_code == 405
    assert client.delete(route, HTTP_X_CSRFTOKEN=csrf).status_code == 405


@pytest.mark.django_db
@pytest.mark.api
def test_error_journal_refuses_non_admin() -> None:
    viewer = create_user("viewer", Role.VIEWER)

    assert client_for(viewer).get(reverse("error-journal")).status_code == 403
