from identities.models import Organization, User
from journals.models import (
    ActivityAction,
    ActivityEntry,
    LogEntry,
    LogLevel,
    LogSource,
)
from journals.sanitization import sanitize_log_text
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


def record_log(
    *,
    level: LogLevel | str,
    source: LogSource | str,
    message: str,
    actor: User | None = None,
    organization: Organization | None = None,
    team: Team | None = None,
    operation: str = "",
    category: str = "",
) -> LogEntry:
    if level not in LogLevel.values:
        raise ValueError("Niveau de log invalide.")
    if source not in LogSource.values:
        raise ValueError("Source de log invalide.")
    return LogEntry.objects.create(
        organization=organization,
        organization_name=organization.name if organization else "",
        actor=actor,
        actor_name=actor_snapshot(actor),
        team=team,
        team_name=team.name if team else "",
        level=level,
        source=source,
        operation=sanitize_log_text(operation, 255),
        category=sanitize_log_text(category, 100),
        message=sanitize_log_text(message, 500, "Détail applicatif indisponible."),
    )
