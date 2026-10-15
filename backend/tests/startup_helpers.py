import os
import secrets
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
CONFIGURATION_NAMES = (
    "APP_BASE_URL",
    "DJANGO_SECRET_KEY",
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
)


def production_environment(**overrides):
    environment = {
        name: value for name, value in os.environ.items() if name not in CONFIGURATION_NAMES
    }
    environment.update(
        DJANGO_SETTINGS_MODULE="config.settings_production",
        DJANGO_SECRET_KEY=secrets.token_urlsafe(64),
        APP_BASE_URL="https://assess.example",
        DEFAULT_FROM_EMAIL="noreply@assess.example",
    )
    environment.update(overrides)
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
