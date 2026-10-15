import os
from ipaddress import ip_network

from django.core.exceptions import ImproperlyConfigured


def positive_setting(name, default):
    try:
        value = int(os.getenv(name, default))
        if value > 0:
            return value
    except ValueError:
        pass
    raise ImproperlyConfigured(f"{name} doit être un entier strictement positif.")


LOGIN_ACCOUNT_LIMIT = positive_setting("LOGIN_ACCOUNT_LIMIT", "5")
LOGIN_ORIGIN_LIMIT = positive_setting("LOGIN_ORIGIN_LIMIT", "30")
LOGIN_LIMIT_SECONDS = positive_setting("LOGIN_LIMIT_SECONDS", "900")
LOGIN_TRUSTED_PROXIES = [
    value.strip() for value in os.getenv("LOGIN_TRUSTED_PROXIES", "").split(",") if value.strip()
]
try:
    for proxy in LOGIN_TRUSTED_PROXIES:
        ip_network(proxy)
except ValueError:
    raise ImproperlyConfigured(
        "LOGIN_TRUSTED_PROXIES exige des IP ou réseaux CIDR valides."
    ) from None
