from rest_framework.permissions import BasePermission

from identities.domain.users import Role


class CanCreateUser(BasePermission):
    message = "Vous n'avez pas le droit de créer un utilisateur."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user.is_authenticated or not user.is_active:
            return False
        return user.is_superuser or user.role == Role.ADMIN.value
