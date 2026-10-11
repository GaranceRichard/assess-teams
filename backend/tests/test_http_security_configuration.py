import runpy
from pathlib import Path

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.http_security import production_http_settings

pytestmark = pytest.mark.functional


def configuration(**environment):
    return production_http_settings({"APP_BASE_URL": "https://assess.example", **environment})


def test_production_uses_public_origin_and_requires_explicit_proxy_trust():
    result = configuration()
    assert result["FRONTEND_URL"] == "https://assess.example"
    assert result["ALLOWED_HOSTS"] == ["assess.example"]
    assert result["CSRF_TRUSTED_ORIGINS"] == ["https://assess.example"]
    assert result["TRUSTED_PROXIES"] == []
    assert result["SECURE_SSL_REDIRECT"] is True
    assert result["SECURE_HSTS_INCLUDE_SUBDOMAINS"] is False
    assert result["SECURE_HSTS_PRELOAD"] is False


def test_exact_hosts_origins_ipv6_and_proxy_networks_are_supported():
    result = configuration(
        APP_BASE_URL="https://[2001:db8::1]:8443/",
        DJANGO_ALLOWED_HOSTS=" [2001:db8::1] , assess.example ",
        DJANGO_CSRF_TRUSTED_ORIGINS="https://[2001:db8::1]:8443, https://ui.example",
        DJANGO_TRUSTED_PROXIES="10.20.0.5, 2001:db8::/64",
    )
    assert result["SECURE_SSL_HOST"] == "[2001:db8::1]:8443"
    assert result["CSRF_TRUSTED_ORIGINS"][-1] == "https://ui.example"
    assert result["TRUSTED_PROXIES"] == ["10.20.0.5", "2001:db8::/64"]


@pytest.mark.parametrize(
    "url",
    [
        "",
        "http://assess.example",
        "https://u:p@assess.example",
        "https://assess.example/path",
        "https://assess.example?q=secret",
        "https://assess.example#token",
        "https://*.example",
        "https://assess.example:99999",
        "https://[invalid",
        "https://assess.example /",
    ],
)
def test_invalid_public_origin_prevents_startup(url):
    with pytest.raises(ImproperlyConfigured):
        configuration(APP_BASE_URL=url)


@pytest.mark.parametrize(
    ("name", "value"),
    [
        ("DJANGO_ALLOWED_HOSTS", "*"),
        ("DJANGO_ALLOWED_HOSTS", ".example"),
        ("DJANGO_ALLOWED_HOSTS", "other.example"),
        ("DJANGO_ALLOWED_HOSTS", ""),
        ("DJANGO_ALLOWED_HOSTS", "assess.example:8443"),
        ("DJANGO_ALLOWED_HOSTS", "assess.example,"),
        ("DJANGO_CSRF_TRUSTED_ORIGINS", "http://assess.example"),
        ("DJANGO_CSRF_TRUSTED_ORIGINS", "https://*.example"),
        ("DJANGO_CSRF_TRUSTED_ORIGINS", "https://other.example"),
        ("DJANGO_CSRF_TRUSTED_ORIGINS", ""),
        ("DJANGO_TRUSTED_PROXIES", "proxy.example"),
        ("DJANGO_TRUSTED_PROXIES", "0.0.0.0/0"),
        ("DJANGO_TRUSTED_PROXIES", "::/0"),
        ("DJANGO_TRUSTED_PROXIES", "10.20.0.5/24"),
    ],
)
def test_unsafe_configuration_prevents_startup(name, value):
    with pytest.raises(ImproperlyConfigured):
        configuration(**{name: value})


def test_production_module_installs_http_boundary(monkeypatch):
    for name in ["DJANGO_ALLOWED_HOSTS", "DJANGO_CSRF_TRUSTED_ORIGINS", "DJANGO_TRUSTED_PROXIES"]:
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("APP_BASE_URL", "https://assess.example")
    monkeypatch.setenv("DJANGO_SECRET_KEY", "production-test-key")
    module = runpy.run_path(
        str(Path(__file__).resolve().parents[1] / "config/settings_production.py")
    )
    assert module["MIDDLEWARE"][1] == "config.http_middleware.HttpSecurityMiddleware"
    assert module["SESSION_COOKIE_SECURE"] is True
    assert module["CSRF_COOKIE_SECURE"] is True
    assert module["SPECTACULAR_SETTINGS"]["SERVERS"] == [{"url": "https://assess.example"}]
