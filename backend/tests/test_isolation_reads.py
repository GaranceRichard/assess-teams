import pytest

from tests.isolation_helpers import session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def direct_reads(side):
    org, run, evaluation = side.organization.pk, side.run, side.evaluation
    lineage = run.questions.first().lineage_id
    return [
        (f"/api/admin/organizations/{org}/", {"admin", "root"}),
        (f"/api/admin/organizations/{org}/teams/", {"admin", "root"}),
        (f"/api/admin/evaluations/{evaluation.pk}/questions/", {"admin", "root"}),
        (f"/api/evaluations/{run.pk}/", {"admin", "coach", "root"}),
        (f"/api/results/versions/{evaluation.pk}/", {"admin", "coach", "viewer", "root"}),
        (f"/api/results/families/{evaluation.family_id}/", {"admin", "coach", "viewer", "root"}),
        (f"/api/results/families/?organization_id={org}", {"admin", "coach", "viewer", "root"}),
        (
            f"/api/results/families/{evaluation.family_id}/criteria/{lineage}/?team_ids={run.team_id}",
            {"admin", "coach", "viewer", "root"},
        ),
    ]


@pytest.mark.parametrize("role", ["admin", "coach", "viewer", "root"])
def test_direct_reads_allow_only_current_scope(isolation, role):
    actor = isolation.root if role == "root" else getattr(isolation.a, role)
    client = session(actor)
    for side, foreign in ((isolation.a, False), (isolation.b, True)):
        for url, roles in direct_reads(side):
            expected = 403 if role not in roles else (404 if foreign and role != "root" else 200)
            response = client.get(url)
            assert response.status_code == expected, (role, url, response.data)
            if expected != 200:
                assert set(response.json()) == {"detail"}
                assert side.organization.name not in str(response.json())


@pytest.mark.parametrize("role", ["admin", "coach", "viewer", "root"])
def test_lists_search_and_organization_filters_cannot_expand_scope(isolation, role):
    a, b = isolation.a, isolation.b
    client = session(isolation.root if role == "root" else getattr(a, role))
    global_access = role == "root"
    expected_orgs = {a.organization.pk, b.organization.pk} if global_access else {a.organization.pk}
    collections = [
        ("/api/admin/organizations/", "id", {"admin", "root"}),
        ("/api/admin/evaluations/", "organization_id", {"admin", "root"}),
        ("/api/admin/planning/", "organization_id", {"admin", "root"}),
        ("/api/evaluations/", "organization_id", {"admin", "coach", "root"}),
        ("/api/results/organizations/", "id", {"admin", "coach", "viewer", "root"}),
        ("/api/results/versions/", "id", {"admin", "coach", "viewer", "root"}),
    ]
    for url, field, roles in collections:
        response = client.get(url)
        assert response.status_code == (200 if role in roles else 403), url
        if role not in roles:
            continue
        expected_ids = expected_orgs
        if url == "/api/results/versions/":
            expected_ids = (
                {a.evaluation.pk, b.evaluation.pk} if global_access else {a.evaluation.pk}
            )
        assert {row[field] for row in response.json()} == expected_ids, url
        filtered = client.get(url, {"organization_id": b.organization.pk, "page": 1})
        assert filtered.status_code == 200
        data = filtered.json()
        rows = data["results"] if isinstance(data, dict) else data
        assert {row[field] for row in rows}.issubset(expected_ids), url
    users = client.get("/api/admin/users/", {"search": "B-", "page": 1})
    assert users.status_code == (403 if role == "viewer" else 200)
    if role != "viewer":
        assert users.json()["count"] == (3 if global_access else 0)
    dashboard = client.get("/api/dashboard/", {"organization_id": b.organization.pk}).json()
    assert {e["organization_id"] for e in dashboard["recent_activity"]} == expected_orgs


@pytest.mark.parametrize("role", ["admin", "coach", "viewer", "root"])
def test_historical_lists_and_forged_related_filters(isolation, role):
    a, b = isolation.a, isolation.b
    client = session(isolation.root if role == "root" else getattr(a, role))
    for url in ("/api/admin/activity-journal/", "/api/admin/logs/"):
        response = client.get(url, {"organization_id": b.organization.pk, "team": b.team.pk})
        assert response.status_code == (200 if role in {"admin", "root"} else 403)
        if role == "admin":
            assert response.json()["count"] == 0
    steering = client.get("/api/steering/", {"organization_id": b.organization.pk})
    assert steering.status_code == {"root": 200, "admin": 404, "coach": 403, "viewer": 403}[role]
    lineage = a.run.questions.first().lineage_id
    mixed = client.get(
        f"/api/results/families/{a.evaluation.family_id}/criteria/{lineage}/",
        {"team_ids": [a.team.pk, b.team.pk]},
    )
    assert mixed.status_code == 404
    assert set(mixed.json()) == {"detail"}
