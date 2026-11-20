"""MEP-064 CA01–CA04: closed bundle, complete inputs and actual provenance."""

import json
import shutil
import sqlite3
from contextlib import closing
from pathlib import Path

import pytest

from tests import sqlite_backup_helpers
from tests.sqlite_backup_helpers import capture, verify
from tools.sqlite_backup import main
from tools.sqlite_backup_files import digest

backup_instance = sqlite_backup_helpers.backup_instance

pytestmark = [pytest.mark.functional, pytest.mark.integration]


def test_closed_bundle_matches_saved_bytes_and_preserves_source(backup_instance):
    before = digest(backup_instance[1])
    bundle = capture(backup_instance)
    public = verify(bundle)
    private = json.loads((bundle / "private-inventory.json").read_text("utf-8"))
    assert digest(backup_instance[1]) == before
    assert public["database_sha256"] == digest(bundle / "database.sqlite3")
    assert public["restore_qualified"] is False
    assert public["method"] == "sqlite3.Connection.backup"
    assert private["source"] == str(backup_instance[1])
    assert private["runtime"].keys() == {"python", "sqlite", "django"}
    assert private["backup_milliseconds"] >= 0
    kinds = {r["kind"] for r in private["files"]}
    assert kinds == {"private", "configuration", "application", "frontend", "static", "runtime"}
    assert not list(bundle.glob("*-journal"))
    assert not list(bundle.parent.glob(".verify-*"))
    assert not list(bundle.parent.glob(".incomplete-*"))
    for record in private["files"]:
        assert digest(bundle / record["path"]) == digest(Path(record["source"]))
    with closing(sqlite3.connect(bundle / "database.sqlite3")) as connection:
        assert connection.execute("PRAGMA integrity_check").fetchall() == [("ok",)]
        assert connection.execute("PRAGMA foreign_key_check").fetchall() == []


def test_saved_configuration_and_required_file_survive_original_removal(backup_instance, tmp_path):
    extra = tmp_path / "runtime-package.zip"
    extra.write_bytes(b"fictitious immutable recovery runtime package")
    bundle = capture(backup_instance, extras=[extra])
    backup_instance[0].unlink()
    backup_instance[1].unlink()
    extra.unlink()
    assert verify(bundle)["backup_id"] == bundle.name
    private = json.loads((bundle / "private-inventory.json").read_text("utf-8"))
    record = next(r for r in private["files"] if r["kind"] == "required")
    assert (bundle / record["path"]).read_bytes().endswith(b"runtime package")


def test_cli_outputs_only_allowlisted_metadata(backup_instance, capsys):
    assert (
        main(
            [
                "create",
                "--config",
                str(backup_instance[0]),
                "--inventory-confirmed",
                "--progress",
                "--private-storage-confirmed",
            ]
        )
        == 0
    )
    output = capsys.readouterr()
    assert "remaining_pages=0" in output.err
    assert all(line.startswith("BACKUP status=") for line in output.err.splitlines())
    assert str(backup_instance[0].parent) not in output.err
    assert str(backup_instance[0].parent) not in output.out
    bundle = next(p for p in backup_instance[2].iterdir() if not p.name.startswith("."))
    assert (
        main(
            [
                "verify",
                str(bundle),
                "--private-storage-confirmed",
                "--expected-manifest-sha256",
                digest(bundle / "manifest.json"),
            ]
        )
        == 0
    )
    assert "restore_qualified=false" in capsys.readouterr().out


def test_multiple_backups_never_replace_valid_bundle(backup_instance):
    first = capture(backup_instance)
    before = digest(first / "manifest.json")
    second = capture(backup_instance)
    assert first != second
    assert digest(first / "manifest.json") == before
    verify(first)
    verify(second)


def test_capture_accepts_packaged_backend_without_requirements(
    backup_instance, tmp_path, monkeypatch
):
    from tools import sqlite_backup_bundle
    from tools.sqlite_backup_files import APP_FOLDERS

    source = Path(sqlite_backup_bundle.__file__).resolve().parents[1]
    packaged = tmp_path / "pkg"
    packaged.mkdir()
    shutil.copyfile(source / "manage.py", packaged / "manage.py")
    for name in APP_FOLDERS:
        shutil.copytree(
            source / name, packaged / name, ignore=shutil.ignore_patterns("__pycache__")
        )
    monkeypatch.setattr(
        sqlite_backup_bundle, "__file__", str(packaged / "tools/sqlite_backup_bundle.py")
    )
    bundle = capture(backup_instance)
    assert verify(bundle)["backup_id"] == bundle.name
    private = json.loads((bundle / "private-inventory.json").read_text("utf-8"))
    saved = {row["restore_path"] for row in private["files"]}
    assert "application/manage.py" in saved
    assert "application/requirements.txt" not in saved
