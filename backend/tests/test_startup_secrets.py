import json
import secrets
from pathlib import Path
from types import SimpleNamespace

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.secret_security import require_secret
from config.startup_security import validate_production_settings
from tests.startup_helpers import production_environment, startup

pytestmark = pytest.mark.functional


@pytest.mark.parametrize("mode", ["development", "test"])
def test_explicit_local_modes_do_not_require_production_secrets(mode):
    validate_production_settings(SimpleNamespace(ENVIRONMENT=mode), {})


@pytest.mark.parametrize("mode", [None, "prod", ""])
def test_unknown_mode_is_not_a_production_bypass(mode):
    with pytest.raises(ImproperlyConfigured, match="ENVIRONMENT"):
        validate_production_settings(SimpleNamespace(ENVIRONMENT=mode), {})


@pytest.mark.parametrize(
    "value",
    [
        None,
        "",
        "short",
        "x" * 64,
        "abcdefgh" * 8,
        "a" * 55 + "bcdefghi",
        "django-insecure-" + secrets.token_urlsafe(40),
        "local-development-key-not-for-production",
        " " + secrets.token_urlsafe(64),
    ],
    ids=[
        "missing",
        "empty",
        "short",
        "uniform",
        "repeated",
        "dominated",
        "django-dev",
        "local",
        "spaces",
    ],
)
def test_invalid_secret_is_refused_without_value(value):
    with pytest.raises(ImproperlyConfigured, match="DJANGO_SECRET_KEY") as error:
        require_secret(value, "DJANGO_SECRET_KEY")
    if value:
        assert value not in str(error.value)


def test_random_external_key_is_accepted():
    value = secrets.token_urlsafe(64)
    assert require_secret(value, "DJANGO_SECRET_KEY") == value


@pytest.mark.parametrize("missing", [True, False], ids=["absent", "weak"])
def test_real_process_refuses_missing_or_weak_key_without_leaking(missing):
    environment = production_environment()
    source = Path(environment["ASSESS_CONFIG_FILE"])
    document = json.loads(source.read_text("utf-8"))
    secret_file = source.parent / document["secrets"]["django_key_file"]
    if missing:
        secret_file.unlink()
    else:
        secret_file.write_text("development-" + secrets.token_urlsafe(40), encoding="utf-8")
    result = startup(environment)
    assert result.returncode != 0
    assert "DJANGO_SECRET_KEY" in result.stderr
    if not missing:
        assert secret_file.read_text("utf-8") not in result.stdout + result.stderr


@pytest.mark.parametrize("entry", ["django.setup", "wsgi", "asgi", "alias", "worker"])
@pytest.mark.parametrize("valid", [True, False], ids=["valid", "refused"])
def test_real_entrypoints_validate_external_configuration(entry, valid):
    code = {
        "django.setup": "import django; django.setup()",
        "wsgi": "import config.wsgi",
        "asgi": "import config.asgi",
        "alias": "import django; django.setup()",
        "worker": "from django.core.management import execute_from_command_line; "
        "execute_from_command_line(['manage.py', 'send_pending_notifications', '--help'])",
    }[entry]
    environment = production_environment()
    source = Path(environment["ASSESS_CONFIG_FILE"])
    document = json.loads(source.read_text("utf-8"))
    secret_file = source.parent / document["secrets"]["django_key_file"]
    if entry in {"wsgi", "asgi"}:
        environment.pop("DJANGO_SETTINGS_MODULE")
    elif entry == "alias":
        environment["DJANGO_SETTINGS_MODULE"] = "config.settings"
    if not valid:
        secret_file.write_text("development-" + secrets.token_urlsafe(40), encoding="utf-8")
    result = startup(environment, code)
    assert (result.returncode == 0) is valid, "Unexpected startup outcome (output withheld)."
    if not valid:
        assert "DJANGO_SECRET_KEY" in result.stderr
    assert secret_file.read_text("utf-8") not in result.stdout + result.stderr


def test_development_process_starts_without_any_production_inputs():
    environment = production_environment(DJANGO_SETTINGS_MODULE="config.settings_development")
    environment["APP_BASE_URL"] = "http://127.0.0.1:5173"
    assert startup(environment).returncode == 0


def test_explicit_development_option_is_applied_before_production_validation():
    environment = production_environment(DJANGO_SETTINGS_MODULE="config.settings_development")
    environment["DJANGO_SETTINGS_MODULE"] = "config.settings_production"
    code = (
        "import sys, runpy; sys.argv = ['manage.py', 'shell', "
        "'--settings=config.settings_development', '-c', "
        "\"from django.conf import settings; assert settings.ENVIRONMENT == 'development'\"]; "
        "runpy.run_path('manage.py', run_name='__main__')"
    )
    result = startup(environment, code)
    assert result.returncode == 0, result.stderr
