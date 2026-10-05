from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from assessments.models import EvaluationRun
from identities.domain.users import Role
from identities.models import User


def is_evaluation_admin(user: User) -> bool:
    return bool(user.is_superuser or user.role == Role.ADMIN.value)


def visible_evaluation_runs(user: User) -> QuerySet[EvaluationRun]:
    runs = EvaluationRun.objects.select_related(
        "organization",
        "team",
        "evaluation",
        "assignee",
        "completed_by",
        "revised_by",
    ).prefetch_related("questions")
    if user.is_superuser:
        return runs
    if user.role == Role.ADMIN.value:
        return runs.filter(organization__users=user).distinct()
    if user.role == Role.COACH.value:
        return runs.filter(assignee=user, organization__users=user).distinct()
    return runs.none()


def accessible_evaluation_run(user: User, run_id: int) -> EvaluationRun:
    return get_object_or_404(visible_evaluation_runs(user), pk=run_id)
