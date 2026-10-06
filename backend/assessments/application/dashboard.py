from django.db.models import F

from assessments.application.results import completed_results_for
from assessments.application.taking_scope import evaluation_runs_for
from assessments.models import EvaluationRunState, EvaluationStatus
from identities.domain.users import Role

ACTIVITY_LIMIT = 10


def consistent_runs(runs):
    return runs.filter(
        team__organization_id=F("organization_id"),
        evaluation__organization_id=F("organization_id"),
    )


def recent_activity(user):
    runs = consistent_runs(completed_results_for(user)).select_related("evaluation")
    events = []
    show_author = user.is_superuser or user.role != Role.VIEWER.value
    for kind, date_field, author_field in (
        ("completed", "completed_at", "completed_by_name"),
        ("revised", "revised_at", "revised_by_name"),
    ):
        # Two bounded queries preserve both provenances without scanning every run.
        recent = runs.filter(**{f"{date_field}__isnull": False}).order_by(f"-{date_field}", "-pk")[
            :ACTIVITY_LIMIT
        ]
        for run in recent:
            events.append(
                {
                    "run_id": run.pk,
                    "type": kind,
                    "organization_id": run.organization_id,
                    "organization_name": run.organization_name,
                    "team_name": run.team_name,
                    "model_name": run.evaluation_name,
                    "version": run.evaluation.version,
                    "occurred_at": getattr(run, date_field),
                    "author_name": getattr(run, author_field) or None if show_author else None,
                }
            )
    events.sort(
        key=lambda event: (event["occurred_at"], event["run_id"], event["type"]), reverse=True
    )
    return events[:ACTIVITY_LIMIT]


def pending_assignments(user):
    if user.is_superuser or user.role not in (Role.ADMIN.value, Role.COACH.value):
        return None
    # Count persisted assignments the user can start or resume, including future dates.
    return (
        consistent_runs(evaluation_runs_for(user))
        .filter(assignee=user)
        .exclude(state=EvaluationRunState.COMPLETED)
        .filter(team__is_active=True)
        .exclude(
            state=EvaluationRunState.NOT_STARTED,
            evaluation__status__in=(EvaluationStatus.DRAFT, EvaluationStatus.ARCHIVED),
        )
        .count()
    )


def dashboard_projection(user):
    return {
        "profile": user,
        "activity_scope": "global" if user.is_superuser else "accessible_results",
        "recent_activity": recent_activity(user),
        "pending_assignments": pending_assignments(user),
    }
