from rest_framework.permissions import BasePermission

from assessments.domain.permissions import can_manage_evaluations
from identities.adapters.api.admin_permissions import actor_for


class CanManageEvaluations(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user.is_authenticated and can_manage_evaluations(actor_for(user)))
