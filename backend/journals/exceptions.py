from django.db.models.deletion import ProtectedError
from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def journal_exception_handler(exc, context):
    if isinstance(exc, ProtectedError):
        exc = ValidationError("Cette ressource est utilisée par une passation conservée.")
    response = exception_handler(exc, context)
    request = context.get("request")
    if request is not None and (response is None or response.status_code >= 500):
        getattr(request, "_request", request).journal_exception = exc
    return response
