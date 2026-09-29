from dataclasses import dataclass

from identities.models import Organization
from journals.models import LogSource
from teams.models import Team


@dataclass(frozen=True)
class LogContext:
    operation: str
    source: LogSource
    organization: Organization | None = None
    team: Team | None = None


def describe_log_attempt(
    request,
    operation: str,
    source: LogSource,
    *,
    organization: Organization | None = None,
    team: Team | None = None,
) -> None:
    request.journal_log_context = LogContext(
        operation=operation,
        source=source,
        organization=organization,
        team=team,
    )
