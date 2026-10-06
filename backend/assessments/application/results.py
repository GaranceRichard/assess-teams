from django.db.models import OuterRef, Prefetch, Subquery

from assessments.application.taking_scope import evaluation_runs_for
from assessments.models import Evaluation, EvaluationRunQuestion, EvaluationRunState


def completed_results_for(user):
    return evaluation_runs_for(user).filter(state=EvaluationRunState.COMPLETED)


def result_versions_for(user):
    return (
        Evaluation.objects.filter(pk__in=completed_results_for(user).values("evaluation_id"))
        .select_related("family", "organization")
        .order_by("family__name", "version", "pk")
    )


def latest_team_results(user, evaluation_id):
    runs = completed_results_for(user).filter(evaluation_id=evaluation_id)
    latest = runs.filter(team_id=OuterRef("team_id")).order_by("-completed_at", "-pk")
    questions = EvaluationRunQuestion.objects.only(
        "run_id", "source_question_id", "lineage_id", "index", "text", "score"
    ).order_by("index", "pk")
    return (
        runs.filter(pk=Subquery(latest.values("pk")[:1]))
        .only("team_id", "team_name", "completed_at")
        .order_by("team_name", "team_id")
        .prefetch_related(Prefetch("questions", queryset=questions, to_attr="result_questions"))
    )


def snapshot_axes(questions, include_lineage):
    return [
        {
            "question_id": q.source_question_id,
            "index": q.index,
            "text": q.text,
            **({"lineage_id": q.lineage_id} if include_lineage else {}),
        }
        for q in questions
    ]


def comparison_results(user, evaluation_id, include_lineage=False):
    runs = list(latest_team_results(user, evaluation_id))
    # Validated versions are immutable. Use snapshots even if the live model is damaged.
    reference = runs[0].result_questions if runs else []
    axes = snapshot_axes(reference, include_lineage)
    teams = []
    for run in runs:
        run_axes = snapshot_axes(run.result_questions, include_lineage)
        scores = [q.score for q in run.result_questions]
        # Never align incompatible snapshots by label/position, or fall back to an older run.
        if not axes or run_axes != axes or None in scores:
            continue
        teams.append(
            {
                "team_id": run.team_id,
                "team_name": run.team_name,
                "run_id": run.pk,
                "completed_at": run.completed_at,
                "scores": scores,
            }
        )
    return {"axes": axes, "teams": teams}
