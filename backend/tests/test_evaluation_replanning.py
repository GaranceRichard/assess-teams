from datetime import timedelta

import pytest
from django.core import mail
from django.urls import reverse
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.models import EvaluationRun, EvaluationRunState, EvaluationSchedule, ScheduleMode
from journals.models import ActivityAction, ActivityEntry
from teams.models import Team
from tests.identity_helpers import create_superuser
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, complete, route, start, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def planning_data(organization, coach, run, mode=ScheduleMode.IMMEDIATE):
    coach.email = "coach@example.com"
    coach.save(update_fields=["email"])
    data = {
        "organization_id": organization.pk,
        "team_id": run.team_id,
        "evaluation_id": run.evaluation_id,
        "assignee_id": coach.pk,
        "mode": mode,
    }
    if mode != ScheduleMode.IMMEDIATE:
        data["first_due_date"] = str(timezone.localdate() + timedelta(days=7))
    return data


@pytest.mark.parametrize("previous_mode", [ScheduleMode.IMMEDIATE, ScheduleMode.FIXED])
@pytest.mark.parametrize("new_mode", ScheduleMode.values)
@pytest.mark.parametrize("actor_kind", ["admin", "superadmin"])
def test_replanning_completed_evaluation_preserves_history_and_creates_independent_run(
    previous_mode, new_mode, actor_kind, django_capture_on_commit_callbacks
):
    organization, coach, admin, previous = taking_context()
    previous.schedule.mode = previous_mode
    previous.schedule.save(update_fields=["mode"])
    client = client_for(admin if actor_kind == "admin" else create_superuser())
    assert complete(client, previous).status_code == 200
    history = client.get(route(previous)).json()
    data = planning_data(organization, coach, previous, new_mode)
    with django_capture_on_commit_callbacks(execute=True):
        response = csrf_post(client, reverse("evaluation-schedule-list"), data)

    assert response.status_code == 201
    assert response.json()["id"] != previous.schedule_id
    current = EvaluationRun.objects.get(schedule_id=response.json()["id"])
    assert current.pk != previous.pk
    assert current.state == EvaluationRunState.NOT_STARTED
    assert current.evaluation_id == previous.evaluation_id
    assert current.team_id == previous.team_id
    assert not current.questions.exists()
    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == [coach.email]
    assert client.get(route(previous)).json() == history
    assert {item["id"] for item in client.get(reverse("evaluation-run-list")).json()} == {
        previous.pk,
        current.pk,
    }
    assert ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_SCHEDULED).count() == 1
    assert csrf_post(client, reverse("evaluation-schedule-list"), data).status_code == 400
    assert EvaluationSchedule.objects.count() == 2
    assert complete(client, current).status_code == 200
    assert client.get(route(previous)).json() == history
    if new_mode in (ScheduleMode.IMMEDIATE, ScheduleMode.FIXED):
        third = csrf_post(client, reverse("evaluation-schedule-list"), data)
        assert third.status_code == 201
        assert EvaluationRun.objects.count() == 3


@pytest.mark.parametrize("state", [EvaluationRunState.NOT_STARTED, EvaluationRunState.IN_PROGRESS])
def test_replanning_refuses_an_unfinished_evaluation(state):
    organization, coach, admin, run = taking_context()
    client = client_for(admin)
    if state == EvaluationRunState.IN_PROGRESS:
        assert start(client, run).status_code == 200
    data = planning_data(organization, coach, run)

    response = csrf_post(client, reverse("evaluation-schedule-list"), data)

    assert response.status_code == 400
    assert EvaluationSchedule.objects.count() == 1
    assert EvaluationRun.objects.count() == 1
    run.refresh_from_db()
    assert run.state == state


@pytest.mark.parametrize("mode", [ScheduleMode.MONTHLY, ScheduleMode.QUARTERLY])
def test_replanning_refuses_a_recurring_schedule_even_after_completion(mode):
    organization, coach, admin, run = taking_context()
    run.schedule.mode = mode
    run.schedule.save(update_fields=["mode"])
    client = client_for(admin)
    assert complete(client, run).status_code == 200
    data = planning_data(organization, coach, run)

    assert csrf_post(client, reverse("evaluation-schedule-list"), data).status_code == 400
    assert EvaluationSchedule.objects.count() == 1


def test_replanning_refuses_legacy_schedule_without_runs():
    organization, coach, admin, run = taking_context()
    data = planning_data(organization, coach, run)
    run.delete()

    assert (
        csrf_post(client_for(admin), reverse("evaluation-schedule-list"), data).status_code == 400
    )
    assert EvaluationSchedule.objects.count() == 1
    assert not EvaluationRun.objects.exists()


def test_update_accepts_completed_history_and_refuses_another_unfinished_schedule():
    organization, coach, admin, previous = taking_context()
    client = client_for(admin)
    assert complete(client, previous).status_code == 200
    history = client.get(route(previous)).json()
    other_team = Team.objects.create(organization=organization, name="Other team")
    other_schedule = EvaluationSchedule.objects.create(
        team=other_team,
        evaluation=previous.evaluation,
        assignee=coach,
        mode=ScheduleMode.IMMEDIATE,
        first_due_date=timezone.localdate(),
    )
    other = ensure_expected_evaluation(other_schedule)
    data = planning_data(organization, coach, previous)
    other_route = reverse("evaluation-schedule-detail", kwargs={"schedule_id": other.schedule_id})

    assert csrf_put(client, other_route, data).status_code == 200
    assert client.get(route(previous)).json() == history
    previous_route = reverse(
        "evaluation-schedule-detail", kwargs={"schedule_id": previous.schedule_id}
    )
    assert csrf_put(client, previous_route, data).status_code == 400
    assert EvaluationSchedule.objects.count() == 2


def test_completed_one_off_with_another_unfinished_run_still_blocks_replanning():
    organization, coach, admin, previous = taking_context()
    client = client_for(admin)
    assert complete(client, previous).status_code == 200
    pending = ensure_expected_evaluation(previous.schedule, previous.due_date + timedelta(days=7))
    data = planning_data(organization, coach, previous)

    assert csrf_post(client, reverse("evaluation-schedule-list"), data).status_code == 400
    pending.refresh_from_db()
    assert pending.state == EvaluationRunState.NOT_STARTED
    assert EvaluationSchedule.objects.count() == 1
    assert EvaluationRun.objects.count() == 2
