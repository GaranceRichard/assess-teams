from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework.response import Response

from journals.log_context import describe_log_attempt
from journals.models import LogEntry, LogSource
from tests.managed_user_helpers import csrf_post
from tests.taking_helpers import taking_context
from tests.test_http_logs import assert_capture, client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_rolled_back_creation_still_records_a_safe_http_error():
    organization, _, admin, _ = taking_context()
    client = client_for(admin)
    client.raise_request_exception = False
    with patch(
        "teams.adapters.api.views.team_created", side_effect=RuntimeError("rollback-detail")
    ):
        response = csrf_post(
            client,
            reverse("team-list", kwargs={"organization_id": organization.pk}),
            {"name": "Rolled back", "coach_ids": []},
        )
    assert response.status_code == 500
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.status_code == 500
    assert entry.team is None
    assert entry.team_name == "Rolled back"
    assert not organization.teams.filter(name="Rolled back").exists()
    assert "rollback-detail" not in str(entry.__dict__)


def test_csrf_refusal_is_captured_once():
    organization, _, admin, _ = taking_context()
    client = client_for(admin)
    before = LogEntry.objects.count()
    response = client.post(
        reverse("team-list", kwargs={"organization_id": organization.pk}),
        {"name": "Refused", "coach_ids": []},
        format="json",
    )
    assert_capture(response, "POST", 403)
    assert LogEntry.objects.count() == before + 1


def test_inconsistent_context_is_cleared_before_storage():
    own, _, admin, own_run = taking_context("Own")
    foreign, _, _, foreign_run = taking_context("Other")
    client = client_for(admin)

    def forged(view, request, organization_id):
        describe_log_attempt(
            request,
            "trusted-route",
            LogSource.TEAMS,
            organization=foreign,
            team=foreign_run.team,
            evaluation=foreign_run.evaluation,
        )
        return Response([])

    route = reverse("team-list", kwargs={"organization_id": own.pk})
    with patch("teams.adapters.api.views.TeamListCreateView.get", forged):
        entry = assert_capture(client.get(route), "GET", 200)
    assert entry.organization == own
    assert entry.team is None
    assert entry.evaluation is None
    assert "Other" not in str(entry.__dict__)

    def inconsistent(view, request, organization_id):
        describe_log_attempt(
            request,
            "trusted-route",
            LogSource.TEAMS,
            organization=own,
            team=foreign_run.team,
            evaluation=foreign_run.evaluation,
        )
        return Response([])

    with patch("teams.adapters.api.views.TeamListCreateView.get", inconsistent):
        entry = assert_capture(client.get(route), "GET", 200)
    assert entry.organization == own
    assert entry.team is None
    assert entry.evaluation is None
    assert entry.team_name == entry.evaluation_name == ""
    assert own_run.team.organization_id == own.pk


def test_capture_storage_failure_does_not_break_api_response(caplog):
    _, _, admin, _ = taking_context()
    client = client_for(admin)
    with patch("journals.middleware.record_log", side_effect=RuntimeError("storage-error")):
        response = client.get(reverse("session-current"))
    assert response.status_code == 200
    assert response["X-Correlation-ID"] in caplog.text


def test_redirect_is_info_and_preflight_is_not_logged():
    client = client_for(taking_context()[2])
    response = assert_capture(client.get("/api/session"), "GET", 301)
    assert response.category == "http"
    before = LogEntry.objects.count()
    client.options(reverse("session-current"))
    assert LogEntry.objects.count() == before
