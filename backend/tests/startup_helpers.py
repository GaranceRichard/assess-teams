import os
import subprocess
import sys
from pathlib import Path

from config.installation import LEGACY_NAMES
from tests.installation_helpers import change_document, installation_file, private_file

BACKEND = Path(__file__).resolve().parents[1]
CONFIGURATION_NAMES = (*LEGACY_NAMES, "ASSESS_CONFIG_FILE")
FIELDS = {
    "APP_BASE_URL": "http.origin",
    "DJANGO_ALLOWED_HOSTS": "http.hosts",
    "DJANGO_CSRF_TRUSTED_ORIGINS": "http.csrf_origins",
    "DJANGO_TRUSTED_PROXIES": "http.proxies",
    "LOGIN_TRUSTED_PROXIES": "http.login_proxies",
    "LOGIN_ACCOUNT_LIMIT": "http.account_limit",
    "LOGIN_ORIGIN_LIMIT": "http.origin_limit",
    "LOGIN_LIMIT_SECONDS": "http.limit_seconds",
    "EMAIL_HOST": "smtp.host",
    "EMAIL_PORT": "smtp.port",
    "EMAIL_USE_TLS": "smtp.starttls",
    "EMAIL_USE_SSL": "smtp.ssl",
    "EMAIL_HOST_USER": "smtp.user",
    "DEFAULT_FROM_EMAIL": "smtp.sender",
    "JOURNAL_ACTIVITY_RETENTION_DAYS": "journals.activity",
    "JOURNAL_TECHNICAL_RETENTION_DAYS": "journals.technical",
}
LISTS = {"http.hosts", "http.csrf_origins", "http.proxies", "http.login_proxies"}
INTEGERS = {"smtp.port", "http.account_limit", "http.origin_limit", "http.limit_seconds"}


def fixture_configuration(source, overrides):
    for name, value in overrides.items():
        if name not in FIELDS:
            continue
        field = FIELDS[name]
        if field in LISTS:
            value = value.split(",") if value else []
        elif field in INTEGERS or field.startswith("journals."):
            try:
                value = int(value)
            except ValueError:
                pass
        elif field in {"smtp.starttls", "smtp.ssl"} and value.lower() in {"true", "false"}:
            value = value.lower() == "true"
        change_document(source, field, value)
    for name, field, filename in (
        ("DJANGO_SECRET_KEY", "django_key_file", "django.key"),
        ("EMAIL_HOST_PASSWORD", "smtp_credential_file", "smtp.key"),
    ):
        if name in overrides:
            path = private_file(source, filename)
            path.write_text(overrides[name], encoding="utf-8")
            change_document(source, f"secrets.{field}", str(path))


def production_environment(**overrides):
    environment = {
        name: value for name, value in os.environ.items() if name not in CONFIGURATION_NAMES
    }
    environment["DJANGO_SETTINGS_MODULE"] = "config.settings_production"
    environment.update(overrides)
    if environment["DJANGO_SETTINGS_MODULE"] != "config.settings_development":
        source = installation_file()
        fixture_configuration(source, overrides)
        for name in LEGACY_NAMES:
            environment.pop(name, None)
        environment["ASSESS_CONFIG_FILE"] = str(source)
    return environment


def configure_production(monkeypatch):
    environment = production_environment()
    for name in CONFIGURATION_NAMES:
        monkeypatch.delenv(name, raising=False)
        if name in environment:
            monkeypatch.setenv(name, environment[name])


def startup(environment, code="import django; django.setup()"):
    return subprocess.run(
        [sys.executable, "-c", code],
        cwd=BACKEND,
        env=environment,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
