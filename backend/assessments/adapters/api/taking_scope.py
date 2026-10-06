from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from assessments.application.taking_scope import evaluation_runs_for
from assessments.models import EvaluationRun
from identities.models import User


def visible_evaluation_runs(user: User) -> QuerySet[EvaluationRun]:
    return (
        evaluation_runs_for(user)
        .select_related(
            "organization",
            "team",
            "evaluation__family",
            "assignee",
            "schedule",
            "completed_by",
            "revised_by",
        )
        .prefetch_related("questions")
    )


def accessible_evaluation_run(user: User, run_id: int) -> EvaluationRun:
    return get_object_or_404(visible_evaluation_runs(user), pk=run_id)
