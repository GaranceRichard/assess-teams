from rest_framework.permissions import SAFE_METHODS, BasePermission

from identities.domain.managed_users import (
    can_change_managed_users,
    can_view_managed_users,
)
from identities.domain.users import Actor, Role


def actor_for(user) -> Actor:
    role = Role(user.role) if user.role else None
    return Actor(user.is_active, user.is_superuser, role)


class CanViewManagedUsers(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user.is_authenticated:
            return False
        actor = actor_for(user)
        if request.method in SAFE_METHODS:
            return can_view_managed_users(actor)
        return can_change_managed_users(actor)
