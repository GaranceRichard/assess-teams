from django.db.models import QuerySet

from identities.adapters.api.organization_scope import assigned_admin_organization
from identities.models import User
from journals.models import ActivityEntry, ErrorEntry


def visible_activity_entries(user: User) -> QuerySet[ActivityEntry]:
    entries = ActivityEntry.objects.select_related("organization", "actor", "team")
    if user.is_superuser:
        return entries
    return entries.filter(organization=assigned_admin_organization(user))


def visible_error_entries(user: User) -> QuerySet[ErrorEntry]:
    entries = ErrorEntry.objects.select_related("organization", "actor", "team")
    if user.is_superuser:
        return entries
    return entries.filter(organization=assigned_admin_organization(user))
