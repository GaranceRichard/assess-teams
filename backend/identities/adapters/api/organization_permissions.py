from rest_framework.permissions import BasePermission

from identities.adapters.api.admin_permissions import actor_for
from identities.domain.organizations import can_manage_organizations


class CanManageOrganizations(BasePermission):
    message = "Cette opération est interdite pour votre fonction."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user.is_authenticated and can_manage_organizations(actor_for(user)))
