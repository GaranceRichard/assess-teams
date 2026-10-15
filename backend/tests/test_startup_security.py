import pytest
from django.core.exceptions import ImproperlyConfigured

from config.startup_security import validate_proxy_consistency
from tests.startup_helpers import production_environment, startup

pytestmark = pytest.mark.functional


@pytest.mark.parametrize(
    "http,login",
    [([], []), (["10.0.0.1"], ["10.0.0.0/24"]), (["::1"], ["::1/128", "2001:db8::/64"])],
)
def test_direct_tls_and_explicit_proxy_chains_are_supported(http, login):
    validate_proxy_consistency(http, login)


@pytest.mark.parametrize(
    "http,login",
    [
        (["10.0.0.1"], []),
        ([], ["10.0.0.1"]),
        (["10.0.0.0/24"], ["10.0.0.1"]),
        (["::1"], ["10.0.0.1"]),
        (["10.0.0.1"], ["0.0.0.0/0"]),
        (["::1"], ["::/0"]),
        (["::1"], ["invalid"]),
    ],
)
def test_incoherent_or_universal_proxy_trust_is_refused(http, login):
    with pytest.raises(ImproperlyConfigured, match="TRUSTED_PROXIES"):
        validate_proxy_consistency(http, login)


@pytest.mark.parametrize(
    "mutation,diagnostic",
    [
        ("DEBUG=True", "DEBUG"),
        ("SECRET_KEY='embedded'", "SECRET_KEY"),
        ("SECRET_KEY_FALLBACKS=['embedded']", "SECRET_KEY"),
        ("ALLOWED_HOSTS=['*']", "DJANGO_ALLOWED_HOSTS"),
        ("CSRF_TRUSTED_ORIGINS=['http://assess.example']", "HTTPS origin"),
        ("FRONTEND_URL='http://assess.example'", "HTTPS origin"),
        ("SESSION_COOKIE_SECURE=False", "SESSION_COOKIE_SECURE"),
        ("CSRF_COOKIE_SECURE=False", "CSRF_COOKIE_SECURE"),
        ("SECURE_SSL_REDIRECT=False", "SECURE_SSL_REDIRECT"),
        ("SECURE_HSTS_SECONDS=0", "SECURE_HSTS_SECONDS"),
        ("USE_X_FORWARDED_HOST=True", "USE_X_FORWARDED_HOST"),
        ("SECURE_PROXY_SSL_HEADER=None", "SECURE_PROXY_SSL_HEADER"),
        ("MIDDLEWARE=[]", "MIDDLEWARE"),
        ("MIDDLEWARE=[m for m in settings.MIDDLEWARE if 'csrf' not in m]", "MIDDLEWARE"),
        ("MIDDLEWARE=list(reversed(settings.MIDDLEWARE))", "MIDDLEWARE"),
        ("EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend'", "EMAIL_BACKEND"),
        ("INSTALLED_APPS=[*settings.INSTALLED_APPS, 'development_data']", "INSTALLED_APPS"),
    ],
)
def test_effective_production_overrides_are_refused_before_serving(mutation, diagnostic):
    result = startup(
        production_environment(),
        "from django.conf import settings; settings."
        + mutation
        + "; import django; django.setup()",
    )
    assert result.returncode != 0
    assert diagnostic in result.stderr


@pytest.mark.parametrize(
    "configuration,diagnostic",
    [
        ({"DJANGO_TRUSTED_PROXIES": "10.0.0.1"}, "LOGIN_TRUSTED_PROXIES"),
        ({"LOGIN_TRUSTED_PROXIES": "::/0"}, "LOGIN_TRUSTED_PROXIES"),
        ({"LOGIN_TRUSTED_PROXIES": "10.0.0.1,"}, "LOGIN_TRUSTED_PROXIES"),
        ({"DJANGO_CSRF_TRUSTED_ORIGINS": "https://other.example"}, "CSRF"),
    ],
)
def test_real_process_refuses_bad_origins_or_proxy_environment(configuration, diagnostic):
    result = startup(production_environment(**configuration))
    assert result.returncode != 0
    assert diagnostic in result.stderr


def test_real_process_accepts_trusted_proxy_and_upstream_chain():
    result = startup(
        production_environment(
            DJANGO_TRUSTED_PROXIES="10.0.0.1,::1",
            LOGIN_TRUSTED_PROXIES="10.0.0.0/24,::1/128,2001:db8::/64",
        )
    )
    assert result.returncode == 0, "Valid proxy configuration refused (output withheld)."


def test_smtp_secret_override_is_refused_without_value_in_traceback():
    import secrets

    environment = production_environment(UNPROVISIONED=secrets.token_urlsafe(32))
    result = startup(
        environment,
        "from django.conf import settings; import os; settings.EMAIL_HOST_USER='service'; "
        "settings.EMAIL_HOST_PASSWORD=os.environ['UNPROVISIONED']; import django; django.setup()",
    )
    assert result.returncode != 0
    assert "EMAIL_HOST_PASSWORD: fournir le secret externe" in result.stderr
    assert environment["UNPROVISIONED"] not in result.stdout + result.stderr
