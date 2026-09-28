from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from assessments.models import Evaluation, Question
from identities.models import User


def visible_evaluations(user: User) -> QuerySet[Evaluation]:
    evaluations = Evaluation.objects.select_related("organization")
    if user.is_superuser:
        return evaluations
    return evaluations.filter(organization__users=user).distinct()


def manageable_evaluation(user: User, evaluation_id: int) -> Evaluation:
    return get_object_or_404(visible_evaluations(user), pk=evaluation_id)


def manageable_question(user: User, question_id: int) -> Question:
    questions = Question.objects.select_related("evaluation__organization")
    if not user.is_superuser:
        questions = questions.filter(evaluation__organization__users=user)
    return get_object_or_404(questions, pk=question_id)
