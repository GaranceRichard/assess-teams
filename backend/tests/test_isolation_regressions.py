from datetime import timedelta

import pytest
from django.utils import timezone

from assessments.application.schedule_notifications import deliver_due_schedule
from assessments.models import EvaluationRun
from journals.models import ActivityAction, ActivityEntry
from teams.models import Team
from tests.identity_helpers import create_superuser
from tests.isolation_helpers import (
    business_snapshot,
    members,
    planning,
    request,
    session,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def move_coach(context):
    a, b = context.a, context.b
    root = session(context.root)
    members(root, a.organization, [a.admin, a.viewer])
    members(root, b.organization, [b.admin, b.coach, b.viewer, a.coach])
    a.coach.username = "B-private-new-name"
    a.coach.save(update_fields=["username"])


@pytest.mark.parametrize("actor", ["admin", "root"])
def test_former_coach_reference_cannot_be_reconfirmed_across_organizations(isolation, actor):
    a = isolation.a
    move_coach(isolation)
    client = session(a.admin if actor == "admin" else isolation.root)
    before = business_snapshot()
    response = request(
        client,
        "put",
        f"/api/admin/teams/{a.team.pk}/",
        {
            "name": "Changed",
            "coach_ids": [a.coach.pk],
        },
    )
    assert response.status_code == 400
    assert business_snapshot() == before


def test_team_listing_does_not_disclose_current_identity_from_an_old_coach_link(isolation):
    a = isolation.a
    move_coach(isolation)
    response = session(a.admin).get(f"/api/admin/organizations/{a.organization.pk}/teams/")
    assert response.status_code == 200
    assert response.json()[0]["coaches"] == []
    assert a.team.coaches.filter(pk=a.coach.pk).exists()  # No history/link deletion.
    assert "B-private-new-name" not in str(response.json())


def test_planning_keeps_history_without_disclosing_a_former_assignees_current_identity(isolation):
    a = isolation.a
    move_coach(isolation)
    client = session(a.admin)
    data = client.get("/api/admin/planning/").json()[0]
    assert data["assignee_id"] == a.coach.pk
    assert data["assignee_identifier"] is None
    assert data["assignee_role"] is None
    history = client.get(f"/api/evaluations/{a.run.pk}/").json()
    assert history["assigned_to"] == "A-coach"
    assert history["assignee_active"] is None
    assert a.schedule.assignee_id == a.coach.pk


def test_superadmin_exception_only_allows_self_assignment(isolation):
    other = create_superuser("other-root")
    other.email = "other-root@example.com"
    other.save(update_fields=["email"])
    client = session(isolation.root)
    payload = planning(isolation.a)
    payload["team_id"] = Team.objects.create(
        organization=isolation.a.organization, name="Unscheduled"
    ).pk
    payload["assignee_id"] = other.pk
    before = business_snapshot()
    response = request(client, "post", "/api/admin/planning/", payload)
    assert response.status_code == 404
    assert business_snapshot() == before
    payload["assignee_id"] = isolation.root.pk
    assert request(client, "post", "/api/admin/planning/", payload).status_code == 201


def test_inactive_local_coach_can_be_retained_and_removed_explicitly(isolation):
    a = isolation.a
    a.coach.is_active = False
    a.coach.save(update_fields=["is_active"])
    client = session(a.admin)
    url = f"/api/admin/teams/{a.team.pk}/"
    response = request(client, "put", url, {"name": "Renamed", "coach_ids": [a.coach.pk]})
    assert response.status_code == 200
    assert response.json()["coaches"][0]["is_active"] is False
    assert request(client, "put", url, {"name": "Renamed", "coach_ids": []}).status_code == 200
    assert not a.team.coaches.exists()


def test_removing_former_coach_never_copies_its_new_identity_into_the_old_journal(isolation):
    a = isolation.a
    move_coach(isolation)
    client = session(a.admin)
    response = request(
        client,
        "put",
        f"/api/admin/teams/{a.team.pk}/",
        {
            "name": a.team.name,
            "coach_ids": [],
        },
    )
    assert response.status_code == 200
    entry = ActivityEntry.objects.get(
        organization=a.organization, action=ActivityAction.COACH_REMOVED
    )
    assert "B-private-new-name" not in entry.description
    assert f"#{a.coach.pk}" in entry.description
    assert "B-private-new-name" not in str(client.get("/api/admin/activity-journal/").json())


@pytest.mark.parametrize("offset", [0, 1, 2])
def test_due_worker_does_not_recreate_a_foreign_identity_in_the_old_organization(isolation, offset):
    a = isolation.a
    move_coach(isolation)
    due_date = timezone.localdate() + timedelta(days=offset)
    a.schedule.next_due_date = due_date
    a.schedule.save(update_fields=["next_due_date"])
    before = list(EvaluationRun.objects.filter(organization=a.organization).order_by("pk").values())
    assert deliver_due_schedule(a.schedule, due_date) is False
    assert (
        list(EvaluationRun.objects.filter(organization=a.organization).order_by("pk").values())
        == before
    )
    client = session(a.admin)
    for url in ("/api/admin/logs/", "/api/evaluations/", "/api/admin/planning/"):
        assert "B-private-new-name" not in str(client.get(url).json())
