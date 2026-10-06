from django.db import transaction
from django.db.models import Count, Exists, Min, OuterRef, Prefetch, Q, Subquery
from django.utils import timezone

from assessments.application.results import completed_results_for
from assessments.application.taking_scope import evaluation_runs_for
from assessments.models import EvaluationRunState, EvaluationSchedule
from identities.models import Organization, User
from teams.models import Team


@transaction.atomic
def steering_projection(user: User, organization: Organization) -> dict:
    today = timezone.localdate()
    runs = evaluation_runs_for(user).filter(
        organization=organization,
        team__organization=organization,
        team__is_active=True,
        evaluation__organization=organization,
    )
    completed = completed_results_for(user).filter(
        organization=organization,
        team__organization=organization,
        team__is_active=True,
        evaluation__organization=organization,
    )
    latest = completed.filter(team_id=OuterRef("pk")).order_by("-completed_at", "-pk")
    coaches = User.objects.filter(role="Coach", organizations=organization).order_by(
        "username", "pk"
    )
    teams = list(
        Team.objects.filter(organization=organization, is_active=True)
        .annotate(latest_run_id=Subquery(latest.values("pk")[:1]))
        .prefetch_related(Prefetch("coaches", queryset=coaches, to_attr="current_coaches"))
    )
    last_runs = {
        run.pk: run
        for run in completed.filter(pk__in=[team.latest_run_id for team in teams]).select_related(
            "evaluation"
        )
    }
    pending = {
        row["team_id"]: row
        for row in runs.exclude(state=EvaluationRunState.COMPLETED)
        .order_by()
        .values("team_id")
        .annotate(next_due=Min("due_date"), overdue=Count("pk", filter=Q(due_date__lt=today)))
    }
    satisfied = runs.filter(
        schedule_id=OuterRef("pk"),
        due_date=OuterRef("next_due_date"),
        state=EvaluationRunState.COMPLETED,
    )
    next_dates = {
        row["team_id"]: row["next_due"]
        for row in EvaluationSchedule.objects.filter(
            team__organization=organization,
            team__is_active=True,
            evaluation__organization=organization,
            next_due_date__isnull=False,
        )
        .filter(~Exists(satisfied))
        .order_by()
        .values("team_id")
        .annotate(next_due=Min("next_due_date"))
    }
    rows = []
    for team in teams:
        last = last_runs.get(team.latest_run_id)
        expected = pending.get(team.pk, {})
        dates = [d for d in (expected.get("next_due"), next_dates.get(team.pk)) if d]
        status = (
            "never_evaluated"
            if last is None
            else ("overdue" if expected.get("overdue", 0) else "up_to_date")
        )
        rows.append(
            {
                "team_id": team.pk,
                "team_name": team.name,
                "coaches": [{"id": c.pk, "name": c.username} for c in team.current_coaches],
                "last_result": None
                if last is None
                else {
                    "run_id": last.pk,
                    "evaluation_id": last.evaluation_id,
                    "family_id": last.evaluation.family_id,
                    "model_name": last.evaluation_name,
                    "version": last.evaluation.version,
                    "completed_at": last.completed_at,
                },
                "next_due_date": min(dates) if dates else None,
                "status": status,
            }
        )
    order = {"overdue": 0, "never_evaluated": 1, "up_to_date": 2}
    rows.sort(key=lambda row: (order[row["status"]], row["team_name"].casefold(), row["team_id"]))
    dates = [run.completed_at for run in last_runs.values()]
    return {
        "organization": {"id": organization.pk, "name": organization.name},
        "as_of_date": today,
        "summary": {
            "active_teams": len(teams),
            "teams_with_results": len(last_runs),
            "teams_without_results": len(teams) - len(last_runs),
            "overdue_evaluations": sum(row["overdue"] for row in pending.values()),
            "last_completed_at": max(dates) if dates else None,
        },
        "teams": rows,
    }
