import pytest
from django.core.checks import run_checks
from django.test import Client

from journals.models import LogEntry
from tests.http_security_helpers import proxy_request

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("peer", ["10.20.0.5", "2001:db8::25"])
def test_tls_termination_by_trusted_proxy_does_not_redirect(production_http, peer):
    response = proxy_request(production_http, "get", "/api/health/", REMOTE_ADDR=peer)
    assert response.status_code == 200
    assert response.wsgi_request.is_secure()
    assert response["Strict-Transport-Security"] == "max-age=31536000"
    assert response["X-Content-Type-Options"] == "nosniff"
    assert response["Referrer-Policy"] == "same-origin"
    assert "no-store" in response["Cache-Control"]


def test_direct_https_remains_supported(production_http):
    response = production_http.get("/api/health/", secure=True, HTTP_HOST="assess.example:8443")
    assert response.status_code == 200
    assert response.wsgi_request.is_secure()


@pytest.mark.parametrize("protocol", [None, "http"])
def test_safe_http_redirect_is_fixed_to_public_host(production_http, protocol):
    headers = {"HTTP_X_FORWARDED_PROTO": protocol} if protocol else {}
    response = production_http.get(
        "/api/health/?next=//evil.example",
        HTTP_HOST="assess.example:1234",
        REMOTE_ADDR="10.20.0.5" if protocol else "192.0.2.5",
        **headers,
    )
    assert response.status_code == 301
    assert response["Location"] == "https://assess.example:8443/api/health/?next=//evil.example"
    assert not response.cookies


@pytest.mark.parametrize("peer", ["192.0.2.5", "", "not-an-ip"])
def test_forged_proxy_header_is_rejected_even_with_spoofed_forwarded_for(production_http, peer):
    response = proxy_request(
        production_http,
        "get",
        "/api/health/",
        REMOTE_ADDR=peer,
        HTTP_X_FORWARDED_FOR="10.20.0.5",
    )
    assert response.status_code == 400
    assert not response.cookies


@pytest.mark.parametrize("protocol", ["https,http", "http,https", "HTTPS", "", "ftp", " https"])
def test_ambiguous_or_invalid_scheme_from_trusted_proxy_is_rejected(production_http, protocol):
    response = proxy_request(
        production_http,
        "get",
        "/api/health/",
        HTTP_X_FORWARDED_PROTO=protocol,
    )
    assert response.status_code == 400


def test_missing_scheme_from_tls_terminating_proxy_is_rejected(production_http):
    response = production_http.get(
        "/api/health/",
        HTTP_HOST="assess.example",
        REMOTE_ADDR="10.20.0.5",
    )
    assert response.status_code == 400


@pytest.mark.parametrize("method", ["post", "put", "patch", "delete"])
def test_plaintext_mutations_are_rejected_without_redirect_or_cookies(production_http, method):
    response = proxy_request(
        production_http,
        method,
        "/api/session/login/",
        {},
        HTTP_X_FORWARDED_PROTO="http",
    )
    assert response.status_code == 400
    assert "Location" not in response
    assert not response.cookies


def test_host_and_port_forwarding_cannot_change_origin(production_http):
    response = proxy_request(
        production_http,
        "get",
        "/api/health/",
        HTTP_X_FORWARDED_HOST="evil.example",
        HTTP_X_FORWARDED_PORT="80",
        HTTP_FORWARDED="proto=http;host=evil.example",
    )
    assert response.status_code == 200
    assert response.wsgi_request.get_host() == "assess.example:8443"
    assert response.wsgi_request.get_port() == "80"
    assert response.wsgi_request.is_secure()


def test_unapproved_host_is_rejected_before_health_or_redirect(production_http):
    response = proxy_request(production_http, "get", "/api/health/", HTTP_HOST="evil.example")
    assert response.status_code == 400
    assert "Location" not in response


def test_development_http_and_csrf_cookie_remain_usable():
    response = Client(enforce_csrf_checks=True).get("/api/session/")
    assert response.status_code == 403
    assert not response.cookies["csrftoken"]["secure"]
    assert "Location" not in response


def test_deployment_checks_only_report_deliberate_subdomain_and_preload_choices(
    production_http, settings
):
    settings.SECRET_KEY = "test-only-production-key-" * 3
    issues = run_checks(include_deployment_checks=True)
    assert {issue.id for issue in issues} == {"security.W005", "security.W021"}


def test_https_docs_and_schema_use_public_origin(production_http):
    docs = proxy_request(production_http, "get", "/api/docs/")
    schema = proxy_request(
        production_http,
        "get",
        "/api/schema/",
        HTTP_ACCEPT="application/vnd.oai.openapi+json",
    )
    assert docs.status_code == 200
    assert schema.status_code == 200
    assert schema.json()["servers"] == [{"url": "https://assess.example:8443"}]
    assert "/api/session/login/" in schema.json()["paths"]


def test_direct_https_from_trusted_peer_does_not_require_forwarded_header(production_http):
    response = production_http.get(
        "/api/health/",
        secure=True,
        HTTP_HOST="assess.example:8443",
        REMOTE_ADDR="10.20.0.5",
    )
    assert response.status_code == 200


def test_proxy_refusals_preserve_existing_http_journal(production_http):
    response = proxy_request(
        production_http,
        "post",
        "/api/session/login/",
        {},
        REMOTE_ADDR="192.0.2.5",
    )
    assert response.status_code == 400
    entry = LogEntry.objects.get(correlation_id=response["X-Correlation-ID"])
    assert entry.status_code == 400
    assert entry.method == "POST"


def test_no_proxy_is_trusted_by_default(production_http, settings):
    settings.TRUSTED_PROXIES = []
    response = proxy_request(production_http, "get", "/api/health/")
    assert response.status_code == 400
