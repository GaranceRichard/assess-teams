import pytest

from identities.domain.users import Role
from tests.http_security_helpers import (
    PUBLIC_ORIGIN,
    proxy_request,
)
from tests.identity_helpers import TEST_CREDENTIAL, create_user

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def login(client):
    create_user("https-member", Role.COACH)
    bootstrap = proxy_request(client, "get", "/api/session/")
    assert bootstrap.status_code == 403
    return proxy_request(
        client,
        "post",
        "/api/session/login/",
        {"username": "https-member", "password": TEST_CREDENTIAL},
        HTTP_ORIGIN=PUBLIC_ORIGIN,
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


def test_https_session_retains_cookie_protection_and_rotates_csrf(production_http):
    response = login(production_http)
    assert response.status_code == 200
    for name in ["sessionid", "csrftoken"]:
        cookie = response.cookies[name]
        assert cookie["secure"]
        assert cookie["samesite"] == "Lax"
        assert cookie["domain"] == ""
        assert cookie["path"] == "/"
    assert response.cookies["sessionid"]["httponly"]
    assert not response.cookies["csrftoken"]["httponly"]
    assert "private" in response["Cache-Control"]
    assert "no-store" in response["Cache-Control"]
    token = production_http.cookies["csrftoken"].value
    current = proxy_request(production_http, "get", "/api/session/")
    assert current.status_code == 200
    assert current.cookies["csrftoken"]["secure"]
    updated = proxy_request(
        production_http,
        "patch",
        "/api/session/",
        {"interface_palette": "blue"},
        HTTP_ORIGIN=PUBLIC_ORIGIN,
        HTTP_X_CSRFTOKEN=token,
    )
    assert updated.status_code == 200
    assert updated.json()["interface_palette"] == "blue"
    logout = proxy_request(
        production_http,
        "post",
        "/api/session/logout/",
        HTTP_ORIGIN=PUBLIC_ORIGIN,
        HTTP_X_CSRFTOKEN=token,
    )
    assert logout.status_code == 204
    assert logout.cookies["sessionid"]["secure"]
    assert logout.cookies["sessionid"]["httponly"]
    assert proxy_request(production_http, "get", "/api/session/").status_code == 403


@pytest.mark.parametrize("token", [None, "invalid"])
def test_invalid_csrf_cannot_mutate_authenticated_session(production_http, token):
    assert login(production_http).status_code == 200
    response = proxy_request(
        production_http,
        "patch",
        "/api/session/",
        {"interface_palette": "blue"},
        HTTP_ORIGIN=PUBLIC_ORIGIN,
        **({"HTTP_X_CSRFTOKEN": token} if token else {}),
    )
    assert response.status_code == 403
    assert "no-store" in response["Cache-Control"]
    assert (
        proxy_request(production_http, "get", "/api/session/").json()["interface_palette"]
        == "green"
    )


@pytest.mark.parametrize("origin", ["https://evil.example", "http://assess.example:8443", "null"])
def test_forged_origin_with_valid_token_cannot_mutate_session(production_http, origin):
    assert login(production_http).status_code == 200
    response = proxy_request(
        production_http,
        "patch",
        "/api/session/",
        {"interface_palette": "blue"},
        HTTP_ORIGIN=origin,
        HTTP_X_CSRFTOKEN=production_http.cookies["csrftoken"].value,
    )
    assert response.status_code == 403
    assert (
        proxy_request(production_http, "get", "/api/session/").json()["interface_palette"]
        == "green"
    )


@pytest.mark.parametrize("referer", [None, "https://evil.example/", "http://assess.example:8443/"])
def test_https_missing_or_untrusted_referer_is_rejected_without_origin(production_http, referer):
    assert login(production_http).status_code == 200
    response = proxy_request(
        production_http,
        "post",
        "/api/session/logout/",
        HTTP_X_CSRFTOKEN=production_http.cookies["csrftoken"].value,
        **({"HTTP_REFERER": referer} if referer else {}),
    )
    assert response.status_code == 403
    assert proxy_request(production_http, "get", "/api/session/").status_code == 200


def test_https_valid_referer_is_accepted_without_origin(production_http):
    assert login(production_http).status_code == 200
    response = proxy_request(
        production_http,
        "post",
        "/api/session/logout/",
        HTTP_X_CSRFTOKEN=production_http.cookies["csrftoken"].value,
        HTTP_REFERER=PUBLIC_ORIGIN + "/dashboard",
    )
    assert response.status_code == 204


@pytest.mark.parametrize(
    "path", ["/api/session/login/", "/api/password/recovery/", "/api/password/reset/"]
)
def test_public_sensitive_operations_also_require_csrf(production_http, path):
    response = proxy_request(production_http, "post", path, {}, HTTP_ORIGIN=PUBLIC_ORIGIN)
    assert response.status_code == 403
    assert "sessionid" not in response.cookies


def test_forged_proxy_cannot_mutate_session_with_valid_csrf(production_http):
    assert login(production_http).status_code == 200
    response = proxy_request(
        production_http,
        "patch",
        "/api/session/",
        {"interface_palette": "blue"},
        HTTP_ORIGIN=PUBLIC_ORIGIN,
        HTTP_X_CSRFTOKEN=production_http.cookies["csrftoken"].value,
        REMOTE_ADDR="192.0.2.5",
    )
    assert response.status_code == 400
    assert (
        proxy_request(production_http, "get", "/api/session/").json()["interface_palette"]
        == "green"
    )


def test_login_restriction_behind_tls_proxy_preserves_http_protection(production_http, settings):
    settings.LOGIN_ACCOUNT_LIMIT = 2
    settings.LOGIN_ORIGIN_LIMIT = 10
    proxy_request(production_http, "get", "/api/session/")
    headers = {
        "HTTP_ORIGIN": PUBLIC_ORIGIN,
        "HTTP_X_CSRFTOKEN": production_http.cookies["csrftoken"].value,
    }
    for expected_status in [401, 429]:
        response = proxy_request(
            production_http,
            "post",
            "/api/session/login/",
            {"username": "https-absent", "password": "invalid"},
            **headers,
        )
        assert response.status_code == expected_status
        assert "no-store" in response["Cache-Control"]
        assert "sessionid" not in response.cookies
        assert response["Strict-Transport-Security"] == "max-age=31536000"
    assert int(response["Retry-After"]) > 0
    assert production_http.cookies["csrftoken"]["secure"]
