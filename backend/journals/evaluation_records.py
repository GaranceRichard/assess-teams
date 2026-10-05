from assessments.models import Evaluation, EvaluationRun, EvaluationSchedule, Question
from identities.models import User
from journals.models import ActivityAction
from journals.services import record_activity


def version_description(description: str, evaluation: Evaluation) -> str:
    return (
        f"{description} — {evaluation.family.name} v{evaluation.version} "
        f"(famille #{evaluation.family_id})"
    )


def evaluation_activity(
    actor: User,
    evaluation: Evaluation,
    action: ActivityAction,
    description: str,
) -> None:
    record_activity(
        actor=actor,
        organization=evaluation.organization,
        action=action,
        description=version_description(description, evaluation),
    )


def question_activity(
    actor: User,
    question: Question,
    action: ActivityAction,
    description: str,
) -> None:
    evaluation_activity(actor, question.evaluation, action, description)


def evaluation_scheduled(actor: User, schedule: EvaluationSchedule) -> None:
    record_activity(
        actor=actor,
        organization=schedule.team.organization,
        team=schedule.team,
        action=ActivityAction.EVALUATION_SCHEDULED,
        description=f"Planification de l’évaluation {schedule.evaluation.name}",
    )


def evaluation_schedule_updated(actor: User, schedule: EvaluationSchedule) -> None:
    record_activity(
        actor=actor,
        organization=schedule.team.organization,
        team=schedule.team,
        action=ActivityAction.EVALUATION_SCHEDULE_UPDATED,
        description=f"Modification de la planification {schedule.evaluation.name}",
    )


def evaluation_schedule_deleted(actor: User, schedule: EvaluationSchedule) -> None:
    record_activity(
        actor=actor,
        organization=schedule.team.organization,
        team=schedule.team,
        action=ActivityAction.EVALUATION_SCHEDULE_DELETED,
        description=f"Suppression de la planification {schedule.evaluation.name}",
    )


def evaluation_run_activity(
    actor: User,
    run: EvaluationRun,
    action: ActivityAction,
    description: str,
) -> None:
    record_activity(
        actor=actor,
        organization=run.organization,
        team=run.team,
        action=action,
        description=description,
    )
