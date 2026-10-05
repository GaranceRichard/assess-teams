from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from assessments.models import EvaluationSchedule
from identities.models import User


def visible_schedules(user: User) -> QuerySet[EvaluationSchedule]:
    schedules = EvaluationSchedule.objects.select_related(
        "team__organization",
        "evaluation__family",
        "assignee",
    )
    if user.is_superuser:
        return schedules
    return schedules.filter(team__organization__users=user).distinct()


def manageable_schedule(user: User, schedule_id: int) -> EvaluationSchedule:
    return get_object_or_404(visible_schedules(user), pk=schedule_id)
