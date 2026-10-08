from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from assessments.application.taking_scope import locked_evaluation_run
from assessments.models import (
    Evaluation,
    EvaluationRun,
    EvaluationRunQuestion,
    EvaluationRunState,
    EvaluationStatus,
)
from identities.models import User
from journals.activity_records import evaluation_run_activity
from journals.models import ActivityAction


def _actor_name(actor: User) -> str:
    return actor.username


@transaction.atomic
def start_evaluation(run: EvaluationRun, actor: User) -> EvaluationRun:
    run = locked_evaluation_run(run, actor)
    if run.state != EvaluationRunState.NOT_STARTED:
        return run
    if run.assignee is None:
        raise ValidationError("Cette planification ne possède plus d’assigné.")
    if not run.team.is_active:
        raise ValidationError("Une équipe archivée ne peut pas démarrer une passation.")
    evaluation = Evaluation.objects.select_for_update().get(pk=run.evaluation_id)
    if (
        evaluation.organization_id != run.organization_id
        or run.team.organization_id != run.organization_id
    ):
        raise ValidationError(
            "Le modèle et l’équipe doivent relever de l’organisation de la passation."
        )
    if evaluation.status != EvaluationStatus.VALIDATED:
        raise ValidationError("Seul un modèle validé peut démarrer une nouvelle passation.")
    questions = list(evaluation.questions.prefetch_related("score_guides").order_by("index", "pk"))
    if not questions:
        raise ValidationError("Le modèle planifié ne contient aucune question.")
    run.state = EvaluationRunState.IN_PROGRESS
    run.evaluation_name = evaluation.name
    run.save(update_fields=("state", "evaluation_name"))
    EvaluationRunQuestion.objects.bulk_create(
        [
            EvaluationRunQuestion(
                run=run,
                source_question=question,
                lineage_id=question.lineage_id,
                index=question.index,
                text=question.name,
                score_guides=[
                    {"score": guide.score, "text": guide.text}
                    for guide in question.score_guides.all()
                ],
            )
            for question in questions
        ]
    )
    return run


@transaction.atomic
def save_evaluation_score(run: EvaluationRun, actor: User, question_id: int, score: int) -> None:
    run = locked_evaluation_run(run, actor)
    if run.state != EvaluationRunState.IN_PROGRESS:
        raise ValidationError("Seule une passation en cours peut être modifiée.")
    question = run.questions.filter(source_question_id=question_id).first()
    if question is None:
        raise ValidationError({"question_id": "Cette question n’appartient pas à la passation."})
    question.score = score
    question.save(update_fields=["score"])


@transaction.atomic
def complete_evaluation(run: EvaluationRun, actor: User) -> EvaluationRun:
    run = locked_evaluation_run(run, actor)
    if run.state == EvaluationRunState.COMPLETED:
        return run
    if not run.questions.exists() or run.questions.filter(score__isnull=True).exists():
        raise ValidationError("Toutes les questions doivent avoir une note valide.")
    run.state = EvaluationRunState.COMPLETED
    run.completed_by = actor
    run.completed_by_name = _actor_name(actor)
    run.completed_at = timezone.now()
    run.save(update_fields=("state", "completed_by", "completed_by_name", "completed_at"))
    proxy_completion = actor.pk != run.assignee_id
    evaluation_run_activity(
        actor,
        run,
        (
            ActivityAction.EVALUATION_COMPLETED_BY_ADMIN
            if proxy_completion
            else ActivityAction.EVALUATION_COMPLETED
        ),
        (
            f"Complétion par un Admin de l’évaluation {run.evaluation_name}"
            if proxy_completion
            else f"Complétion de l’évaluation {run.evaluation_name}"
        ),
    )
    return run


@transaction.atomic
def revise_evaluation(run: EvaluationRun, actor: User, answers: list[dict]) -> EvaluationRun:
    run = locked_evaluation_run(run, actor)
    if run.state != EvaluationRunState.COMPLETED:
        raise ValidationError("Seule une évaluation complétée peut être révisée.")
    questions = list(run.questions.all())
    scores = {answer["question_id"]: answer["score"] for answer in answers}
    expected = {question.source_question_id for question in questions}
    if set(scores) != expected:
        raise ValidationError("La révision doit contenir exactement toutes les questions.")
    for question in questions:
        question.score = scores[question.source_question_id]
    EvaluationRunQuestion.objects.bulk_update(questions, ["score"])
    run.revised_by = actor
    run.revised_by_name = _actor_name(actor)
    run.revised_at = timezone.now()
    run.save(update_fields=("revised_by", "revised_by_name", "revised_at"))
    evaluation_run_activity(
        actor,
        run,
        ActivityAction.EVALUATION_REVISED,
        f"Révision de l’évaluation {run.evaluation_name}",
    )
    return run
