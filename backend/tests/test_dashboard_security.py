import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.application.dashboard import dashboard_projection
from assessments.models import EvaluationRun, EvaluationRunState
from identities.domain.users import Role
from tests.identity_helpers import create_user
from tests.results_helpers import another_run, results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH, Role.VIEWER])
def test_scopes_reuse_results_and_ignore_forged_foreign_scope(role):
    org, coach, admin, own = results_context()
    foreign_org, _, _, foreign = results_context("Foreign")
    other = another_run(own)
    other.assignee = admin
    other.save()
    another_run(own, days=2, state=EvaluationRunState.IN_PROGRESS)
    viewer = create_user("viewer", Role.VIEWER)
    org.users.add(viewer)
    user = {Role.ADMIN: admin, Role.COACH: coach, Role.VIEWER: viewer}[role]
    client = client_for(user)
    payload = client.get(
        reverse("dashboard"), {"organization_id": foreign_org.pk, "run_id": foreign.pk}
    ).json()
    expected = {own.pk} if role == Role.COACH else {own.pk, other.pk}
    assert {e["run_id"] for e in payload["recent_activity"]} == expected
    assert {e["organization_id"] for e in payload["recent_activity"]} == {org.pk}
    assert payload["activity_scope"] == "accessible_results"
    if role == Role.VIEWER:
        assert payload["pending_assignments"] is None
        assert all(e["author_name"] is None for e in payload["recent_activity"])
        assert client.get("/api/evaluations/").status_code == 403
        assert client.get("/api/activity-journal/").status_code in (403, 404)
        assert client.get("/api/admin/users/").status_code == 403
    org.users.remove(user)
    empty = client.get(reverse("dashboard")).json()
    assert empty["recent_activity"] == []
    assert empty["profile"]["organization_name"] is None


@pytest.mark.parametrize("relation", ["team_id", "evaluation_id"])
@pytest.mark.parametrize("role", [Role.ADMIN, Role.COACH, Role.VIEWER])
def test_inconsistent_cross_organization_references_never_expose_activity(relation, role):
    org, coach, admin, own = results_context()
    _, _, _, foreign = results_context("Foreign")
    viewer = create_user("viewer", Role.VIEWER)
    org.users.add(viewer)
    user = {Role.ADMIN: admin, Role.COACH: coach, Role.VIEWER: viewer}[role]
    EvaluationRun.objects.filter(pk=own.pk).update(**{relation: getattr(foreign, relation)})
    assert dashboard_projection(user)["recent_activity"] == []


def test_coach_loses_activity_when_assignment_changes():
    _, coach, admin, run = results_context()
    EvaluationRun.objects.filter(pk=run.pk).update(assignee=admin)
    assert client_for(coach).get(reverse("dashboard")).json()["recent_activity"] == []


def test_absent_or_inactive_session_is_refused():
    assert APIClient().get(reverse("dashboard")).status_code == 403
    user = create_user("inactive", Role.VIEWER)
    client = client_for(user)
    user.is_active = False
    user.save()
    assert client.get(reverse("dashboard")).status_code == 403


@pytest.mark.parametrize("method", ["post", "put", "patch", "delete"])
def test_dashboard_refuses_every_mutation(method):
    _, _, admin, run = results_context()
    client = client_for(admin)
    csrf = {"HTTP_X_CSRFTOKEN": client.cookies["csrftoken"].value}
    assert (
        getattr(client, method)(reverse("dashboard"), {}, format="json", **csrf).status_code == 405
    )
    run.refresh_from_db()
    assert run.state == EvaluationRunState.COMPLETED


@pytest.mark.contract
def test_dashboard_openapi_is_read_only_and_documents_scope_and_provenance():
    client = APIClient()
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    path = schema["paths"]["/api/dashboard/"]
    assert set(path) == {"get"}
    operation = path["get"]
    assert set(operation["responses"]) == {"200", "403"}
    assert {"cookieAuth": []} in operation["security"]
    assert "parameters" not in operation
    for term in ("COMPLETED", "dernière révision", "auteurs masqués", "Coach", "10"):
        assert term in operation["description"]
    components = schema["components"]["schemas"]
    assert set(components["Dashboard"]["required"]) == {
        "profile",
        "activity_scope",
        "recent_activity",
        "pending_assignments",
    }
    assert components["DashboardActivity"]["properties"]["author_name"]["nullable"]
    assert client.get(reverse("swagger-ui")).status_code == 200


def test_profile_never_exposes_coached_teams_from_a_previous_organization():
    org, coach, _, run = results_context()
    other_org, _, _, other_run = results_context("Other")
    run.team.coaches.add(coach)
    client = client_for(coach)
    assert client.get(reverse("dashboard")).json()["profile"]["team_names"] == [run.team_name]
    org.users.remove(coach)
    other_org.users.add(coach)
    for url in (reverse("session-current"), reverse("dashboard")):
        payload = client.get(url).json()
        profile = payload["profile"] if "profile" in payload else payload
        assert profile["team_names"] == []
        assert profile["organization_name"] == "Other"
    other_run.team.coaches.add(coach)
    assert client.get(reverse("dashboard")).json()["profile"]["team_names"] == [other_run.team_name]
