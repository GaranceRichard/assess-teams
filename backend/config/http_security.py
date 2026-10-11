"""Validate the public HTTP boundary before production starts."""

from ipaddress import ip_network
from urllib.parse import urlsplit

from django.core.exceptions import ImproperlyConfigured
from django.http.request import host_validation_re


def https_origin(value):
    try:
        parts = urlsplit(value)
        valid = (
            parts.scheme == "https"
            and parts.netloc
            and host_validation_re.fullmatch(parts.netloc.lower())
            and parts.path in {"", "/"}
            and not parts.query
            and not parts.fragment
            and not any(character.isspace() for character in value)
            and (parts.port is None or 0 < parts.port <= 65535)
        )
    except ValueError:
        valid = False
    if not valid:
        raise ImproperlyConfigured(
            "An exact HTTPS origin is required (without path or credentials)."
        )
    return f"https://{parts.netloc.lower()}"


def configured_list(environment, name, default=""):
    value = environment.get(name, default)
    values = [item.strip() for item in value.split(",")]
    if value and any(not item for item in values):
        raise ImproperlyConfigured(f"{name} contains an empty entry.")
    return values if value else []


def trusted_proxy_networks(values):
    networks = []
    for value in values:
        try:
            network = ip_network(value, strict=True)
        except ValueError:
            raise ImproperlyConfigured(
                "DJANGO_TRUSTED_PROXIES exige des IP ou CIDR valides."
            ) from None
        if network.prefixlen == 0:
            raise ImproperlyConfigured("Universal proxy networks are forbidden.")
        networks.append(network)
    return networks


def production_http_settings(environment):
    origin = https_origin(environment.get("APP_BASE_URL", ""))
    public_host = urlsplit(origin).netloc
    hostname = urlsplit(origin).hostname
    if ":" in hostname:
        hostname = f"[{hostname}]"
    hosts = configured_list(environment, "DJANGO_ALLOWED_HOSTS", hostname)
    if not hosts or any(
        not host_validation_re.fullmatch(host.lower())
        or host_validation_re.fullmatch(host.lower()).group(2) is not None
        or host.startswith(".")
        for host in hosts
    ):
        raise ImproperlyConfigured(
            "DJANGO_ALLOWED_HOSTS requires exact hosts without ports or wildcards."
        )
    if hostname not in [host.lower() for host in hosts]:
        raise ImproperlyConfigured("The APP_BASE_URL host must be allowed.")
    origins = [
        https_origin(value)
        for value in configured_list(environment, "DJANGO_CSRF_TRUSTED_ORIGINS", origin)
    ]
    if origin not in origins:
        raise ImproperlyConfigured("The APP_BASE_URL origin must be trusted for CSRF.")
    proxies = configured_list(environment, "DJANGO_TRUSTED_PROXIES")
    trusted_proxy_networks(proxies)
    return {
        "FRONTEND_URL": origin,
        "ALLOWED_HOSTS": hosts,
        "CSRF_TRUSTED_ORIGINS": origins,
        "TRUSTED_PROXIES": proxies,
        "SECURE_PROXY_SSL_HEADER": ("HTTP_X_FORWARDED_PROTO", "https"),
        "USE_X_FORWARDED_HOST": False,
        "USE_X_FORWARDED_PORT": False,
        "SECURE_SSL_REDIRECT": True,
        "SECURE_SSL_HOST": public_host,
        "SECURE_HSTS_SECONDS": 31536000,
        "SECURE_HSTS_INCLUDE_SUBDOMAINS": False,
        "SECURE_HSTS_PRELOAD": False,
        "SECURE_CONTENT_TYPE_NOSNIFF": True,
        "SECURE_REFERRER_POLICY": "same-origin",
        "SESSION_COOKIE_SECURE": True,
        "SESSION_COOKIE_HTTPONLY": True,
        "SESSION_COOKIE_SAMESITE": "Lax",
        "SESSION_COOKIE_DOMAIN": None,
        "CSRF_COOKIE_SECURE": True,
        "CSRF_COOKIE_HTTPONLY": False,
        "CSRF_COOKIE_SAMESITE": "Lax",
        "CSRF_COOKIE_DOMAIN": None,
    }
