from dataclasses import dataclass

from identities.models import Organization
from teams.models import Team


@dataclass(frozen=True)
class ErrorContext:
    operation: str
    organization: Organization | None = None
    team: Team | None = None


def describe_attempt(
    request,
    operation: str,
    *,
    organization: Organization | None = None,
    team: Team | None = None,
) -> None:
    request.journal_error_context = ErrorContext(
        operation=operation,
        organization=organization,
        team=team,
    )
