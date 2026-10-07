from django.db.models import Q, QuerySet

from identities.adapters.api.admin_serializers import ManagedUserQuerySerializer
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


def filtered_managed_users(user: User, params) -> QuerySet[User]:
    query = ManagedUserQuerySerializer(data=params)
    query.is_valid(raise_exception=True)
    users = visible_managed_users(user).order_by("username", "email", "pk")
    search = query.validated_data.get("search", "")
    if search:
        users = users.filter(Q(username__icontains=search) | Q(email__icontains=search))
    return users
