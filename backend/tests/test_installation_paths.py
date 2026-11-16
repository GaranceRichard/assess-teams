import json
import shutil
import subprocess
import sys
import traceback
from pathlib import Path

import pytest
from django.core.exceptions import ImproperlyConfigured

from config.installation import load_installation
from config.installation_paths import resolve_path
from tests.installation_helpers import change_document, installation_file, startup_audit

pytestmark = [pytest.mark.functional, pytest.mark.contract]


@pytest.mark.parametrize("selector", [None, "", "instance.json", "C:relative.json"])
def test_missing_or_relative_selector_is_refused(selector):
    with pytest.raises(ImproperlyConfigured, match="ASSESS_CONFIG_FILE"):
        load_installation({"ASSESS_CONFIG_FILE": selector})


@pytest.mark.parametrize(
    "value",
    [
        " ",
        "a\x00b",
        "%VAR%/file",
        "$VAR/file",
        "~/file",
        "https://host/file",
        "C:relative.db",
        "\\rootless.db",
    ],
)
def test_ambiguous_paths_are_refused(tmp_path, value):
    source = installation_file(tmp_path)
    change_document(source, "sqlite.file", value)
    with pytest.raises(ImproperlyConfigured):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


@pytest.mark.parametrize(
    "field,value",
    [
        ("sqlite.file", "runtime/db.sqlite3"),
        ("sqlite.file", "data"),
        ("paths.logs", "data"),
        ("paths.tmp", "releases/tmp"),
        ("paths.backups", "runtime/backups"),
        ("paths.runtime", "releases/runtime"),
        ("paths.static", "releases/reference/frontend/static"),
        ("paths.frontend", "logs/frontend"),
        ("secrets.django_key_file", "runtime/key"),
        ("http.private_key_file", "releases/key"),
        ("http.certificate_file", "data/assess.sqlite3"),
        ("secrets.django_key_file", "instance.json"),
    ],
)
def test_collisions_and_replaceable_private_destinations_are_refused(tmp_path, field, value):
    source = installation_file(tmp_path)
    change_document(source, field, value)
    with pytest.raises(ImproperlyConfigured):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


def test_paths_use_the_selected_parent_not_cwd_and_normalize_separators(tmp_path, monkeypatch):
    source = installation_file(tmp_path)
    change_document(source, "sqlite.file", "data\\segment\\..\\assess.sqlite3")
    elsewhere = tmp_path / "elsewhere"
    elsewhere.mkdir()
    monkeypatch.chdir(elsewhere)
    result = load_installation({"ASSESS_CONFIG_FILE": str(source)})
    assert result["DATABASES"]["default"]["NAME"] == tmp_path / "data/assess.sqlite3"


def test_relocated_document_requires_paths_validated_at_the_new_base(tmp_path):
    source = installation_file(tmp_path)
    relocated = tmp_path / "relocated"
    relocated.mkdir()
    shutil.copy(source, relocated / source.name)
    with pytest.raises(ImproperlyConfigured, match="Configuration"):
        load_installation({"ASSESS_CONFIG_FILE": str(relocated / source.name)})


@pytest.mark.parametrize("directory", ["OneDrive", "OneDrive - Site", "Dropbox", "Google Drive"])
def test_synchronized_database_destinations_are_refused(tmp_path, directory):
    source = installation_file(tmp_path)
    document = json.loads(source.read_text("utf-8"))
    document["paths"]["data"] = str(tmp_path / directory)
    document["sqlite"]["file"] = str(tmp_path / directory / "data.sqlite3")
    source.write_text(json.dumps(document), encoding="utf-8")
    with pytest.raises(ImproperlyConfigured):
        load_installation({"ASSESS_CONFIG_FILE": str(source)})


def test_filesystem_resolution_failure_does_not_expose_the_private_path(tmp_path, monkeypatch):
    private_path = "private-path-marker"

    def denied(path):
        raise PermissionError(private_path)

    monkeypatch.setattr(Path, "resolve", denied)
    with pytest.raises(ImproperlyConfigured) as error:
        resolve_path(private_path, tmp_path)
    assert private_path not in "".join(traceback.format_exception(error.value))


def test_application_exit_mutations_are_still_observed_by_the_startup_audit(tmp_path):
    destination = tmp_path / "forbidden-application-effect"
    code = startup_audit() + (
        f"import os; atexit.register(os.mkdir, {str(destination)!r}); "
        "raise RuntimeError('startup refused')"
    )
    result = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, timeout=30
    )
    assert result.returncode != 0
    assert "UNEXPECTED_EFFECT" in result.stderr
    assert not destination.exists()
