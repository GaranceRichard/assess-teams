from datetime import timedelta

import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.application.schedule_notifications import deliver_due_schedule
from assessments.models import EvaluationRunState, ScheduleMode
from tests.managed_user_helpers import csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional]


@pytest.mark.parametrize("score", [-1, 11, 1.5])
def test_database_refuses_out_of_range_notes(score):
    _, coach, _, run = taking_context()
    start(client_for(coach), run)
    with pytest.raises(IntegrityError), transaction.atomic():
        from django.db.models import Value

        run.questions.update(score=Value(score))


def test_database_enforces_state_completion_revision_and_question_uniqueness():
    _, coach, _, run = taking_context()
    start(client_for(coach), run)
    invalid_updates = [
        {"state": "forged"},
        {"state": EvaluationRunState.COMPLETED},
        {"completed_at": timezone.now()},
        {"revised_at": timezone.now(), "revised_by_name": "Admin"},
    ]
    for values in invalid_updates:
        with pytest.raises(IntegrityError), transaction.atomic():
            type(run).objects.filter(pk=run.pk).update(**values)
    question = run.questions.first()
    with pytest.raises(IntegrityError), transaction.atomic():
        run.questions.create(source_question=question.source_question, index=3, text="Duplicate")
    with pytest.raises(IntegrityError), transaction.atomic():
        run.questions.filter(pk=question.pk).update(index=0)


def test_recurrence_creates_a_distinct_expected_evaluation_and_keeps_completed_one():
    _, coach, _, run = taking_context()
    complete(client_for(coach), run)
    schedule = run.schedule
    schedule.mode = ScheduleMode.MONTHLY
    schedule.next_due_date = run.due_date + timedelta(days=31)
    schedule.save()
    deliver_due_schedule(schedule, schedule.next_due_date)
    assert schedule.runs.count() == 2
    expected = schedule.runs.exclude(pk=run.pk).get()
    assert expected.state == EvaluationRunState.NOT_STARTED
    assert expected.assignee == coach
    assert ensure_expected_evaluation(schedule, expected.due_date).pk == expected.pk
    run.refresh_from_db()
    assert run.completed_by == coach


def test_assignment_and_completion_names_survive_account_deletion():
    _, coach, admin, run = taking_context()
    complete(client_for(admin), run)
    assert (
        csrf_put(client_for(admin), route(run, "revision"), revision_answers(run)).status_code
        == 200
    )
    run.refresh_from_db()
    initial_date, revision_date = run.completed_at, run.revised_at
    expected_assignee = coach.username
    expected_author = admin.username
    coach.delete()
    admin.delete()
    run.refresh_from_db()
    assert run.assignee is None
    assert run.completed_by is None
    assert run.assignee_name == expected_assignee
    assert run.completed_by_name == expected_author
    assert run.revised_by is None
    assert run.revised_by_name == expected_author
    assert (run.completed_at, run.revised_at) == (initial_date, revision_date)


def test_planning_changes_do_not_transfer_started_or_completed_evaluation():
    organization, coach, admin, run = taking_context()
    complete(client_for(coach), run)
    payload = {
        "organization_id": organization.pk,
        "team_id": run.team_id,
        "evaluation_id": run.evaluation_id,
        "assignee_id": admin.pk,
        "mode": "immediate",
    }
    admin.email = "admin@example.com"
    admin.save()
    client = client_for(admin)
    response = csrf_put(
        client,
        reverse("evaluation-schedule-detail", kwargs={"schedule_id": run.schedule_id}),
        payload,
    )
    assert response.status_code == 200
    run.refresh_from_db()
    assert run.assignee == coach
    assert client_for(coach).get(reverse("evaluation-run-list")).json()[0]["id"] == run.pk


def test_referenced_questions_models_planning_and_organization_cannot_be_deleted():
    _, coach, _, run = taking_context()
    start(client_for(coach), run)
    from tests.identity_helpers import create_superuser

    client = client_for(create_superuser())
    routes = [
        reverse(
            "question-detail", kwargs={"question_id": run.questions.first().source_question_id}
        ),
        reverse("evaluation-detail", kwargs={"evaluation_id": run.evaluation_id}),
        reverse("evaluation-schedule-detail", kwargs={"schedule_id": run.schedule_id}),
        reverse("organization-detail", kwargs={"organization_id": run.organization_id}),
    ]
    for endpoint in routes:
        response = client.delete(endpoint, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)
        assert response.status_code == 400
