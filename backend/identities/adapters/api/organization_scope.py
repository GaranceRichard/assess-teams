from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from identities.domain.users import Role
from identities.models import Organization, User


def visible_organizations(user: User) -> QuerySet[Organization]:
    organizations = Organization.objects.prefetch_related("users")
    if user.is_superuser:
        return organizations
    return organizations.filter(users=user).distinct()


def manageable_organization(user: User, organization_id: int) -> Organization:
    return get_object_or_404(visible_organizations(user), pk=organization_id)


def assigned_admin_organization(user: User) -> Organization:
    organizations = visible_organizations(user)
    if user.role != Role.ADMIN.value or organizations.count() != 1:
        raise PermissionDenied("Un Admin doit être affecté à une organisation unique.")
    return organizations.get()
