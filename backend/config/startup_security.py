"""Fail closed on effective production settings, before serving or starting workers."""

import os

from django.core.exceptions import ImproperlyConfigured

from config.email_security import validate_email_settings
from config.http_security import configured_list, production_http_settings, trusted_proxy_networks
from config.secret_security import require_secret

EMAIL_NAMES = (
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USE_SSL",
    "EMAIL_USE_TLS",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "DEFAULT_FROM_EMAIL",
)


def validate_proxy_consistency(http_proxies, login_proxies):
    http = trusted_proxy_networks(http_proxies)
    try:
        login = trusted_proxy_networks(login_proxies)
    except ImproperlyConfigured:
        raise ImproperlyConfigured(
            "LOGIN_TRUSTED_PROXIES: IP/CIDR explicites, sans réseau /0."
        ) from None
    if (login and not http) or any(
        not any(peer.version == network.version and peer.subnet_of(network) for network in login)
        for peer in http
    ):
        raise ImproperlyConfigured(
            "DJANGO_TRUSTED_PROXIES/LOGIN_TRUSTED_PROXIES: chaque pair HTTP doit être "
            "couvert pour la connexion ; sans proxy HTTP, aucune confiance forwarded."
        )


def validate_production_settings(settings, environment=None):
    environment = os.environ if environment is None else environment
    mode = getattr(settings, "ENVIRONMENT", None)
    if mode in {"development", "test"}:
        return
    if mode != "production":
        raise ImproperlyConfigured("ENVIRONMENT: production, development ou test explicite requis.")
    if settings.DEBUG is not False:
        raise ImproperlyConfigured("DEBUG: doit être désactivé en production.")
    key = require_secret(environment.get("DJANGO_SECRET_KEY"), "DJANGO_SECRET_KEY")
    if settings.SECRET_KEY != key or settings.SECRET_KEY_FALLBACKS:
        raise ImproperlyConfigured(
            "SECRET_KEY: utiliser DJANGO_SECRET_KEY externe, sans fallback embarqué."
        )
    validate_http_settings(settings)
    configured_list(environment, "LOGIN_TRUSTED_PROXIES")
    validate_proxy_consistency(settings.TRUSTED_PROXIES, settings.LOGIN_TRUSTED_PROXIES)
    validate_email_settings({name: getattr(settings, name) for name in EMAIL_NAMES})
    if settings.EMAIL_HOST_PASSWORD != environment.get("EMAIL_HOST_PASSWORD", ""):
        raise ImproperlyConfigured("EMAIL_HOST_PASSWORD: fournir le secret externe au processus.")
    if settings.EMAIL_BACKEND != "django.core.mail.backends.smtp.EmailBackend":
        raise ImproperlyConfigured("EMAIL_BACKEND: backend SMTP requis en production.")
    if "development_data" in settings.INSTALLED_APPS:
        raise ImproperlyConfigured("INSTALLED_APPS: exclure development_data de la production.")


def validate_http_settings(settings):
    expected_http = production_http_settings(
        {
            "APP_BASE_URL": settings.FRONTEND_URL,
            "DJANGO_ALLOWED_HOSTS": ",".join(settings.ALLOWED_HOSTS),
            "DJANGO_CSRF_TRUSTED_ORIGINS": ",".join(settings.CSRF_TRUSTED_ORIGINS),
            "DJANGO_TRUSTED_PROXIES": ",".join(settings.TRUSTED_PROXIES),
        }
    )
    for name, expected in expected_http.items():
        if getattr(settings, name) != expected:
            raise ImproperlyConfigured(
                f"{name}: conserver la protection HTTP de production MEP-002."
            )
    middleware = settings.MIDDLEWARE
    boundary = "config.http_middleware.HttpSecurityMiddleware"
    if boundary not in middleware or any(
        name not in middleware or middleware.index(boundary) > middleware.index(name)
        for name in (
            "django.middleware.security.SecurityMiddleware",
            "django.middleware.csrf.CsrfViewMiddleware",
            "django.contrib.sessions.middleware.SessionMiddleware",
        )
    ):
        raise ImproperlyConfigured(
            "MIDDLEWARE: frontière HTTP requise avant HTTPS, session et CSRF."
        )
