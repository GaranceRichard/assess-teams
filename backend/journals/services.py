from identities.models import Organization, User
from journals.models import ActivityAction, ActivityEntry, ErrorEntry
from teams.models import Team


def actor_snapshot(actor: User | None) -> str:
    if not actor:
        return ""
    return "Superadmin" if actor.is_superuser else actor.username


def record_activity(
    *,
    actor: User,
    organization: Organization | None,
    action: ActivityAction,
    description: str,
    team: Team | None = None,
) -> ActivityEntry:
    return ActivityEntry.objects.create(
        organization=organization,
        organization_name=organization.name if organization else "",
        actor=actor,
        actor_name=actor_snapshot(actor),
        team=team,
        team_name=team.name if team else "",
        action=action,
        description=description,
    )


def record_error(
    *,
    actor: User | None,
    organization: Organization | None,
    operation: str,
    category: str,
    message: str,
    team: Team | None = None,
) -> ErrorEntry:
    return ErrorEntry.objects.create(
        organization=organization,
        organization_name=organization.name if organization else "",
        actor=actor,
        actor_name=actor_snapshot(actor),
        team=team,
        team_name=team.name if team else "",
        operation=operation,
        category=category[:100],
        message=message[:500],
    )
