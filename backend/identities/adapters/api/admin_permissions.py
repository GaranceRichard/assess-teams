from rest_framework.permissions import BasePermission

from identities.domain.managed_users import can_view_managed_users
from identities.domain.users import Actor, Role


def actor_for(user) -> Actor:
    role = Role(user.role) if user.role else None
    return Actor(user.is_active, user.is_superuser, role)


class CanViewManagedUsers(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user.is_authenticated and can_view_managed_users(actor_for(user)))
