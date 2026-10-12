from journals.exceptions import OPERATION_FAILED


def operation_errors(result, generator, request, public):
    """Describe the safe fallback shared by the DRF exception handler."""
    for path, item in result["paths"].items():
        if path in {"/api/health/", "/api/schema/", "/api/docs/"}:
            continue
        for method, operation in item.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            operation["responses"].setdefault(
                "500",
                {
                    "description": "Erreur interne : opération non réalisée.",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {"detail": {"type": "string"}},
                                "required": ["detail"],
                            },
                            "example": {"detail": OPERATION_FAILED},
                        }
                    },
                },
            )
    return result
