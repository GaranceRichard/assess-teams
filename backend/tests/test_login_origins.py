import pytest
from django.core.exceptions import ImproperlyConfigured
from rest_framework.test import APIRequestFactory

from config.login_security import positive_setting
from identities.adapters.api.login_security import client_origin
from tests.test_login_limits import attempt

pytestmark = [pytest.mark.functional]


@pytest.mark.parametrize(
    "peer,forwarded,expected",
    [
        ("192.0.2.1", "198.51.100.1", "192.0.2.1"),
        ("10.0.0.1", "198.51.100.1", "198.51.100.1"),
        ("10.0.0.1", "192.0.2.99, 198.51.100.1, 10.0.0.2", "198.51.100.1"),
        ("10.0.0.1", "192.0.2.99, 198.51.100.1", "198.51.100.1"),
        ("10.0.0.1", "spoofed, 198.51.100.1", "10.0.0.1"),
        ("10.0.0.1", "", "10.0.0.1"),
        ("10.0.0.1", "x" * 4097, "10.0.0.1"),
        ("::1", "2001:db8::1", "2001:db8::1"),
        ("", "198.51.100.1", "unknown"),
        ("2001:0db8:0:0::1", "", "2001:db8::1"),
    ],
)
def test_only_explicitly_trusted_proxy_chain_controls_origin(settings, peer, forwarded, expected):
    settings.LOGIN_TRUSTED_PROXIES = ["10.0.0.0/24", "::1/128"]
    request = APIRequestFactory().get("/", REMOTE_ADDR=peer, HTTP_X_FORWARDED_FOR=forwarded)
    assert client_origin(request) == expected


@pytest.mark.django_db
def test_forwarded_headers_cannot_bypass_origin_limit(settings):
    settings.LOGIN_ORIGIN_LIMIT = 2
    assert attempt(username="one", HTTP_X_FORWARDED_FOR="198.51.100.1").status_code == 401
    assert attempt(username="two", HTTP_X_FORWARDED_FOR="198.51.100.2").status_code == 429


@pytest.mark.django_db
def test_clients_behind_trusted_proxy_have_distinct_origin_limits(settings):
    settings.LOGIN_TRUSTED_PROXIES = ["10.0.0.1"]
    settings.LOGIN_ORIGIN_LIMIT = 2
    first = {"origin": "10.0.0.1", "HTTP_X_FORWARDED_FOR": "192.0.2.1"}
    second = {"origin": "10.0.0.1", "HTTP_X_FORWARDED_FOR": "192.0.2.2"}
    assert attempt(username="one", **first).status_code == 401
    assert attempt(username="two", **first).status_code == 429
    assert attempt(username="three", **second).status_code == 401
    assert attempt(username="four", **first).status_code == 429


@pytest.mark.parametrize("value", ["0", "-1", "bad"])
def test_invalid_limits_fail_configuration(monkeypatch, value):
    monkeypatch.setenv("LOGIN_ACCOUNT_LIMIT", value)
    with pytest.raises(ImproperlyConfigured):
        positive_setting("LOGIN_ACCOUNT_LIMIT", "5")
