import json
import os
import secrets
from pathlib import Path

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.installation import LEGACY_NAMES, load_installation
from tests.installation_helpers import (
    change_document,
    installation_file,
    markdown_json,
    private_file,
)

pytestmark = [pytest.mark.functional, pytest.mark.contract]


def test_embedded_schema_is_exactly_the_acquired_mep054_contract():
    schema = Path(__file__).resolve().parents[1] / "config/installation.schema.json"
    assert json.loads(schema.read_text("utf-8")) == markdown_json("unique-contract.md")


def test_complete_configuration_preserves_defaults_and_has_no_environment_effect(tmp_path):
    source = installation_file(tmp_path)
    before = dict(os.environ)
    result = load_installation({"ASSESS_CONFIG_FILE": str(source)})
    assert os.environ == before
    assert result["DATABASES"]["default"]["NAME"] == tmp_path / "data/assess.sqlite3"
    assert result["JOURNAL_RETENTION"] == {"activity": None, "technical": None}
    assert result["LOGIN_ACCOUNT_LIMIT"] == 5
    assert result["LOGIN_ORIGIN_LIMIT"] == 30
    assert result["LOGIN_LIMIT_SECONDS"] == 900
    assert result["INSTALLATION"]["backups"] == {"interval_hours": None, "retention_days": None}
    assert not (tmp_path / "data").exists()


@pytest.mark.parametrize("name", LEGACY_NAMES)
@pytest.mark.parametrize("value", ["", "same-or-different"])
def test_any_competing_source_is_refused_even_when_empty(tmp_path, name, value):
    source = installation_file(tmp_path)
    with pytest.raises(ImproperlyConfigured, match=name):
        load_installation({"ASSESS_CONFIG_FILE": str(source), name: value})


@pytest.mark.parametrize(
    "field,value",
    [
        ("version", 2),
        ("version", True),
        ("version", 1.0),
        ("organisation", {}),
        ("smtp.port", "587"),
        ("smtp.port", 0),
        ("smtp.port", 65536),
        ("services.delivery_seconds", 0),
        ("services.due_time", "24:00"),
        ("services.api_host", "0.0.0.0"),
        ("services.api_port", 0),
        ("backups.retention_days", 0),
        ("journals.activity", 30),
        ("journals.technical", 0),
        ("secrets.django_key", "forbidden"),
        ("http.hosts", ["assess.example", "assess.example"]),
    ],
)
def test_schema_refuses_the_acquired_invalid_examples(tmp_path, field, value):
    source = installation_file(tmp_path)
    change_document(source, field, value)
    with pytest.raises(ImproperlyConfigured, match="v1"):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


@pytest.mark.parametrize("field", ["version", "secrets.django_key_file", "paths.data", "smtp.host"])
def test_required_values_have_no_silent_fallback(tmp_path, field):
    source = installation_file(tmp_path)
    change_document(source, field, None, remove=True)
    with pytest.raises(ImproperlyConfigured, match="v1"):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


@pytest.mark.parametrize(
    "field,value",
    [
        ("http.origin", "http://assess.example"),
        ("http.hosts", ["*"]),
        ("http.hosts", ["assess.example,other.example"]),
        ("http.csrf_origins", ["https://other.example"]),
        ("http.proxies", ["0.0.0.0/0"]),
        ("http.login_proxies", []),
        ("smtp.ssl", True),
        ("smtp.user", "fictif"),
        ("smtp.sender", "noreply@site.local"),
        ("services.timezone", "Invalid/Zone"),
        ("services.account", "EXAMPLE\\Administrator"),
    ],
)
def test_existing_security_and_service_refusals_are_retained(tmp_path, field, value):
    source = installation_file(tmp_path)
    change_document(source, field, value)
    with pytest.raises(ImproperlyConfigured):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


@pytest.mark.parametrize(
    "payload",
    [
        b'{"version":1,"version":1}',
        b"{} trailing",
        b"\xff",
        b'{"version":NaN}',
        b'{"version":Infinity}',
    ],
)
def test_invalid_json_never_echoes_its_contents(tmp_path, payload):
    source = tmp_path / "private-marker.json"
    source.write_bytes(payload)
    with pytest.raises(ImproperlyConfigured) as error:
        load_installation({"ASSESS_CONFIG_FILE": str(source)})
    assert "private-marker" not in str(error.value)


@pytest.mark.parametrize("credential", [True, False])
def test_private_references_are_resolved_without_exporting_secrets(tmp_path, credential):
    source = installation_file(tmp_path)
    key = private_file(source, "django.key").read_text("utf-8")
    if credential:
        value = secrets.token_urlsafe(32)
        smtp_file = private_file(source, "smtp.key")
        smtp_file.write_text(value, encoding="utf-8")
        change_document(source, "smtp.user", "service")
        change_document(source, "secrets.smtp_credential_file", str(smtp_file))
    result = load_installation({"ASSESS_CONFIG_FILE": str(source)})
    assert result["SECRET_KEY"] == key
    assert result["EMAIL_HOST_PASSWORD"] == (value if credential else "")
    assert key not in json.dumps(result["INSTALLATION"], default=str)
