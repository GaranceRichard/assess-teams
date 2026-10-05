import logging

from django.db.models.deletion import ProtectedError
from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler

from journals.log_context import LogContext
from journals.models import LogLevel, LogSource
from journals.services import record_log

logger = logging.getLogger(__name__)

SAFE_MESSAGES = {
    400: "Les données fournies ne permettent pas de réaliser l’opération.",
    401: "L’authentification requise a échoué.",
    403: "L’opération n’est pas autorisée.",
    404: "La ressource demandée est introuvable.",
    405: "Cette opération n’est pas disponible.",
    409: "L’opération entre en conflit avec l’état courant.",
}


def journal_exception_handler(exc, context):
    if isinstance(exc, ProtectedError):
        exc = ValidationError("Cette ressource est utilisée par une passation conservée.")
    response = exception_handler(exc, context)
    request = context.get("request")
    if _must_record(request, response):
        _record_safely(request, exc, response)
    return response


def _must_record(request, response) -> bool:
    return bool(
        request
        and request.method in {"POST", "PUT", "PATCH", "DELETE"}
        and request.path.startswith(("/api/admin/", "/api/evaluations/"))
        and (response is None or response.status_code >= 400)
    )


def _record_safely(request, exc, response) -> None:
    details = getattr(request, "journal_log_context", None)
    if not details:
        details = LogContext(
            operation="Échec d’une opération administrative",
            source=LogSource.SYSTEM,
        )
    status_code = response.status_code if response else 500
    message = SAFE_MESSAGES.get(status_code, "Une erreur interne est survenue.")
    actor = request.user if getattr(request.user, "is_authenticated", False) else None
    try:
        entry = record_log(
            level=LogLevel.ERROR,
            source=details.source,
            message=message,
            actor=actor,
            organization=details.organization,
            operation=details.operation,
            category=type(exc).__name__,
            team=details.team,
        )
        if response is None or status_code >= 500:
            logger.error(
                "Erreur applicative correlation_id=%s",
                entry.correlation_id,
                exc_info=(type(exc), exc, exc.__traceback__),
            )
    except Exception:
        logger.exception("Impossible d’enregistrer un log applicatif")
