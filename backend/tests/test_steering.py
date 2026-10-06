from datetime import timedelta

import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.utils import timezone

from assessments.application.steering import steering_projection
from assessments.models import EvaluationRunState
from teams.models import Team
from tests.results_helpers import another_run, results_context
from tests.taking_helpers import client_for, taking_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_summary_active_teams_missing_data_and_snapshot_context():
    org, coach, admin, run = results_context()
    run.team.coaches.add(coach)
    empty = Team.objects.create(organization=org, name="Empty")
    archived = Team.objects.create(organization=org, name="Archived", is_active=False)
    another_run(run, team=archived)
    run.evaluation.name = "Renamed model"
    run.evaluation.family.name = "Renamed family"
    run.evaluation.family.save()
    run.evaluation.status = "ARCHIVED"
    run.evaluation.save()
    data = client_for(admin).get("/api/steering/").json()
    assert data["organization"] == {"id": org.pk, "name": org.name}
    assert data["as_of_date"] == str(timezone.localdate())
    assert data["summary"] == {
        "active_teams": 2,
        "teams_with_results": 1,
        "teams_without_results": 1,
        "overdue_evaluations": 0,
        "last_completed_at": data["teams"][1]["last_result"]["completed_at"],
    }
    missing, evaluated = data["teams"]
    assert missing == {
        "team_id": empty.pk,
        "team_name": "Empty",
        "coaches": [],
        "last_result": None,
        "next_due_date": None,
        "status": "never_evaluated",
    }
    assert evaluated["coaches"] == [{"id": coach.pk, "name": coach.username}]
    assert evaluated["status"] == "up_to_date"
    assert evaluated["last_result"]["model_name"] == run.evaluation_name
    assert evaluated["last_result"]["version"] == 1


def test_latest_completion_uses_date_then_id_not_due_or_revision():
    org, _, admin, run = results_context()
    second = another_run(run, days=10)
    third = another_run(run, days=20)
    second.completed_at = run.completed_at + timedelta(hours=1)
    second.save()
    third.completed_at = second.completed_at
    third.save()
    run.revised_at = third.completed_at + timedelta(hours=1)
    run.revised_by_name = admin.username
    run.save()
    data = steering_projection(admin, org)
    last = data["teams"][0]["last_result"]
    assert last["run_id"] == third.pk
    assert last["completed_at"] == third.completed_at
    assert data["summary"]["last_completed_at"] == third.completed_at


@pytest.mark.parametrize("days,overdue", [(-1, True), (0, False), (1, False)])
@pytest.mark.parametrize("state", [EvaluationRunState.NOT_STARTED, EvaluationRunState.IN_PROGRESS])
def test_strict_date_boundary_for_expected_evaluations(days, overdue, state):
    org, _, admin, run = results_context()
    pending = another_run(run, days=days or 10, state=state)
    pending.due_date = timezone.localdate() + timedelta(days=days)
    if days == 0:
        pending.schedule = run.schedule.__class__.objects.create(
            team=run.team,
            evaluation=run.evaluation,
            assignee=admin,
            mode="fixed",
            first_due_date=pending.due_date,
        )
    pending.save()
    data = steering_projection(admin, org)
    assert data["summary"]["overdue_evaluations"] == int(overdue)
    assert data["teams"][0]["status"] == ("overdue" if overdue else "up_to_date")
    assert data["teams"][0]["next_due_date"] == pending.due_date


def test_never_evaluated_takes_precedence_but_overdue_counts_runs_and_order_is_stable():
    org, _, admin, run = results_context()
    empty = Team.objects.create(organization=org, name="A never")
    another_run(run, team=empty, days=-2, state=EvaluationRunState.NOT_STARTED)
    another_run(run, days=-3, state=EvaluationRunState.NOT_STARTED)
    another_run(run, days=-4, state=EvaluationRunState.IN_PROGRESS)
    current = Team.objects.create(organization=org, name="A current")
    another_run(run, team=current, days=-5)
    data = steering_projection(admin, org)
    assert [row["status"] for row in data["teams"]] == [
        "overdue",
        "never_evaluated",
        "up_to_date",
    ]
    assert data["summary"]["overdue_evaluations"] == 3


def test_next_due_reads_planning_without_creating_runs_or_counting_unmaterialized_delays():
    org, _, admin, run = results_context()
    schedule = run.schedule
    schedule.next_due_date = timezone.localdate() - timedelta(days=1)
    schedule.save()
    data = steering_projection(admin, org)
    assert data["teams"][0]["next_due_date"] == schedule.next_due_date
    assert data["summary"]["overdue_evaluations"] == 0
    schedule.next_due_date = run.due_date
    schedule.save()
    assert steering_projection(admin, org)["teams"][0]["next_due_date"] is None


def test_empty_projection_and_uncompleted_only():
    org, _, admin, run = taking_context()
    data = steering_projection(admin, org)
    assert data["teams"][0]["last_result"] is None
    assert data["summary"]["last_completed_at"] is None
    run.team.is_active = False
    run.team.save()
    data = steering_projection(admin, org)
    assert data["teams"] == []
    assert data["summary"]["active_teams"] == 0


def test_projection_query_count_is_bounded_and_read_only():
    org, coach, admin, run = results_context()
    for index in range(12):
        team = Team.objects.create(organization=org, name=f"Team {index}")
        team.coaches.add(coach)
        another_run(run, team=team, days=index + 1)
        another_run(run, team=team, days=-index - 1, state=EvaluationRunState.NOT_STARTED)
    with CaptureQueriesContext(connection) as queries:
        data = steering_projection(admin, org)
    reads = [q for q in queries if q["sql"].lstrip().upper().startswith("SELECT")]
    assert len(reads) == 5
    assert not any(
        q["sql"].lstrip().upper().startswith(("INSERT", "UPDATE", "DELETE")) for q in queries
    )
    assert len(data["teams"]) == 13
