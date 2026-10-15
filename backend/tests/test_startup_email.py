import secrets

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.email_security import production_email_settings
from development_data.management.commands.seed_development_users import DEVELOPMENT_CREDENTIAL
from tests.startup_helpers import production_environment, startup

pytestmark = pytest.mark.functional


def test_known_local_development_credential_is_never_a_production_smtp_secret():
    with pytest.raises(ImproperlyConfigured, match="EMAIL_HOST_PASSWORD"):
        production_email_settings(
            {
                "DEFAULT_FROM_EMAIL": "noreply@assess.example",
                "EMAIL_HOST_USER": "service",
                "EMAIL_HOST_PASSWORD": DEVELOPMENT_CREDENTIAL,
            }
        )


@pytest.mark.parametrize("transport", ["starttls", "ssl", "local"])
def test_smtp_accepts_secure_remote_or_unauthenticated_loopback(transport):
    environment = {"DEFAULT_FROM_EMAIL": "Assess Teams <noreply@assess.example>"}
    if transport == "local":
        environment.update(EMAIL_USE_TLS="false")
    else:
        environment.update(
            EMAIL_HOST="smtp.example",
            EMAIL_HOST_USER="service",
            EMAIL_HOST_PASSWORD=secrets.token_urlsafe(32),
            EMAIL_USE_SSL=str(transport == "ssl").lower(),
        )
    result = production_email_settings(environment)
    assert result["EMAIL_USE_SSL"] is (transport == "ssl")
    assert result["EMAIL_USE_TLS"] is (transport == "starttls")


@pytest.mark.parametrize(
    "overrides,diagnostic",
    [
        ({"EMAIL_PORT": "no-port"}, "EMAIL_PORT"),
        ({"EMAIL_PORT": "0"}, "EMAIL_PORT"),
        ({"EMAIL_PORT": "65536"}, "EMAIL_PORT"),
        ({"EMAIL_HOST": ""}, "EMAIL_HOST"),
        ({"EMAIL_HOST": "user@relay"}, "EMAIL_HOST"),
        ({"EMAIL_HOST": "smtp.example:587"}, "EMAIL_HOST"),
        ({"EMAIL_USE_SSL": "yes"}, "EMAIL_USE_SSL"),
        ({"EMAIL_USE_TLS": "yes"}, "EMAIL_USE_TLS"),
        ({"EMAIL_USE_TLS": "true", "EMAIL_USE_SSL": "true"}, "modes"),
        ({"EMAIL_HOST_USER": "service"}, "fournir les deux"),
        ({"EMAIL_HOST_PASSWORD": "weak"}, "fournir les deux"),
        ({"EMAIL_HOST_USER": "service", "EMAIL_HOST_PASSWORD": "weak"}, "EMAIL_HOST_PASSWORD"),
        ({"DEFAULT_FROM_EMAIL": "invalid"}, "DEFAULT_FROM_EMAIL"),
        ({"DEFAULT_FROM_EMAIL": "noreply@assess-teams.local"}, "développement"),
        ({"DEFAULT_FROM_EMAIL": "Local <noreply@assess-teams.local>"}, "développement"),
        ({"DEFAULT_FROM_EMAIL": "a@assess.example,b@assess.example"}, "DEFAULT_FROM_EMAIL"),
        ({"DEFAULT_FROM_EMAIL": "a@assess.example\r\nBcc: b@assess.example"}, "DEFAULT_FROM_EMAIL"),
        ({"EMAIL_HOST": "smtp.example", "EMAIL_USE_TLS": "false"}, "TLS requis"),
    ],
)
def test_smtp_invalid_combinations_refuse_startup(overrides, diagnostic):
    with pytest.raises(ImproperlyConfigured, match=diagnostic):
        production_email_settings({"DEFAULT_FROM_EMAIL": "noreply@assess.example", **overrides})


def test_credentials_require_tls_even_on_loopback_and_whitespace_user_is_rejected():
    environment = {
        "DEFAULT_FROM_EMAIL": "noreply@assess.example",
        "EMAIL_HOST_USER": "service",
        "EMAIL_HOST_PASSWORD": secrets.token_urlsafe(32),
        "EMAIL_USE_TLS": "false",
    }
    with pytest.raises(ImproperlyConfigured, match="TLS requis avec authentification"):
        production_email_settings(environment)
    with pytest.raises(ImproperlyConfigured, match="fournir les deux"):
        production_email_settings({**environment, "EMAIL_HOST_USER": " "})


@pytest.mark.parametrize("name", ["EMAIL_PORT", "DEFAULT_FROM_EMAIL", "LOGIN_TRUSTED_PROXIES"])
def test_parse_errors_never_echo_values_or_exception_chains(name):
    marker = secrets.token_urlsafe(40)
    environment = production_environment(**{name: marker})
    result = startup(environment)
    assert result.returncode != 0
    assert name in result.stderr
    assert marker not in result.stdout + result.stderr
    assert "During handling" not in result.stderr
