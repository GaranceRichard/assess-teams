import pytest

from journals.models import ActivityAction
from journals.services import record_activity
from tests.isolation_helpers import business_snapshot, members, request, session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["admin", "coach", "viewer", "root"])
def test_archived_history_rejects_foreign_and_mixed_team_or_lineage_ids(isolation, role):
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
    lineage = a.run.questions.first().lineage_id
    url = f"/api/results/families/{a.evaluation.family_id}/criteria/{lineage}/"
    before = business_snapshot()
    own = client.get(url, {"team_ids": [a.team.pk, a.team.pk]})
    assert own.status_code == 200
    assert len(own.json()["teams"]) == 1
    assert [point["run_id"] for point in own.json()["teams"][0]["points"]] == [a.run.pk]
    for ids in ([b.team.pk], [a.team.pk, b.team.pk], [999999], [a.team.pk, 999999]):
        refused = client.get(url, {"team_ids": ids})
        assert refused.status_code == 404
        assert refused.json() == {"detail": "Pas trouvé."}
    foreign_lineage = b.run.questions.first().lineage_id
    refused = client.get(url.replace(str(lineage), str(foreign_lineage)), {"team_ids": [a.team.pk]})
    assert refused.status_code == 404
    assert business_snapshot() == before


def test_nested_projections_keep_snapshots_without_current_foreign_identity(isolation):
    a, b = isolation.a, isolation.b
    entry = record_activity(
        actor=a.coach,
        organization=a.organization,
        team=a.team,
        target_user=a.coach,
        action=ActivityAction.COACH_REMOVED,
        description="Historical local event",
    )
    root = session(isolation.root)
    members(root, a.organization, [a.admin, a.viewer])
    members(root, b.organization, [b.admin, b.coach, b.viewer, a.coach])
    a.coach.username = "private-current-B-identity"
    a.coach.save(update_fields=["username"])
    client = session(a.admin)
    before = business_snapshot()
    teams = client.get(f"/api/admin/organizations/{a.organization.pk}/teams/?page=1").json()
    assert teams["results"][0]["coaches"] == []
    steering = client.get(
        "/api/steering/", {"organization_id": a.organization.pk, "page": 1}
    ).json()
    assert steering["teams"][0]["coaches"] == []
    assert steering["teams"][0]["last_result"]["run_id"] == a.run.pk
    schedules = client.get("/api/admin/planning/?page=1").json()
    assert schedules["results"][0]["assignee_id"] == a.coach.pk
    assert schedules["results"][0]["assignee_identifier"] is None
    run = client.get(f"/api/evaluations/{a.run.pk}/").json()
    assert run["assigned_to"] == "A-coach"
    assert run["assignee_active"] is None
    journal = client.get(
        "/api/admin/activity-journal/", {"player": "A-coach", "team": a.team.name}
    ).json()
    historical = next(row for row in journal["results"] if row["id"] == entry.pk)
    assert historical["target_user_name"] == historical["actor_name"] == "A-coach"
    for payload in (teams, steering, schedules, run, journal):
        assert "private-current-B-identity" not in str(payload)
    assert (
        client.get("/api/admin/activity-journal/", {"player": a.coach.username}).json()["count"]
        == 0
    )
    assert business_snapshot() == before
    assert a.team.coaches.filter(pk=a.coach.pk).exists()
