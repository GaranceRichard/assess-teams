from rest_framework.permissions import BasePermission

from identities.domain.users import Role


class CanViewJournals(BasePermission):
    message = "Le Journal est réservé aux Superadmins et Admins."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user.is_authenticated
            and user.is_active
            and (user.is_superuser or user.role == Role.ADMIN.value)
        )
