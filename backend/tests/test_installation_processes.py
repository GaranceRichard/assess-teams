import os
import sqlite3
import subprocess
import sys
from pathlib import Path

import pytest

from config.installation import LEGACY_NAMES
from tests.installation_helpers import change_document, installation_file, private_file

pytestmark = [pytest.mark.functional, pytest.mark.integration]
BACKEND = Path(__file__).resolve().parents[1]
WORKERS = [
    "send_pending_notifications",
    "send_password_reset_emails",
    "send_due_evaluation_notifications",
]


def environment(source):
    result = {key: value for key, value in os.environ.items() if key not in LEGACY_NAMES}
    result.update(
        ASSESS_CONFIG_FILE=str(source), DJANGO_SETTINGS_MODULE="config.settings_production"
    )
    return result


def process(source, arguments, cwd=BACKEND):
    return subprocess.run(
        [sys.executable, *arguments],
        env=environment(source),
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=60,
    )


@pytest.mark.parametrize("entry", ["wsgi", "asgi", "alias", "shell", *WORKERS])
def test_real_consumers_load_the_same_source_and_database(tmp_path, entry):
    source = installation_file(tmp_path)
    (tmp_path / "data").mkdir()
    migrate = process(source, ["manage.py", "migrate", "--noinput", "--verbosity", "0"])
    assert migrate.returncode == 0, migrate.stderr
    code = (
        "from django.conf import settings; import os; "
        "assert str(settings.INSTALLATION_CONFIG_FILE) == os.environ['ASSESS_CONFIG_FILE']; "
        "assert str(settings.DATABASES['default']['NAME']).endswith('assess.sqlite3'); "
        "assert settings.LOGIN_ACCOUNT_LIMIT == 7"
    )
    change_document(source, "http.account_limit", 7)
    if entry in {"wsgi", "asgi"}:
        arguments = ["-c", f"import config.{entry}; " + code]
        arguments[1] += (
            "; from django.test import Client; "
            "client=Client(HTTP_HOST='assess.example', REMOTE_ADDR='127.0.0.1', "
            "HTTP_X_FORWARDED_PROTO='https'); "
            "assert all(client.get(path, secure=True).status_code == 200 "
            "for path in ['/api/health/', '/api/schema/', '/api/docs/'])"
        )
    elif entry == "alias":
        arguments = [
            "-c",
            "import os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; "
            "import django; django.setup(); " + code,
        ]
    else:
        command = "shell" if entry == "shell" else entry
        arguments = [
            "-c",
            "import django; django.setup(); "
            + code
            + "; from django.core.management import call_command; "
            + (
                "call_command('shell', command='pass')"
                if command == "shell"
                else f"call_command('{command}')"
            ),
        ]
    arguments[1] = f"import sys; sys.path.insert(0, {str(BACKEND)!r}); " + arguments[1]
    result = process(source, arguments, cwd=tmp_path)
    assert result.returncode == 0, result.stderr
    assert "DJANGO_SECRET_KEY" not in result.stdout


@pytest.mark.parametrize("entry", ["wsgi", "asgi", "migrate", "shell", *WORKERS])
@pytest.mark.parametrize("refusal", ["missing", "invalid", "competing"])
def test_invalid_configuration_refuses_every_entry_before_any_effect(tmp_path, entry, refusal):
    source = installation_file(tmp_path)
    marker = "private-marker-must-never-appear"
    if refusal == "missing":
        change_document(source, "smtp.host", None, remove=True)
    elif refusal == "invalid":
        change_document(source, "smtp.sender", marker)
    code = """
import sys
def audit(event, arguments):
    if event in {'sqlite3.connect', 'socket.connect', 'os.mkdir', 'os.remove', 'os.rename'}:
        raise AssertionError('UNEXPECTED_EFFECT')
sys.addaudithook(audit)
"""
    if entry in {"wsgi", "asgi"}:
        code += f"import config.{entry}"
    else:
        code += (
            "import runpy; "
            f"sys.argv = ['manage.py', '{entry}'"
            + (", '-c', 'raise AssertionError(\"UNEXPECTED_EFFECT\")'" if entry == "shell" else "")
            + "]; runpy.run_path('manage.py', run_name='__main__')\n"
        )
    env = environment(source)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    if refusal == "competing":
        env["APP_BASE_URL"] = "https://assess.example"
    result = subprocess.run(
        [sys.executable, "-c", code],
        cwd=BACKEND,
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode != 0
    assert "ImproperlyConfigured" in result.stderr
    assert "UNEXPECTED_EFFECT" not in result.stderr
    assert marker not in result.stdout + result.stderr
    assert not (tmp_path / "data").exists()


@pytest.mark.parametrize(
    "mutation",
    [
        "DATABASES['default']['NAME']='other.sqlite3'",
        "LOGIN_ACCOUNT_LIMIT=100",
        "STATIC_ROOT='other'",
        "EMAIL_DELIVER_ON_COMMIT=True",
        "INSTALLATION={}",
    ],
)
def test_partial_application_is_refused_before_effect(tmp_path, mutation):
    source = installation_file(tmp_path)
    result = process(
        source,
        [
            "-c",
            "from django.conf import settings; settings."
            + mutation
            + "; import django; django.setup()",
        ],
    )
    assert result.returncode != 0
    assert "ImproperlyConfigured" in result.stderr
    assert not (tmp_path / "data").exists()


def test_refusal_preserves_existing_database_bytes(tmp_path):
    source = installation_file(tmp_path)
    (tmp_path / "data").mkdir()
    database = tmp_path / "data/assess.sqlite3"
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE retained (value TEXT)")
        connection.execute("INSERT INTO retained VALUES ('existing-business-proof')")
    before = database.read_bytes()
    change_document(source, "journals.activity", 1)
    for command in ["migrate", *WORKERS]:
        result = process(source, ["manage.py", command])
        assert result.returncode != 0
        assert database.read_bytes() == before


def test_private_file_diagnostics_never_reveal_content_or_path(tmp_path):
    source = installation_file(tmp_path)
    private = private_file(source, "django.key")
    marker = "development-private-value-should-never-leak"
    private.write_text(marker, encoding="utf-8")
    result = process(source, ["manage.py", "check"])
    assert result.returncode != 0
    assert marker not in result.stderr + result.stdout
    assert str(private) not in result.stderr + result.stdout


def test_changing_source_between_import_and_startup_is_refused(tmp_path):
    source = installation_file(tmp_path)
    alternate = source.with_name("alternate.json")
    alternate.write_bytes(source.read_bytes())
    code = (
        "from django.conf import settings; assert settings.ENVIRONMENT == 'production'; "
        "import os; "
        f"os.environ['ASSESS_CONFIG_FILE'] = {str(alternate)!r}; "
        "import django; django.setup()"
    )
    result = process(source, ["-c", code])
    assert result.returncode != 0
    assert "INSTALLATION_CONFIG_FILE" in result.stderr
    assert not (tmp_path / "data").exists()
