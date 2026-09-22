from rest_framework.permissions import BasePermission


class IsSuperadmin(BasePermission):
    message = "Cette opération est réservée au Superadmin."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user.is_authenticated and user.is_active and user.is_superuser)
