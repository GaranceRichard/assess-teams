from rest_framework.permissions import SAFE_METHODS, BasePermission

from identities.domain.users import Role


class CanReadTeams(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            request.method in SAFE_METHODS
            and user.is_authenticated
            and user.is_active
            and (user.is_superuser or user.role in {Role.ADMIN, Role.COACH})
        )
