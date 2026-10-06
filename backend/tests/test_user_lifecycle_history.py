from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.application.schedule_notifications import deliver_due_schedule
from assessments.models import EvaluationRun, EvaluationRunState, ScheduleMode
from identities.domain.users import Role
from journals.models import ActivityEntry, LogEntry
from tests.identity_helpers import create_user
from tests.managed_user_helpers import authenticated_superadmin_client, csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)
from tests.test_user_lifecycle import activation

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_deactivation_preserves_completed_revised_runs_all_snapshots_and_journals():
    organization, coach, admin, run = taking_context()
    replacement = create_user("replacement", Role.ADMIN)
    organization.users.add(replacement)
    run.team.coaches.add(coach)
    assert complete(client_for(coach), run).status_code == 200
    assert (
        csrf_put(client_for(admin), route(run, "revision"), revision_answers(run)).status_code
        == 200
    )
    snapshot = EvaluationRun.objects.filter(pk=run.pk).values().get()
    questions = list(run.questions.values())
    entries = list(ActivityEntry.objects.values())
    logs = list(LogEntry.objects.values())
    client, _ = authenticated_superadmin_client()
    assert activation(client, coach).status_code == 200
    assert activation(client, admin).status_code == 200
    assert EvaluationRun.objects.filter(pk=run.pk).values().get() == snapshot
    assert list(run.questions.values()) == questions
    for entry in entries:
        assert ActivityEntry.objects.filter(pk=entry["id"]).values().get() == entry
    for log in logs:
        assert LogEntry.objects.filter(pk=log["id"]).values().get() == log
    assert run.team.coaches.filter(pk=coach.pk).exists()
    response = client_for(replacement).get(route(run)).json()
    assert response["filled_by"] == coach.username and response["revised_by"] == admin.username
    assert response["assignee_active"] is False
    activity = client.get(reverse("dashboard")).json()["recent_activity"]
    authors = {
        event["type"]: event["author_name"] for event in activity if event["run_id"] == run.pk
    }
    assert authors == {"completed": coach.username, "revised": admin.username}
    run.schedule.refresh_from_db()
    assert not run.schedule.requires_reassignment  # Completed one-off is historical only.


@pytest.mark.parametrize("started", [False, True])
def test_pending_responsibility_requires_explicit_review_even_after_reactivation(started):
    organization, coach, admin, run = taking_context()
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    run.team.coaches.add(coach)
    if started:
        assert start(client_for(coach), run).status_code == 200
    assert client_for(coach).get(reverse("dashboard")).json()["pending_assignments"] == 1
    before = EvaluationRun.objects.filter(pk=run.pk).values().get()
    client, _ = authenticated_superadmin_client()
    assert activation(client, coach).status_code == 200
    schedule = run.schedule
    schedule.refresh_from_db()
    assert schedule.requires_reassignment and schedule.assignee_id == coach.pk
    assert EvaluationRun.objects.filter(pk=run.pk).values().get() == before
    assert ensure_expected_evaluation(schedule, timezone.localdate() + timedelta(days=1)) is None
    assert not deliver_due_schedule(schedule, timezone.localdate())
    assert start(client_for(admin), run).status_code == 400
    assert activation(client, coach, True).status_code == 200
    schedule.refresh_from_db()
    assert schedule.requires_reassignment
    assert start(client_for(coach), run).status_code == 400
    assert client_for(coach).get(reverse("dashboard")).json()["pending_assignments"] == 0
    # Explicitly retaining the same now-active assignee is a deliberate review.
    response = csrf_put(
        client,
        reverse("evaluation-schedule-detail", kwargs={"schedule_id": schedule.pk}),
        {
            "organization_id": organization.pk,
            "team_id": run.team_id,
            "evaluation_id": run.evaluation_id,
            "assignee_id": coach.pk,
            "mode": "immediate",
        },
    )
    assert response.status_code == 200
    schedule.refresh_from_db()
    assert not schedule.requires_reassignment
    assert client_for(coach).get(reverse("dashboard")).json()["pending_assignments"] == 1
    assert start(client_for(coach), run).status_code == 200
    assert run.team.coaches.filter(pk=coach.pk).exists()


def test_reactivation_does_not_restore_removed_teams_or_responsibilities():
    _, coach, _, run = taking_context()
    run.team.coaches.add(coach)
    client, _ = authenticated_superadmin_client()
    assert activation(client, coach).status_code == 200
    run.team.coaches.remove(coach)
    assert activation(client, coach, True).status_code == 200
    assert not run.team.coaches.filter(pk=coach.pk).exists()
    run.schedule.refresh_from_db()
    assert run.schedule.requires_reassignment


def test_recurring_schedule_is_suspended_even_when_previous_run_completed():
    _, coach, _, run = taking_context()
    complete(client_for(coach), run)
    schedule = run.schedule
    schedule.mode = ScheduleMode.MONTHLY
    schedule.save(update_fields=["mode"])
    client, _ = authenticated_superadmin_client()
    assert activation(client, coach).status_code == 200
    schedule.refresh_from_db()
    assert schedule.requires_reassignment
    assert EvaluationRun.objects.get(pk=run.pk).state == EvaluationRunState.COMPLETED
