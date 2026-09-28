from django.db.models import QuerySet

from assessments.models import EvaluationSchedule
from identities.models import User


def visible_schedules(user: User) -> QuerySet[EvaluationSchedule]:
    schedules = EvaluationSchedule.objects.select_related(
        "team__organization",
        "evaluation",
    )
    if user.is_superuser:
        return schedules
    return schedules.filter(team__organization__users=user).distinct()
