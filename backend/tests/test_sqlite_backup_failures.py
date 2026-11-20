"""Creation refusals preserve source and previous valid O07 bundles."""

import sqlite3
from contextlib import closing
from unittest.mock import patch

import pytest

from tests import sqlite_backup_helpers
from tests.sqlite_backup_helpers import capture
from tools.sqlite_backup import main
from tools.sqlite_backup_files import BackupError, digest

backup_instance = sqlite_backup_helpers.backup_instance
pytestmark = [pytest.mark.functional, pytest.mark.integration]


@pytest.mark.parametrize(
    "flags,code",
    [
        ([], "FROZEN_INVENTORY_REQUIRED"),
        (["--inventory-confirmed"], "PRIVATE_STORAGE_REQUIRED"),
        (
            ["--inventory-confirmed", "--private-storage-confirmed", "--timeout", "nan"],
            "INVALID_TIMEOUT",
        ),
        (
            ["--inventory-confirmed", "--private-storage-confirmed", "--required-file", "missing"],
            "MISSING_FILE",
        ),
    ],
)
def test_refuses_missing_prerequisites_before_capture(backup_instance, flags, code, capsys):
    assert main(["create", "--config", str(backup_instance[0]), *flags]) == 1
    assert code in capsys.readouterr().err
    assert list(backup_instance[2].iterdir()) == []


def test_changed_configuration_is_quarantined_without_source_effect(backup_instance):
    before = digest(backup_instance[1])
    changed = False

    def progress(*args):
        nonlocal changed
        if not changed:
            changed = True
            with backup_instance[0].open("a") as stream:
                stream.write(" ")

    with pytest.raises(BackupError, match="INPUT_CHANGED"):
        capture(backup_instance, progress=progress)
    assert digest(backup_instance[1]) == before
    assert all(p.name.startswith(".incomplete-") for p in backup_instance[2].iterdir())


def test_busy_source_times_out_without_qualified_bundle(backup_instance):
    before = digest(backup_instance[1])
    with closing(sqlite3.connect(backup_instance[1])) as lock:
        lock.execute("BEGIN EXCLUSIVE")
        with pytest.raises(BackupError, match="BACKUP_TIMEOUT"):
            capture(backup_instance, timeout=0.05)
        lock.rollback()
    assert digest(backup_instance[1]) == before
    assert all(p.name.startswith(".incomplete-") for p in backup_instance[2].iterdir())


def test_no_space_preserves_earlier_backup(backup_instance):
    first = capture(backup_instance)
    before = digest(first / "manifest.json")
    with patch("tools.sqlite_backup_bundle.shutil.disk_usage") as usage:
        usage.return_value.free = 0
        with pytest.raises(BackupError, match="INSUFFICIENT_SPACE"):
            capture(backup_instance)
    assert digest(first / "manifest.json") == before


def test_invalid_configuration_diagnostics_do_not_echo_content(backup_instance, capsys):
    backup_instance[0].write_text('invalid "confidential-marker"', "utf-8")
    assert (
        main(
            [
                "create",
                "--config",
                str(backup_instance[0]),
                "--inventory-confirmed",
                "--private-storage-confirmed",
            ]
        )
        == 1
    )
    output = capsys.readouterr()
    assert output.err == "REFUSED INVALID_OR_UNREADABLE_INPUT\n"
    assert output.out == ""


def test_interrupted_capture_preserves_source_and_reports_fixed_code(backup_instance, capsys):
    before = digest(backup_instance[1])
    with patch("tools.sqlite_backup_bundle.online_backup", side_effect=KeyboardInterrupt):
        assert (
            main(
                [
                    "create",
                    "--config",
                    str(backup_instance[0]),
                    "--inventory-confirmed",
                    "--private-storage-confirmed",
                ]
            )
            == 130
        )
    assert capsys.readouterr().err == "REFUSED INTERRUPTED\n"
    assert digest(backup_instance[1]) == before
    assert all(p.name.startswith(".incomplete-") for p in backup_instance[2].iterdir())


def test_live_database_cannot_be_added_as_raw_required_file(backup_instance):
    with pytest.raises(BackupError, match="ACTIVE_FILE_REFUSED"):
        capture(backup_instance, extras=[backup_instance[1]])
    assert list(backup_instance[2].iterdir()) == []
