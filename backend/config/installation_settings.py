"""Adapt the acquired contract to existing security validators, without environment writes."""

import re
from copy import deepcopy
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.core.exceptions import ImproperlyConfigured

from config.email_security import validate_email_settings
from config.http_security import production_http_settings
from config.journal_retention import journal_retention_settings
from config.secret_security import require_secret


def read_secret(path, name, minimum):
    try:
        value = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        raise ImproperlyConfigured(f"{name}: fichier privé UTF-8 lisible requis.") from None
    return require_secret(value, name, minimum=minimum)


def installation_settings(document):
    # Import here to keep startup validation independent of the loader at module import time.
    from config.startup_security import validate_proxy_consistency

    http, smtp, services = (document[name] for name in ("http", "smtp", "services"))
    environment = {"APP_BASE_URL": http["origin"]}
    for field, name in (
        ("hosts", "DJANGO_ALLOWED_HOSTS"),
        ("csrf_origins", "DJANGO_CSRF_TRUSTED_ORIGINS"),
        ("proxies", "DJANGO_TRUSTED_PROXIES"),
    ):
        if field in http:
            if any("," in value or value != value.strip() for value in http[field]):
                raise ImproperlyConfigured(f"{name}: entrées exactes requises.")
            environment[name] = ",".join(http[field])
    result = production_http_settings(environment)
    login_proxies = http.get("login_proxies", [])
    validate_proxy_consistency(result["TRUSTED_PROXIES"], login_proxies)
    result["LOGIN_TRUSTED_PROXIES"] = login_proxies
    for field, name, default in (
        ("account_limit", "LOGIN_ACCOUNT_LIMIT", 5),
        ("origin_limit", "LOGIN_ORIGIN_LIMIT", 30),
        ("limit_seconds", "LOGIN_LIMIT_SECONDS", 900),
    ):
        result[name] = http.get(field, default)
    try:
        ZoneInfo(services["timezone"])
    except (ValueError, ZoneInfoNotFoundError):
        raise ImproperlyConfigured("services.timezone: zone IANA valide requise.") from None
    account = re.split(r"[\\/@]", services["account"].strip().casefold())
    if any(
        name in {"root", "admin", "administrator", "administrateur", "system", "localsystem"}
        for name in account
    ):
        raise ImproperlyConfigured("services.account: compte de service non administrateur requis.")
    references = document["secrets"]
    result["SECRET_KEY"] = read_secret(references["django_key_file"], "DJANGO_SECRET_KEY", 50)
    credential = ""
    if "smtp_credential_file" in references:
        credential = read_secret(references["smtp_credential_file"], "EMAIL_HOST_PASSWORD", 16)
    result.update(
        {
            "EMAIL_HOST": smtp["host"],
            "EMAIL_PORT": smtp["port"],
            "EMAIL_USE_TLS": smtp["starttls"],
            "EMAIL_USE_SSL": smtp["ssl"],
            "EMAIL_HOST_USER": smtp.get("user", ""),
            "EMAIL_HOST_PASSWORD": credential,
            "DEFAULT_FROM_EMAIL": smtp["sender"],
        }
    )
    validate_email_settings(result)
    result["JOURNAL_RETENTION"] = journal_retention_settings(
        {
            "JOURNAL_ACTIVITY_RETENTION_DAYS": str(document["journals"]["activity"]),
            "JOURNAL_TECHNICAL_RETENTION_DAYS": str(document["journals"]["technical"]),
        }
    )
    result["STATIC_ROOT"] = document["paths"]["static"]
    result["FILE_UPLOAD_TEMP_DIR"] = str(document["paths"]["tmp"])
    result["TIME_ZONE"] = services["timezone"]
    from django.db.utils import ConnectionHandler

    from config.settings_base import DATABASES

    result["DATABASES"] = deepcopy(DATABASES)
    result["DATABASES"]["default"]["NAME"] = document["sqlite"]["file"]
    result["DATABASES"] = ConnectionHandler(result["DATABASES"]).settings
    return result
