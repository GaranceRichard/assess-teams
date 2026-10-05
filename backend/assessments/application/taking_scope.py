from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from assessments.models import EvaluationRun
from identities.domain.users import Role
from identities.models import User


def is_evaluation_admin(user: User) -> bool:
    return bool(user.is_superuser or user.role == Role.ADMIN.value)


def evaluation_runs_for(user: User) -> QuerySet[EvaluationRun]:
    runs = EvaluationRun.objects.all()
    if not user.is_active:
        return runs.none()
    if user.is_superuser:
        return runs
    organizations = user.organizations.values("pk")
    if user.role == Role.ADMIN.value:
        return runs.filter(organization_id__in=organizations)
    if user.role == Role.COACH.value:
        return runs.filter(assignee=user, organization_id__in=organizations)
    return runs.none()


def locked_evaluation_run(run: EvaluationRun, actor: User) -> EvaluationRun:
    # Lock the current row before checking its assignment and organization again.
    current = get_object_or_404(EvaluationRun.objects.select_for_update(), pk=run.pk)
    get_object_or_404(evaluation_runs_for(actor).only("pk"), pk=current.pk)
    return current
