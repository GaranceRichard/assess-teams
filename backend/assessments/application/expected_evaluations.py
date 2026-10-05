from django.db import transaction

from assessments.models import EvaluationRun, EvaluationRunState, EvaluationSchedule


@transaction.atomic
def ensure_expected_evaluation(schedule: EvaluationSchedule, due_date=None) -> EvaluationRun | None:
    if schedule.assignee is None:
        return None
    context = {
        "organization": schedule.team.organization,
        "organization_name": schedule.team.organization.name,
        "team": schedule.team,
        "team_name": schedule.team.name,
        "evaluation": schedule.evaluation,
        "evaluation_name": schedule.evaluation.name,
        "assignee": schedule.assignee,
        "assignee_name": schedule.assignee.username,
    }
    run, created = EvaluationRun.objects.select_for_update().get_or_create(
        schedule=schedule,
        due_date=due_date or schedule.first_due_date,
        defaults=context,
    )
    if not created and run.state == EvaluationRunState.NOT_STARTED:
        for field, value in context.items():
            setattr(run, field, value)
        run.save(update_fields=list(context))
    return run
