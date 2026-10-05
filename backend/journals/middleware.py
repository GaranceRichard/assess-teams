import logging
import uuid

from journals.http_context import http_context
from journals.http_relations import live_http_relation
from journals.models import LogLevel
from journals.services import record_log

logger = logging.getLogger(__name__)
METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE"}
EXCLUDED = {"/api/health", "/api/schema", "/api/docs"}


def application_request(request):
    return (
        request.method in METHODS
        and request.path.startswith("/api/")
        and not any(
            request.path.rstrip("/") == path or request.path.startswith(path + "/")
            for path in EXCLUDED
        )
    )


class HttpLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not application_request(request):
            return self.get_response(request)
        request.journal_correlation_id = uuid.uuid4()
        response = self.get_response(request)
        response["X-Correlation-ID"] = str(request.journal_correlation_id)
        self.record_response(request, response.status_code)
        return response

    def process_exception(self, request, exception):
        request.journal_exception = exception

    def record_response(self, request, status_code):
        correlation_id = request.journal_correlation_id
        exception = getattr(request, "journal_exception", None)
        if status_code >= 500:
            logger.error(
                "Erreur HTTP correlation_id=%s",
                correlation_id,
                exc_info=(type(exception), exception, exception.__traceback__)
                if exception
                else None,
            )
        try:
            actor = getattr(request, "journal_actor", None) or getattr(request, "user", None)
            actor = actor if actor and actor.is_authenticated else None
            details, organization, team, evaluation = http_context(request, actor)
            level = (
                LogLevel.ERROR
                if status_code >= 500
                else LogLevel.WARNING
                if status_code >= 400
                else LogLevel.INFO
            )
            record_log(
                level=level,
                source=details.source,
                message=f"HTTP {request.method} {status_code}",
                operation=details.operation.replace("Échec de ", "").replace("Échec d’", ""),
                category="http",
                actor=actor,
                organization=live_http_relation(organization, status_code),
                team=live_http_relation(team, status_code, organization),
                method=request.method,
                status_code=status_code,
                evaluation=live_http_relation(evaluation, status_code, organization),
                evaluation_name=details.evaluation_name if evaluation else "",
                correlation_id=correlation_id,
                organization_name=details.organization_name,
                team_name=details.team_name if team else "",
            )
        except Exception:
            logger.exception("Enregistrement HTTP impossible correlation_id=%s", correlation_id)
