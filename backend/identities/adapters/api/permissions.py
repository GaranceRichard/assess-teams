from rest_framework.permissions import BasePermission


class CanCreateUser(BasePermission):
    message = "Vous n'avez pas le droit de créer un utilisateur."

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user.is_authenticated or not user.is_active:
            return False
        return user.is_superuser
