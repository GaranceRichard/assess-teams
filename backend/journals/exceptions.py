import logging

from rest_framework.views import exception_handler

from journals.error_context import ErrorContext
from journals.services import record_error

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
    response = exception_handler(exc, context)
    request = context.get("request")
    if _must_record(request, response):
        _record_safely(request, exc, response)
    return response


def _must_record(request, response) -> bool:
    return bool(
        request
        and request.method in {"POST", "PUT", "PATCH", "DELETE"}
        and request.path.startswith("/api/admin/")
        and (response is None or response.status_code >= 400)
    )


def _record_safely(request, exc, response) -> None:
    details = getattr(request, "journal_error_context", None)
    if not details:
        details = ErrorContext(operation="Échec d’une opération administrative")
    status_code = response.status_code if response else 500
    message = SAFE_MESSAGES.get(status_code, "Une erreur interne est survenue.")
    actor = request.user if getattr(request.user, "is_authenticated", False) else None
    try:
        record_error(
            actor=actor,
            organization=details.organization,
            operation=details.operation,
            category=type(exc).__name__,
            message=message,
            team=details.team,
        )
    except Exception:
        logger.exception("Impossible d’enregistrer une entrée du Journal des erreurs")
