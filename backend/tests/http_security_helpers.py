import pytest
from django.conf import settings
from django.test import override_settings
from drf_spectacular.settings import patched_settings
from rest_framework.test import APIClient

from config.http_security import production_http_settings

PUBLIC_ORIGIN = "https://assess.example:8443"
PROXY_IP = "10.20.0.5"


@pytest.fixture
def production_http():
    configuration = production_http_settings(
        {
            "APP_BASE_URL": PUBLIC_ORIGIN,
            "DJANGO_TRUSTED_PROXIES": f"{PROXY_IP},2001:db8::/64",
        }
    )
    with (
        override_settings(
            **configuration,
            DEBUG=False,
            SPECTACULAR_SETTINGS={
                **settings.SPECTACULAR_SETTINGS,
                "SERVERS": [{"url": PUBLIC_ORIGIN}],
            },
            ENVIRONMENT="production",
            MIDDLEWARE=[
                settings.MIDDLEWARE[0],
                "config.http_middleware.HttpSecurityMiddleware",
                *settings.MIDDLEWARE[1:],
            ],
        ),
        patched_settings({"SERVERS": [{"url": PUBLIC_ORIGIN}]}),
    ):
        yield APIClient(enforce_csrf_checks=True)


def proxy_request(client, method, path, data=None, **headers):
    return getattr(client, method)(
        path,
        **({"data": data, "format": "json"} if data is not None else {}),
        **{
            "HTTP_HOST": "assess.example:8443",
            "REMOTE_ADDR": PROXY_IP,
            "HTTP_X_FORWARDED_PROTO": "https",
            **headers,
        },
    )
