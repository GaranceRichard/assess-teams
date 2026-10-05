from dataclasses import dataclass

from assessments.models import Evaluation
from identities.models import Organization
from journals.models import LogSource
from teams.models import Team


@dataclass(frozen=True)
class LogContext:
    operation: str
    source: LogSource
    organization: Organization | None = None
    team: Team | None = None
    evaluation: Evaluation | None = None
    organization_name: str = ""
    team_name: str = ""
    evaluation_name: str = ""


def describe_log_attempt(
    request,
    operation: str,
    source: LogSource,
    *,
    organization: Organization | None = None,
    team: Team | None = None,
    evaluation: Evaluation | None = None,
) -> None:
    context = LogContext(
        operation=operation,
        source=source,
        organization=organization,
        team=team,
        evaluation=evaluation,
        organization_name=organization.name if organization else "",
        team_name=team.name if team else "",
        evaluation_name=evaluation.name if evaluation else "",
    )
    # DRF wraps HttpRequest; middleware must see the same trusted context.
    getattr(request, "_request", request).journal_log_context = context
