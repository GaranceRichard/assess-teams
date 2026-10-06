from django.db.models import Q, QuerySet

from identities.domain.users import Role
from identities.models import User


def visible_managed_users(user: User) -> QuerySet[User]:
    users = User.objects.prefetch_related("organizations")
    if user.is_superuser:
        return users
    inactive_roles = [Role.VIEWER.value]
    if user.role == Role.ADMIN.value:
        inactive_roles.append(Role.COACH.value)
    return (
        users.filter(organizations__users=user)
        .filter(Q(is_active=True) | Q(role__in=inactive_roles, is_superuser=False))
        .distinct()
    )
