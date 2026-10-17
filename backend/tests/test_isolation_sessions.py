import pytest

from assessments.models import EvaluationRun
from identities.domain.users import Role
from journals.models import ActivityEntry
from teams.models import Team
from tests.identity_helpers import create_user
from tests.isolation_helpers import (
    business_snapshot,
    members,
    planning,
    request,
    session,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["admin", "coach", "viewer"])
def test_existing_session_uses_current_membership_and_preserves_old_facts(isolation, role):
    a, b = isolation.a, isolation.b
    actor = getattr(a, role)
    client, root = session(actor), session(isolation.root)
    cookie = client.cookies["sessionid"].value
    spare = create_user("spare-admin", Role.ADMIN)
    members(root, a.organization, [a.admin, a.coach, a.viewer, spare])
    historical = list(EvaluationRun.objects.filter(pk=a.run.pk).values())
    questions = list(a.run.questions.order_by("pk").values())
    journal = list(ActivityEntry.objects.order_by("pk").values())
    assert client.get(f"/api/results/versions/{a.evaluation.pk}/").status_code == 200

    members(root, a.organization, [u for u in [a.admin, a.coach, a.viewer, spare] if u != actor])
    assert client.get("/api/results/versions/").json() == []
    assert client.get(f"/api/results/versions/{a.evaluation.pk}/").status_code == 404
    members(root, b.organization, [b.admin, b.coach, b.viewer, actor])

    assert client.cookies["sessionid"].value == cookie
    assert client.get("/api/session/").json()["organization_name"] == b.organization.name
    assert client.get(f"/api/results/versions/{a.evaluation.pk}/").status_code == 404
    assert client.get(f"/api/results/versions/{b.evaluation.pk}/").status_code == (
        404 if role == "coach" else 200
    )
    assert client.get("/api/dashboard/").json()["profile"]["team_names"] == []
    if role != "viewer":
        before = business_snapshot()
        assert request(client, "post", f"/api/evaluations/{a.waiting.pk}/").status_code == 404
        assert (
            request(client, "put", f"/api/evaluations/{a.run.pk}/revision/", {}).status_code == 404
        )
        assert business_snapshot() == before
    if role == "admin":
        assert client.get(f"/api/admin/organizations/{a.organization.pk}/").status_code == 404
        assert client.get(f"/api/admin/organizations/{b.organization.pk}/").status_code == 200
        assert (
            request(
                client,
                "put",
                f"/api/admin/teams/{a.team.pk}/",
                {
                    "name": "forged",
                    "coach_ids": [],
                },
            ).status_code
            == 404
        )
        rows = client.get("/api/admin/activity-journal/").json()["results"]
        assert all(row["organization_id"] == b.organization.pk for row in rows)
    if role == "coach":
        assert a.team.coaches.filter(pk=actor.pk).exists()
        payload = planning(b)
        payload["team_id"] = Team.objects.create(organization=b.organization, name="New team").pk
        payload["assignee_id"] = actor.pk
        response = request(root, "post", "/api/admin/planning/", payload)
        assert response.status_code == 201
        new = EvaluationRun.objects.get(schedule_id=response.json()["id"])
        assert client.get(f"/api/evaluations/{new.pk}/").status_code == 200
        assert client.get(f"/api/evaluations/{a.run.pk}/").status_code == 404
    assert list(EvaluationRun.objects.filter(pk=a.run.pk).values()) == historical
    assert list(a.run.questions.order_by("pk").values()) == questions
    assert (
        list(
            ActivityEntry.objects.filter(pk__in=[r["id"] for r in journal]).order_by("pk").values()
        )
        == journal
    )
    # History remains with A, readable by A's current Admin and the global Superadmin.
    assert session(spare).get(f"/api/evaluations/{a.run.pk}/").status_code == 200
    assert root.get(f"/api/evaluations/{a.run.pk}/").status_code == 200


def test_team_membership_does_not_replace_run_assignment_and_assignment_is_current(isolation):
    a = isolation.a
    colleague = create_user("colleague", Role.COACH)
    colleague.email = "colleague@example.com"
    colleague.save(update_fields=["email"])
    a.organization.users.add(colleague)
    actor_session = session(colleague)
    coach_session = session(a.coach)
    admin = session(a.admin)
    a.team.coaches.add(colleague)
    assert actor_session.get(f"/api/evaluations/{a.run.pk}/").status_code == 404
    a.team.coaches.remove(a.coach)
    assert coach_session.get(f"/api/evaluations/{a.run.pk}/").status_code == 200
    payload = planning(a)
    payload["team_id"] = Team.objects.create(organization=a.organization, name="Reassigned").pk
    response = request(admin, "post", "/api/admin/planning/", payload)
    assert response.status_code == 201
    run = EvaluationRun.objects.get(schedule_id=response.json()["id"])
    url = f"/api/evaluations/{run.pk}/"
    assert coach_session.get(url).status_code == 200
    payload["assignee_id"] = colleague.pk
    assert (
        request(admin, "put", f"/api/admin/planning/{run.schedule_id}/", payload).status_code == 200
    )
    assert actor_session.get(url).status_code == 200
    assert coach_session.get(url).status_code == 404
    before = business_snapshot()
    assert request(coach_session, "post", url).status_code == 404
    assert business_snapshot() == before
