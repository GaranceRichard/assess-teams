import re

import pytest

from tests.isolation_helpers import business_snapshot, request, session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["admin", "coach", "viewer", "root"])
def test_archived_resources_keep_their_owner_and_consultation_scope(isolation, role):
    a, b = isolation.a, isolation.b
    root = session(isolation.root)
    for side in (a, b):
        assert (
            request(
                root, "post", f"/api/admin/evaluations/{side.evaluation.pk}/archive/"
            ).status_code
            == 200
        )
        assert request(root, "delete", f"/api/admin/teams/{side.team.pk}/").status_code == 204
    client = session(isolation.root if role == "root" else getattr(a, role))
    for side, expected in ((a, 200), (b, 200 if role == "root" else 404)):
        assert client.get(f"/api/results/versions/{side.evaluation.pk}/").status_code == expected
        if role != "viewer":
            assert client.get(f"/api/evaluations/{side.run.pk}/").status_code == expected
    assert a.run.organization_id == a.organization.pk
    assert b.run.organization_id == b.organization.pk
    before = business_snapshot()
    # A global actor still cannot delete an organization with started historical runs.
    assert (
        request(root, "delete", f"/api/admin/organizations/{a.organization.pk}/").status_code == 400
    )
    assert business_snapshot() == before


def test_unknown_and_foreign_direct_identifiers_have_the_same_refusal(isolation):
    a, b = isolation.a, isolation.b
    client = session(a.admin)
    urls = [
        f"/api/admin/organizations/{b.organization.pk}/",
        f"/api/admin/organizations/{b.organization.pk}/teams/",
        f"/api/admin/evaluations/{b.evaluation.pk}/questions/",
        f"/api/evaluations/{b.run.pk}/",
        f"/api/results/versions/{b.evaluation.pk}/",
        f"/api/results/families/{b.evaluation.family_id}/",
    ]
    for url in urls:
        foreign, missing = client.get(url), client.get(re.sub(r"/\d+/", "/999999/", url))
        assert foreign.status_code == missing.status_code == 404
        assert foreign.json() == missing.json()
    team_url = f"/api/admin/teams/{a.team.pk}/"
    payload = {"name": a.team.name, "coach_ids": [b.coach.pk]}
    foreign = request(client, "put", team_url, payload)
    payload["coach_ids"] = [999999]
    missing = request(client, "put", team_url, payload)
    assert foreign.status_code == missing.status_code == 400
    assert foreign.json() == missing.json()


@pytest.mark.contract
def test_isolation_response_shapes_and_nullable_metadata_remain_documented(isolation):
    client = session(isolation.a.admin)
    response = client.get("/api/schema/", HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    schemas = response.json()["components"]["schemas"]
    for name, field in [
        ("EvaluationSchedule", "assignee_identifier"),
        ("EvaluationSchedule", "assignee_role"),
        ("EvaluationRunList", "assignee_active"),
    ]:
        assert schemas[name]["properties"][field]["nullable"] is True
    assert schemas["Team"]["properties"]["coaches"]["type"] == "array"
    assert client.get("/api/docs/").status_code == 200
