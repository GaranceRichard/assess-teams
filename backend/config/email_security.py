"""Validate SMTP settings without connecting or including input in diagnostics."""

from email.utils import getaddresses
from ipaddress import ip_address

from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.validators import validate_email
from django.http.request import host_validation_re

from config.secret_security import require_secret


def boolean_setting(environment, name, default):
    value = environment.get(name, str(default)).lower()
    if value not in {"true", "false"}:
        raise ImproperlyConfigured(f"{name}: utiliser true ou false.")
    return value == "true"


def validate_email_settings(configuration):
    host = configuration["EMAIL_HOST"]
    try:
        ip_address(host)
        valid_host = True
    except ValueError:
        valid_host = bool(host_validation_re.fullmatch(host.lower())) and ":" not in host
    if not valid_host:
        raise ImproperlyConfigured("EMAIL_HOST: nom ou adresse du relais SMTP requis.")
    port = configuration["EMAIL_PORT"]
    if type(port) is not int or not 1 <= port <= 65535:
        raise ImproperlyConfigured("EMAIL_PORT: entier entre 1 et 65535 requis.")
    tls, ssl = configuration["EMAIL_USE_TLS"], configuration["EMAIL_USE_SSL"]
    if type(tls) is not bool or type(ssl) is not bool or (tls and ssl):
        raise ImproperlyConfigured("EMAIL_USE_TLS/EMAIL_USE_SSL: modes booléens exclusifs.")
    user, credential = configuration["EMAIL_HOST_USER"], configuration["EMAIL_HOST_PASSWORD"]
    if bool(user) != bool(credential) or (user and not user.strip()):
        raise ImproperlyConfigured(
            "EMAIL_HOST_USER/EMAIL_HOST_PASSWORD: fournir les deux ou aucun."
        )
    if credential:
        require_secret(credential, "EMAIL_HOST_PASSWORD", minimum=16)
        if not (tls or ssl):
            raise ImproperlyConfigured(
                "EMAIL_USE_TLS/EMAIL_USE_SSL: TLS requis avec authentification."
            )
    if not (tls or ssl) and host.lower() not in {"localhost", "127.0.0.1", "::1"}:
        raise ImproperlyConfigured(
            "EMAIL_USE_TLS/EMAIL_USE_SSL: TLS requis pour un relais distant."
        )
    sender = configuration["DEFAULT_FROM_EMAIL"]
    try:
        addresses = getaddresses([sender])
        if "\r" in sender or "\n" in sender or len(addresses) != 1:
            raise ValidationError("Invalid sender.")
        address = addresses[0][1]
        validate_email(address)
    except (ValidationError, ValueError):
        raise ImproperlyConfigured(
            "DEFAULT_FROM_EMAIL: adresse d'expéditeur valide requise."
        ) from None
    if address.lower().endswith(".local"):
        raise ImproperlyConfigured("DEFAULT_FROM_EMAIL: remplacer l'expéditeur de développement.")


def production_email_settings(environment):
    ssl = boolean_setting(environment, "EMAIL_USE_SSL", False)
    try:
        port = int(environment.get("EMAIL_PORT", "587"))
    except ValueError:
        raise ImproperlyConfigured("EMAIL_PORT: entier entre 1 et 65535 requis.") from None
    result = {
        "EMAIL_HOST": environment.get("EMAIL_HOST", "localhost"),
        "EMAIL_PORT": port,
        "EMAIL_USE_SSL": ssl,
        "EMAIL_USE_TLS": boolean_setting(environment, "EMAIL_USE_TLS", not ssl),
        "EMAIL_HOST_USER": environment.get("EMAIL_HOST_USER", ""),
        "EMAIL_HOST_PASSWORD": environment.get("EMAIL_HOST_PASSWORD", ""),
        "DEFAULT_FROM_EMAIL": environment.get("DEFAULT_FROM_EMAIL", ""),
    }
    validate_email_settings(result)
    return result
