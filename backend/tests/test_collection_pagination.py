import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from drf_spectacular.generators import SchemaGenerator

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import Evaluation, EvaluationSchedule
from identities.models import User
from teams.models import Team
from tests.taking_helpers import client_for, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api, pytest.mark.contract]


@pytest.fixture
def collections():
    org, coach, admin, run = taking_context()
    for index in range(1, 25):
        user = User.objects.create(username=f"member-{index:02}", role="Viewer")
        org.users.add(user)
        team = Team.objects.create(organization=org, name=f"Team-{index:02}")
        model = Evaluation.objects.create(
            organization=org, name=f"Model-{index:02}", index=index + 1, status="VALIDATED"
        )
        schedule = EvaluationSchedule.objects.create(
            team=team,
            evaluation=model,
            assignee=coach,
            mode="immediate",
            first_due_date=run.due_date,
        )
        ensure_expected_evaluation(schedule)
    taking_context("Outside")
    return org, coach, admin


def paths(org):
    return [
        "/api/admin/users/",
        f"/api/admin/organizations/{org.pk}/teams/",
        "/api/admin/evaluations/",
        "/api/admin/planning/",
        "/api/evaluations/",
    ]


def test_pages_are_disjoint_bounded_stable_and_scoped_before_serialization(collections):
    org, _, admin = collections
    client = client_for(admin)
    for path in paths(org):
        with CaptureQueriesContext(connection) as queries:
            first = client.get(path, {"page": 1, "organization_id": org.pk}).json()
            assert any("LIMIT 20" in query["sql"] for query in queries), path
        second = client.get(path, {"page": 2, "organization_id": org.pk}).json()
        assert len(first["results"]) == 20
        assert 0 < len(second["results"]) <= 20
        assert first["previous"] is None
        assert first["next"] and "organization_id=" in first["next"]
        assert second["next"] is None
        assert second["previous"]
        assert not {item["id"] for item in first["results"]} & {
            item["id"] for item in second["results"]
        }
        assert client.get(path, {"page": 1, "organization_id": org.pk}).json() == first
        assert len(client.get(path).json()) == first["count"]


def test_invalid_and_missing_pages_do_not_fall_back_to_unbounded_data(collections):
    org, _, admin = collections
    client = client_for(admin)
    for path in paths(org):
        for page in [0, -1, "invalid"]:
            assert client.get(path, {"page": page}).status_code == 400
        assert client.get(path, {"page": 99}).status_code == 404
    for path in ["/api/admin/evaluations/", "/api/admin/planning/"]:
        assert client.get(path, {"page": 1, "organization_id": "invalid"}).status_code == 400
        assert client.get(path, {"page": 1, "organization_id": 999999}).json()["count"] == 0


def test_pagination_preserves_authorizations_and_steering_summary(collections):
    org, _, admin = collections
    viewer = org.users.get(username="member-01")
    for path in paths(org) + ["/api/steering/"]:
        assert (
            client_for(viewer).get(path, {"page": 1, "organization_id": org.pk}).status_code == 403
        )
    client = client_for(admin)
    whole = client.get("/api/steering/").json()
    first = client.get("/api/steering/", {"page": 1}).json()
    second = client.get("/api/steering/", {"page": 2}).json()
    assert first["summary"] == second["summary"] == whole["summary"]
    assert first["teams"] + second["teams"] == whole["teams"]
    assert first["pagination"] == {"count": 25, "page": 1, "pages": 2}
    assert client.get("/api/steering/", {"page": 0}).status_code == 400
    assert client.get("/api/steering/", {"page": 99}).status_code == 404


def test_openapi_describes_both_collection_shapes_and_query_parameters():
    schema = SchemaGenerator().get_schema(public=True)
    for path in [
        "/api/admin/users/",
        "/api/admin/evaluations/",
        "/api/admin/planning/",
        "/api/evaluations/",
        "/api/admin/organizations/{organization_id}/teams/",
    ]:
        operation = schema["paths"][path]["get"]
        assert "page" in {parameter["name"] for parameter in operation["parameters"]}
        response = operation["responses"]["200"]["content"]["application/json"]["schema"]
        shapes = schema["components"]["schemas"][response["$ref"].split("/")[-1]]["oneOf"]
        assert shapes[0]["type"] == "array"
        page = schema["components"]["schemas"][shapes[1]["$ref"].split("/")[-1]]
        assert {"count", "next", "previous", "results"} == set(page["properties"])


def test_user_search_filters_before_count_and_preserves_scope_and_links(collections):
    _, _, admin = collections
    client = client_for(admin)
    data = client.get("/api/admin/users/", {"page": 1, "search": "member-"}).json()
    assert data["count"] == 24
    assert len(data["results"]) == 20
    assert "search=member-" in data["next"]
    assert client.get("/api/admin/users/", {"page": 1, "search": "Outside"}).json()["count"] == 0
    assert client.get("/api/admin/users/", {"page": 1, "search": "x" * 151}).status_code == 400
