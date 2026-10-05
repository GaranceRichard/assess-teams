from rest_framework.permissions import BasePermission

from identities.domain.users import Role


class CanTakeEvaluations(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user.is_authenticated
            and (user.is_superuser or user.role in (Role.ADMIN.value, Role.COACH.value))
        )
