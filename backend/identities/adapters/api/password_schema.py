def strict_password_requests(result, generator, request, public):
    schemas = result.get("components", {}).get("schemas", {})
    for name in ("PasswordRecovery", "PasswordReset", "PasswordChange"):
        if name in schemas:
            schemas[name]["additionalProperties"] = False
    return result
