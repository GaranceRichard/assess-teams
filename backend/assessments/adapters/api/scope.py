from django.db.models import F, QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from assessments.models import Evaluation, EvaluationStatus, Question
from identities.models import Organization, User


def visible_evaluations(user: User) -> QuerySet[Evaluation]:
    evaluations = Evaluation.objects.select_related("organization", "family")
    if user.is_superuser:
        return evaluations
    return evaluations.filter(organization__users=user).distinct()


def manageable_evaluation(user: User, evaluation_id: int) -> Evaluation:
    return get_object_or_404(visible_evaluations(user), pk=evaluation_id)


def mutable_evaluation(user: User, evaluation_id: int) -> Evaluation:
    evaluation = locked_evaluation(user, evaluation_id)
    ensure_evaluation_is_draft(evaluation)
    return evaluation


def manageable_question(user: User, question_id: int) -> Question:
    questions = Question.objects.select_related("evaluation__organization")
    if not user.is_superuser:
        questions = questions.filter(evaluation__organization__users=user)
    return get_object_or_404(questions, pk=question_id)


def mutable_question(user: User, question_id: int) -> Question:
    visible = visible_evaluations(user).filter(questions__pk=question_id)
    Organization.objects.filter(pk__in=visible.values("organization_id")).update(name=F("name"))
    question = manageable_question(user, question_id)
    mutable_evaluation(user, question.evaluation_id)
    return question


def ensure_evaluation_is_draft(evaluation: Evaluation) -> None:
    if evaluation.status != EvaluationStatus.DRAFT:
        raise ValidationError("Une évaluation validée ou archivée est immuable.")


def locked_evaluation(user: User, evaluation_id: int) -> Evaluation:
    # A write before reads serializes SQLite too (select_for_update is a no-op there).
    visible = visible_evaluations(user).filter(pk=evaluation_id)
    Organization.objects.filter(pk__in=visible.values("organization_id")).update(name=F("name"))
    return get_object_or_404(visible.select_for_update(), pk=evaluation_id)
