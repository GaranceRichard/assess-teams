from journals.log_context import LogContext
from journals.models import LogSource

SOURCE_PREFIXES = (
    ("team", LogSource.TEAMS),
    ("evaluation-schedule", LogSource.PLANNING),
    ("evaluation", LogSource.ASSESSMENTS),
    ("question", LogSource.ASSESSMENTS),
    ("organization", LogSource.ORGANIZATIONS),
    ("managed-user", LogSource.IDENTITIES),
    ("session", LogSource.IDENTITIES),
    ("password", LogSource.IDENTITIES),
    ("invitation", LogSource.IDENTITIES),
    ("user", LogSource.IDENTITIES),
)


def http_context(request, actor):
    match = getattr(request, "resolver_match", None)
    route = match.url_name if match and match.url_name else "api-request"
    source = next(
        (value for prefix, value in SOURCE_PREFIXES if route.startswith(prefix)),
        LogSource.SYSTEM,
    )
    details = getattr(request, "journal_log_context", LogContext(route, source))
    organization = details.organization
    if actor and not actor.is_superuser:
        # Only actor memberships are consulted, never a foreign resource identifier.
        memberships = list(actor.organizations.all()[:2])
        own = memberships[0] if len(memberships) == 1 else None
        if organization is None or own is None or organization.pk != own.pk:
            organization = own
            details = LogContext(route, source, organization=own)
    team = details.team
    evaluation = details.evaluation
    if team and (not organization or team.organization_id != organization.pk):
        team = None
    if evaluation and (not organization or evaluation.organization_id != organization.pk):
        evaluation = None
    return details, organization, team, evaluation
