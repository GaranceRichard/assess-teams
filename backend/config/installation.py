"""Read the complete installation contract before exposing any effective settings."""

import json
import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from jsonschema import Draft202012Validator

from config.installation_paths import resolve_paths, selected_file
from config.installation_settings import installation_settings

LEGACY_NAMES = (
    "DJANGO_SECRET_KEY",
    "APP_BASE_URL",
    "DJANGO_ALLOWED_HOSTS",
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "DJANGO_TRUSTED_PROXIES",
    "LOGIN_TRUSTED_PROXIES",
    "LOGIN_ACCOUNT_LIMIT",
    "LOGIN_ORIGIN_LIMIT",
    "LOGIN_LIMIT_SECONDS",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USE_TLS",
    "EMAIL_USE_SSL",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "DEFAULT_FROM_EMAIL",
    "JOURNAL_ACTIVITY_RETENTION_DAYS",
    "JOURNAL_TECHNICAL_RETENTION_DAYS",
)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError
        result[key] = value
    return result


def reject_number(value):
    raise ValueError


def read_document(path):
    try:
        return json.loads(
            path.read_text(encoding="utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=reject_number,
            parse_float=reject_number,
        )
    except (OSError, UnicodeError, ValueError, RecursionError):
        raise ImproperlyConfigured(
            "ASSESS_CONFIG_FILE: document JSON UTF-8 v1 lisible requis, "
            "sans doublon ni nombre décimal."
        ) from None


def load_installation(environment=None):
    environment = os.environ if environment is None else environment
    source = selected_file(environment.get("ASSESS_CONFIG_FILE"))
    for name in LEGACY_NAMES:
        if name in environment:
            raise ImproperlyConfigured(
                f"{name}: source concurrente interdite avec ASSESS_CONFIG_FILE."
            )
    document = read_document(source)
    schema = json.loads(Path(__file__).with_name("installation.schema.json").read_text("utf-8"))
    if not Draft202012Validator(schema).is_valid(document):
        raise ImproperlyConfigured(
            "ASSESS_CONFIG_FILE: structure invalide ; respecter les champs et types du contrat v1."
        )
    # JSON Schema's numeric equality also accepts 1.0; the contract requires an integer version.
    if type(document["version"]) is not int:
        raise ImproperlyConfigured("ASSESS_CONFIG_FILE: version entière v1 requise.")
    document["_source"] = source
    resolve_paths(document, source.parent)
    settings = installation_settings(document)
    settings["INSTALLATION_CONFIG_FILE"] = source
    settings["INSTALLATION"] = document
    return settings
