from django.db.models import QuerySet

from identities.domain.users import Role
from identities.models import User


def visible_managed_users(user: User) -> QuerySet[User]:
    users = User.objects.prefetch_related("organizations")
    if user.is_superuser or user.role == Role.ADMIN:
        return users
    return users.filter(organizations__users=user).distinct()
