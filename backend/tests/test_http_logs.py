from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from journals.models import ActivityEntry, LogEntry, LogLevel
from tests.identity_helpers import create_superuser
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def client_for(user):
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def assert_capture(response, method, status):
    assert response.status_code == status
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.method == method
    assert entry.status_code == status
    assert entry.level == (LogLevel.WARNING if status >= 400 else LogLevel.INFO)
    return entry


def test_successful_crud_and_business_activity_remain_distinct():
    organization, _, admin, _ = taking_context()
    client = client_for(admin)
    route = reverse("team-list", kwargs={"organization_id": organization.pk})
    before = LogEntry.objects.count()
    listed = assert_capture(client.get(route), "GET", 200)
    created = csrf_post(client, route, {"name": "HTTP team", "coach_ids": []})
    team_id = created.json()["id"]
    entry = assert_capture(created, "POST", 201)
    assert entry.organization == organization
    assert entry.actor == admin
    assert entry.team_id == team_id
    assert listed.organization == organization
    detail = reverse("team-detail", kwargs={"team_id": team_id})
    assert_capture(csrf_put(client, detail, {"name": "Renamed", "coach_ids": []}), "PUT", 200)
    assert_capture(
        client.delete(detail, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value), "DELETE", 204
    )
    assert LogEntry.objects.count() == before + 4
    assert ActivityEntry.objects.count() == 3


def test_evaluation_context_and_deleted_snapshot_are_preserved():
    organization, _, admin, _ = taking_context()
    client = client_for(admin)
    created = csrf_post(
        client,
        reverse("evaluation-list"),
        {"name": "HTTP model", "organization_id": organization.pk},
    )
    evaluation_id = created.json()["id"]
    entry = assert_capture(created, "POST", 201)
    assert entry.evaluation_id == evaluation_id
    assert entry.evaluation_name == "HTTP model"
    response = client.delete(
        reverse("evaluation-detail", kwargs={"evaluation_id": evaluation_id}),
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )
    deleted = assert_capture(response, "DELETE", 204)
    entry.refresh_from_db()
    assert entry.evaluation is None
    assert deleted.evaluation is None
    assert deleted.evaluation_name == entry.evaluation_name == "HTTP model"


def test_http_errors_are_safe_and_do_not_recurse(caplog):
    organization, _, admin, _ = taking_context()
    client = client_for(admin)
    route = reverse("team-list", kwargs={"organization_id": organization.pk})
    secret = "password=hidden-body; token=hidden-token; cookie=hidden-cookie"
    response = client.post(
        route + "?token=hidden-query",
        {"name": secret, "coach_ids": [99999]},
        format="json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
        HTTP_AUTHORIZATION="hidden-auth",
        HTTP_USER_AGENT="hidden-agent",
        REMOTE_ADDR="192.0.2.100",
    )
    warning = assert_capture(response, "POST", 400)
    assert warning.organization == organization
    client.raise_request_exception = False
    with patch(
        "teams.adapters.api.views.TeamListCreateView.get",
        side_effect=RuntimeError("hidden-exception"),
    ):
        failure = client.get(route)
    entry = LogEntry.objects.get(correlation_id=failure["X-Correlation-ID"])
    assert failure.status_code == entry.status_code == 500
    assert entry.level == LogLevel.ERROR
    assert str(entry.correlation_id) in caplog.text
    assert "hidden-exception" in caplog.text
    before = LogEntry.objects.count()
    assert client.get(reverse("logs")).status_code == 200
    assert LogEntry.objects.count() == before + 1
    payload = str(list(LogEntry.objects.values()))
    assert "hidden-" not in payload
    assert "192.0.2.100" not in payload


@pytest.mark.parametrize(
    "path", ["/api/health/", "/api/schema/", "/api/docs/", "/static/missing.css"]
)
def test_non_application_resources_are_excluded(path):
    APIClient().get(path)
    assert not LogEntry.objects.exists()


def test_anonymous_refusals_unknown_routes_and_logout_are_captured():
    anonymous = APIClient()
    denied = assert_capture(anonymous.get(reverse("logs")), "GET", 403)
    assert denied.actor is None
    assert_capture(anonymous.get("/api/missing/?token=hidden-query"), "GET", 404)
    root = create_superuser()
    client = client_for(root)
    logout = assert_capture(csrf_post(client, reverse("session-logout"), {}), "POST", 204)
    assert logout.actor == root
    assert_capture(
        client.patch(
            reverse("logs"), {}, format="json", HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value
        ),
        "PATCH",
        403,
    )


def test_cross_tenant_resource_attempt_does_not_enrich_with_foreign_context():
    own, _, admin, _ = taking_context("Own")
    foreign, _, _, run = taking_context("Foreign")
    client = client_for(admin)
    response = client.get(reverse("evaluation-run-detail", kwargs={"run_id": run.pk}))
    entry = assert_capture(response, "GET", 404)
    assert entry.organization == own
    assert entry.organization != foreign
    assert entry.team is None
    assert entry.evaluation is None
    assert "Foreign" not in str(entry.__dict__)


def test_new_version_route_records_the_created_evaluation_context():
    organization, _, admin, run = taking_context()
    response = csrf_post(
        client_for(admin),
        reverse("evaluation-new-version", kwargs={"evaluation_id": run.evaluation_id}),
        {},
    )
    entry = assert_capture(response, "POST", 201)
    assert entry.organization == organization
    assert entry.evaluation_id == response.json()["id"]
    assert entry.evaluation.version == 2
    assert entry.evaluation_name == response.json()["name"]
