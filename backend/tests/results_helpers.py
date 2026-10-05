from datetime import timedelta

from django.urls import reverse
from django.utils import timezone

from assessments.models import (
    EvaluationRun,
    EvaluationRunQuestion,
    EvaluationRunState,
    EvaluationSchedule,
)
from tests.taking_helpers import client_for, complete, taking_context


def results_context(name="North"):
    organization, coach, admin, run = taking_context(name)
    assert complete(client_for(coach), run).status_code == 200
    run.refresh_from_db()
    return organization, coach, admin, run


def another_run(run, *, team=None, days=1, state=EvaluationRunState.COMPLETED, scores=(7, 3)):
    team = team or run.team
    completed = state == EvaluationRunState.COMPLETED
    schedule, _ = EvaluationSchedule.objects.get_or_create(
        team=team,
        evaluation=run.evaluation,
        defaults={"assignee": run.assignee, "mode": "fixed", "first_due_date": run.due_date},
    )
    copy = EvaluationRun.objects.create(
        schedule=schedule,
        due_date=run.due_date + timedelta(days=days),
        organization=run.organization,
        organization_name=run.organization_name,
        team=team,
        team_name=team.name,
        evaluation=run.evaluation,
        evaluation_name=run.evaluation_name,
        assignee=run.assignee,
        assignee_name=run.assignee_name,
        state=state,
        completed_by=run.assignee if completed else None,
        completed_by_name=run.assignee_name if completed else "",
        completed_at=timezone.now() + timedelta(days=days) if completed else None,
    )
    if state != EvaluationRunState.NOT_STARTED:
        for question, score in zip(run.questions.all(), scores, strict=True):
            EvaluationRunQuestion.objects.create(
                run=copy,
                source_question=question.source_question,
                index=question.index,
                text=question.text,
                score=score,
            )
    return copy


def comparison_url(run):
    return reverse("result-comparison", kwargs={"evaluation_id": run.evaluation_id})
