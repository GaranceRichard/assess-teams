import uuid

from django.db import IntegrityError, transaction

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
    organization_origin_id: int | None = None,
    organization_name: str = "",
    team_name: str = "",
) -> LogEntry:
    if level not in LogLevel.values:
        raise ValueError("Niveau de log invalide.")
    if source not in LogSource.values:
        raise ValueError("Source de log invalide.")
    origin = organization.pk if organization and organization.pk else organization_origin_id
    organization_name = organization_name or (organization.name if organization else "")
    team_name = team_name or (team.name if team else "")
    evaluation_name = evaluation_name or (evaluation.name if evaluation else "")
    if organization is not None and organization.pk is None:
        organization = None
    return _persist_log(
        dict(
            organization_origin_id=origin,
            organization=organization,
            organization_name=sanitize_log_text(organization_name, 255),
            actor=actor,
            actor_name=sanitize_log_text(actor_snapshot(actor), 150),
            team=team,
            team_name=sanitize_log_text(team_name, 255),
            method=method,
            status_code=status_code,
            evaluation=evaluation,
            evaluation_name=sanitize_log_text(evaluation_name, 255),
            correlation_id=correlation_id or uuid.uuid4(),
            level=level,
            source=source,
            operation=sanitize_log_text(operation, 255),
            category=sanitize_log_text(category, 100),
            message=sanitize_log_text(message, 500, "Détail applicatif indisponible."),
        )
    )


def _persist_log(fields):
    try:
        # A normal read/refusal writes only its Log, never a business row.
        with transaction.atomic():
            entry = LogEntry.objects.create(**fields)
            organization = fields["organization"]
            # INSERT owns the writer lock; also check inside a surrounding transaction
            # where SQLite's deferred FK would otherwise fail only at the outer commit.
            if (
                organization is not None
                and not Organization.objects.filter(pk=organization.pk).exists()
            ):
                raise IntegrityError("The log organization disappeared before insertion.")
            return entry
    except IntegrityError:
        organization = fields["organization"]
        if organization is None or Organization.objects.filter(pk=organization.pk).exists():
            raise
        # The parent vanished before this INSERT acquired SQLite's writer lock.
        # Retry only this rolled-back database insertion, never HTTP or SMTP.
        fields.update(organization=None, team=None, evaluation=None)
        with transaction.atomic():
            return LogEntry.objects.create(**fields)
