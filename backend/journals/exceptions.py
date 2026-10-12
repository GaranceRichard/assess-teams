from django.db.models.deletion import ProtectedError
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler, set_rollback

OPERATION_FAILED = "L’opération n’a pas pu être réalisée. Veuillez réessayer."


def journal_exception_handler(exc, context):
    if isinstance(exc, ProtectedError):
        exc = ValidationError("Cette ressource est utilisée par une passation conservée.")
    response = exception_handler(exc, context)
    request = context.get("request")
    if request is not None and (response is None or response.status_code >= 500):
        getattr(request, "_request", request).journal_exception = exc
    if response is None:
        # Business atomic blocks have already unwound before DRF handles the error.
        set_rollback()
        return Response({"detail": OPERATION_FAILED}, status=500)
    return response
