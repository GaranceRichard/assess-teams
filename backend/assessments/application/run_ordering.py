from django.db.models import Case, DateTimeField, F, QuerySet, Value, When

from assessments.models import EvaluationRun, EvaluationRunState


def ordered_evaluation_runs(runs: QuerySet[EvaluationRun]) -> QuerySet[EvaluationRun]:
    completed = {"state": EvaluationRunState.COMPLETED}
    return runs.alias(
        completion_group=Case(When(**completed, then=Value(1)), default=Value(0)),
        pending_created_at=Case(
            When(**completed, then=Value(None)),
            default=F("created_at"),
            output_field=DateTimeField(),
        ),
        history_completed_at=Case(When(**completed, then=F("completed_at"))),
    ).order_by(
        "completion_group",
        F("pending_created_at").asc(nulls_last=True),
        F("history_completed_at").desc(nulls_last=True),
        "pk",
    )
