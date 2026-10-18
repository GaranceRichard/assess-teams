from urllib.parse import urlsplit

import pytest

from journals.models import LogLevel, LogSource
from journals.services import record_log
from teams.models import Team
from tests.isolation_helpers import business_snapshot, session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["admin", "root"])
def test_collection_pagination_links_keep_scope_and_foreign_filters(isolation, role):
    a, b = isolation.a, isolation.b
    for side in (a, b):
        Team.objects.bulk_create(
            [
                Team(organization=side.organization, name=f"{side.organization.name}-{i}")
                for i in range(22)
            ]
        )
    client = session(a.admin if role == "admin" else isolation.root)
    url = f"/api/admin/organizations/{a.organization.pk}/teams/?page=1"
    expected = set(a.organization.teams.values_list("pk", flat=True))
    before = business_snapshot()
    seen = set()
    while url:
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == len(expected)
        assert {row["organization_id"] for row in data["results"]} == {a.organization.pk}
        seen.update(row["id"] for row in data["results"])
        url = data["next"]
        if url:
            assert urlsplit(url).path == urlsplit(response.wsgi_request.path).path
    assert seen == expected
    foreign = client.get(f"/api/admin/organizations/{b.organization.pk}/teams/?page=2")
    assert foreign.status_code == (404 if role == "admin" else 200)
    for path in ("evaluations", "planning"):
        query = {"organization_id": b.organization.pk, "page": 1}
        data = client.get(f"/api/admin/{path}/", query).json()
        assert data["count"] == (0 if role == "admin" else (2 if path == "evaluations" else 1))
        assert all(row["organization_id"] == b.organization.pk for row in data["results"])
    assert business_snapshot() == before


@pytest.mark.parametrize("key", ["organization", "organization_id", "actor", "team", "evaluation"])
def test_each_log_relation_filter_intersects_scope_before_count_and_pagination(isolation, key):
    a, b = isolation.a, isolation.b
    entries = []
    for side in (a, b):
        entries.append(
            record_log(
                actor=side.coach,
                organization=side.organization,
                team=side.team,
                evaluation=side.evaluation,
                level=LogLevel.WARNING,
                source=LogSource.ASSESSMENTS,
                method="PUT",
                status_code=400,
                message=f"{side.organization.name} scoped diagnostic",
            )
        )
    field = {
        "organization": "organization",
        "organization_id": "organization",
        "actor": "coach",
    }.get(key, key)
    client = session(a.admin)
    common = {
        "page": 1,
        "level": "WARNING",
        "source": "assessments",
        "method": "PUT",
        "status_code": 400,
    }
    own = client.get("/api/admin/logs/", {**common, key: getattr(a, field).pk})
    assert own.status_code == 200
    assert [row["id"] for row in own.json()["results"]] == [entries[0].pk]
    before = business_snapshot()
    responses = [
        client.get("/api/admin/logs/", {**common, key: foreign_id})
        for foreign_id in (getattr(b, field).pk, 999999)
    ]
    for response in responses:
        assert response.status_code == 200
        assert response.json() == {"count": 0, "next": None, "previous": None, "results": []}
    assert business_snapshot() == before
    root = session(isolation.root)
    allowed = root.get("/api/admin/logs/", {**common, key: getattr(b, field).pk})
    assert [row["id"] for row in allowed.json()["results"]] == [entries[1].pk]
