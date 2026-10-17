import pytest

from tests.isolation_helpers import (
    business_snapshot,
    planning,
    request,
    session,
)
from tests.taking_helpers import revision_answers, start

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def foreign_mutations(b):
    org, team, draft, question = b.organization.pk, b.team.pk, b.draft.pk, b.question.pk
    run, evaluation, schedule, viewer = b.run.pk, b.evaluation.pk, b.schedule.pk, b.viewer.pk
    return [
        ("put", f"/api/admin/organizations/{org}/", {"name": "forged"}),
        ("put", f"/api/admin/organizations/{org}/members/", {"user_ids": [b.admin.pk]}),
        ("post", f"/api/admin/organizations/{org}/teams/", {"name": "forged", "coach_ids": []}),
        ("put", f"/api/admin/teams/{team}/", {"name": "forged", "coach_ids": []}),
        ("delete", f"/api/admin/teams/{team}/", {}),
        ("post", "/api/admin/evaluations/", {"name": "forged", "organization_id": org}),
        ("put", f"/api/admin/evaluations/{draft}/", {"name": "forged"}),
        ("delete", f"/api/admin/evaluations/{draft}/", {}),
        ("post", f"/api/admin/evaluations/{draft}/validate/", {}),
        ("post", f"/api/admin/evaluations/{evaluation}/archive/", {}),
        ("post", f"/api/admin/evaluations/{evaluation}/versions/", {}),
        ("post", f"/api/admin/evaluations/{draft}/questions/", {"name": "forged"}),
        ("put", f"/api/admin/questions/{question}/", {"name": "forged"}),
        ("delete", f"/api/admin/questions/{question}/", {}),
        ("post", "/api/admin/planning/", planning(b)),
        ("put", f"/api/admin/planning/{schedule}/", planning(b)),
        ("delete", f"/api/admin/planning/{schedule}/", {}),
        (
            "put",
            f"/api/admin/users/{viewer}/",
            {
                "identifier": b.viewer.username,
                "email": "changed@example.com",
            },
        ),
        ("delete", f"/api/admin/users/{viewer}/", {}),
        ("post", f"/api/admin/users/{viewer}/deactivate/", {}),
        ("post", f"/api/admin/users/{viewer}/reactivate/", {}),
        ("post", f"/api/evaluations/{b.waiting.pk}/", {}),
        (
            "put",
            f"/api/evaluations/{run}/responses/{b.run.questions.first().source_question_id}/",
            {"score": 1},
        ),
        ("post", f"/api/evaluations/{run}/finalize/", {}),
        ("put", f"/api/evaluations/{run}/revision/", revision_answers(b.run)),
    ]


@pytest.mark.parametrize("role", ["admin", "coach", "viewer"])
def test_foreign_mutation_matrix_has_no_persistent_effect(isolation, role):
    client = session(getattr(isolation.a, role))
    for method, url, payload in foreign_mutations(isolation.b):
        before = business_snapshot()
        response = request(client, method, url, payload)
        user_route = "/api/admin/users/" in url
        taking_route = url.startswith("/api/evaluations/")
        role_allows = role == "admin" or (role == "coach" and (user_route or taking_route))
        assert response.status_code == (404 if role_allows else 403), (url, response.data)
        assert set(response.json()) == {"detail"}
        assert business_snapshot() == before, url


@pytest.mark.parametrize("role", ["admin", "root"])
def test_cross_references_are_refused_even_on_owned_resource(isolation, role):
    a, b = isolation.a, isolation.b
    client = session(a.admin if role == "admin" else isolation.root)
    cases = [
        (
            "put",
            f"/api/admin/teams/{a.team.pk}/",
            {"name": "forged", "coach_ids": [b.coach.pk]},
            400,
        ),
        (
            "post",
            f"/api/admin/organizations/{a.organization.pk}/teams/",
            {"name": "forged", "coach_ids": [b.coach.pk]},
            400,
        ),
        (
            "put",
            f"/api/admin/organizations/{a.organization.pk}/members/",
            {"user_ids": [a.admin.pk, b.viewer.pk]},
            400,
        ),
        ("put", f"/api/evaluations/{a.run.pk}/revision/", revision_answers(b.run), 400),
    ]
    for field in ("organization_id", "team_id", "evaluation_id", "assignee_id"):
        payload = planning(a)
        payload[field] = planning(b)[field]
        cases.extend(
            [
                ("post", "/api/admin/planning/", payload, 404),
                ("put", f"/api/admin/planning/{a.schedule.pk}/", payload, 404),
            ]
        )
    for method, url, payload, status in cases:
        before = business_snapshot()
        response = request(client, method, url, payload)
        assert response.status_code == status, (role, url, response.data)
        assert business_snapshot() == before
    assert start(client, a.waiting).status_code == 200
    before = business_snapshot()
    foreign_question = b.run.questions.first().source_question_id
    response = request(
        client,
        "put",
        f"/api/evaluations/{a.waiting.pk}/responses/{foreign_question}/",
        {"score": 8},
    )
    assert response.status_code == 400
    assert business_snapshot() == before


@pytest.mark.parametrize("role", ["admin", "root"])
def test_legitimate_mutations_still_work_in_the_authorized_organization(isolation, role):
    side = isolation.a if role == "admin" else isolation.b
    client = session(side.admin if role == "admin" else isolation.root)
    prefix = "/api/admin"
    created = request(
        client,
        "post",
        f"{prefix}/evaluations/",
        {
            "name": "New local model",
            "organization_id": side.organization.pk,
        },
    )
    assert created.status_code == 201
    evaluation_id = created.json()["id"]
    url = f"{prefix}/evaluations/{evaluation_id}/"
    assert request(client, "put", url, {"name": "Renamed"}).status_code == 200
    question = request(client, "post", f"{url}questions/", {"name": "Local criterion"})
    assert question.status_code == 201
    assert request(client, "post", f"{url}validate/").status_code == 200
    assert request(client, "put", url, {"name": "Immutable"}).status_code == 400
    payload = planning(side)
    payload["evaluation_id"] = evaluation_id
    created = request(client, "post", f"{prefix}/planning/", payload)
    assert created.status_code == 201
    schedule_url = f"{prefix}/planning/{created.json()['id']}/"
    assert request(client, "put", schedule_url, payload).status_code == 200
    assert request(client, "delete", schedule_url).status_code == 204
    created = request(
        client,
        "post",
        f"{prefix}/organizations/{side.organization.pk}/teams/",
        {
            "name": "Local team",
            "coach_ids": [side.coach.pk],
        },
    )
    assert created.status_code == 201
    team_url = f"{prefix}/teams/{created.json()['id']}/"
    assert request(client, "put", team_url, {"name": "Renamed", "coach_ids": []}).status_code == 200
    assert request(client, "delete", team_url).status_code == 204
    viewer_url = f"{prefix}/users/{side.viewer.pk}/"
    assert request(client, "post", f"{viewer_url}deactivate/").status_code == 200
    assert request(client, "post", f"{viewer_url}reactivate/").status_code == 200
