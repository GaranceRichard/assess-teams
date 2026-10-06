import uuid

from assessments.models import Evaluation
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
    target_user: User | None = None,
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
        target_user=target_user,
        target_user_name=target_user.username if target_user else "",
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
    method: str = "",
    status_code: int | None = None,
    evaluation: Evaluation | None = None,
    evaluation_name: str = "",
    correlation_id: uuid.UUID | None = None,
    organization_name: str = "",
    team_name: str = "",
) -> LogEntry:
    if level not in LogLevel.values:
        raise ValueError("Niveau de log invalide.")
    if source not in LogSource.values:
        raise ValueError("Source de log invalide.")
    return LogEntry.objects.create(
        organization=organization,
        organization_name=sanitize_log_text(
            organization_name or (organization.name if organization else ""), 255
        ),
        actor=actor,
        actor_name=sanitize_log_text(actor_snapshot(actor), 150),
        team=team,
        team_name=sanitize_log_text(team_name or (team.name if team else ""), 255),
        method=method,
        status_code=status_code,
        evaluation=evaluation,
        evaluation_name=sanitize_log_text(
            evaluation_name or (evaluation.name if evaluation else ""), 255
        ),
        correlation_id=correlation_id or uuid.uuid4(),
        level=level,
        source=source,
        operation=sanitize_log_text(operation, 255),
        category=sanitize_log_text(category, 100),
        message=sanitize_log_text(message, 500, "Détail applicatif indisponible."),
    )
