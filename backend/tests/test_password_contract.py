import pytest
from django.core.exceptions import ImproperlyConfigured
from django.urls import reverse
from drf_spectacular.generators import SchemaGenerator
from drf_spectacular.validation import validate_schema
from rest_framework.test import APIClient

from identities.application.passwords import public_password_url
from identities.models import User

pytestmark = [pytest.mark.api, pytest.mark.contract]


def test_password_openapi_matches_authentication_and_write_only_contract():
    schema = SchemaGenerator().get_schema(request=None, public=True)
    validate_schema(schema)
    for path, public, code in [
        ("/api/password/recovery/", True, "202"),
        ("/api/password/reset/", True, "204"),
        ("/api/session/password/", False, "204"),
    ]:
        operation = schema["paths"][path]["post"]
        assert set(operation["responses"]) == {code, "400", "403", "429"}
        assert (
            "security" not in operation if public else {"cookieAuth": []} in operation["security"]
        )
        assert any(p["name"] == "X-CSRFToken" and p["required"] for p in operation["parameters"])
        reference = operation["requestBody"]["content"]["application/json"]["schema"]["$ref"]
        request = schema["components"]["schemas"][reference.rsplit("/", 1)[1]]
        assert request["additionalProperties"] is False
        assert set(request["required"]) == set(request["properties"])
        assert all(prop["writeOnly"] for prop in request["properties"].values())
    assert APIClient().get(reverse("swagger-ui")).status_code == 200


@pytest.mark.parametrize(
    "base",
    [
        "",
        "http://public.example.com",
        "https://u:p@public.example.com",
        "https://public.example.com?q=secret",
        "https://public.example.com#fragment",
        "//public.example.com",
    ],
)
def test_production_reset_links_reject_unsafe_public_configuration(settings, base):
    settings.ENVIRONMENT = "production"
    settings.FRONTEND_URL = base
    with pytest.raises(ImproperlyConfigured, match="URL publique"):
        public_password_url(User(pk=1, username="test", role="Viewer"))


def test_public_link_uses_configuration_without_query_or_request_host(settings):
    settings.ENVIRONMENT = "production"
    settings.FRONTEND_URL = "https://public.example.com/"
    url = public_password_url(User(pk=1, username="test", role="Viewer"))
    assert url.startswith("https://public.example.com/password/reset#")
    assert "?" not in url
