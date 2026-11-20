"""MEP-064 CR01–CR03: refuse incomplete/altered bundles with safe diagnostics."""

import os
import sqlite3
from contextlib import closing

import pytest

from tests import sqlite_backup_helpers
from tests.sqlite_backup_helpers import (
    capture,
    reseal,
    rewrite,
    verify,
)
from tools.sqlite_backup import main
from tools.sqlite_backup_files import BackupError, digest

backup_instance = sqlite_backup_helpers.backup_instance

pytestmark = [pytest.mark.functional, pytest.mark.integration]


def cli_verify(bundle):
    return main(
        [
            "verify",
            str(bundle),
            "--private-storage-confirmed",
            "--expected-manifest-sha256",
            digest(bundle / "manifest.json"),
        ]
    )


@pytest.mark.parametrize(
    "change,code",
    [
        (lambda m: m.update(method="shutil.copyfile"), "METHOD_OR_FORMAT_REFUSED"),
        (lambda m: m.update(secret="confidential-marker"), "MANIFEST_REFUSED"),
        (lambda m: m.update(schema_sha256="0" * 64), "SCHEMA_MISMATCH"),
        (lambda m: m.update(application_sha256="0" * 64), "APPLICATION_ALTERED"),
    ],
)
def test_refuses_false_method_or_public_metadata(backup_instance, change, code, capsys):
    bundle = capture(backup_instance)
    before = digest(backup_instance[1])
    rewrite(bundle / "manifest.json", change)
    assert cli_verify(bundle) == 1
    output = capsys.readouterr()
    assert output.out == "" and code in output.err
    assert "confidential-marker" not in output.err
    assert digest(backup_instance[1]) == before


@pytest.mark.parametrize("target", ["database.sqlite3", "files/00000", "private-inventory.json"])
def test_refuses_byte_alteration(backup_instance, target, capsys):
    bundle = capture(backup_instance)
    before = digest(backup_instance[1])
    with (bundle / target).open("ab") as stream:
        stream.write(b"confidential-marker")
    assert cli_verify(bundle) == 1
    assert "confidential-marker" not in capsys.readouterr().err
    assert digest(backup_instance[1]) == before


@pytest.mark.parametrize(
    "damage,code",
    [
        ("foreign_key", "FOREIGN_KEYS"),
        ("business", "BUSINESS_INTEGRITY"),
        ("migration", "MIGRATIONS_MISMATCH"),
        ("corruption", "INVALID_OR_UNREADABLE_INPUT"),
    ],
)
def test_isolated_checks_refuse_damage_even_with_recomputed_digest(
    backup_instance, damage, code, capsys
):
    bundle = capture(backup_instance)
    before = digest(backup_instance[1])
    path = bundle / "database.sqlite3"
    if damage == "corruption":
        path.write_bytes(b"corrupted database confidential-marker")
    else:
        with closing(sqlite3.connect(path)) as connection:
            if damage == "foreign_key":
                connection.execute(
                    "INSERT INTO teams_team(name,is_active,organization_id) "
                    "VALUES('corrupt',1,999999)"
                )
            elif damage == "migration":
                connection.execute("DELETE FROM django_migrations WHERE app='teams'")
            else:
                connection.execute("""INSERT INTO journals_activityentry
                    (created_at,organization_id,organization_origin_id,organization_name,
                     actor_name,team_name,target_user_name,action,description)
                    SELECT datetime('now'),id,999999,name,'','','','organization_created','invalid'
                    FROM identities_organization LIMIT 1""")
            connection.commit()
    reseal(bundle)
    assert cli_verify(bundle) == 1
    output = capsys.readouterr()
    assert code in output.err and "confidential-marker" not in output.err
    assert digest(backup_instance[1]) == before


def test_missing_required_or_unexpected_file_is_refused(backup_instance):
    bundle = capture(backup_instance)
    (bundle / "files/00000").unlink()
    with pytest.raises(BackupError, match="MISSING_FILE"):
        verify(bundle)
    bundle = capture(backup_instance)
    (bundle / "extra-secret").write_text("confidential-marker", "utf-8")
    with pytest.raises(BackupError, match="UNEXPECTED_CONTENT"):
        verify(bundle)


def test_trusted_manifest_fingerprint_catches_provenance_changes(backup_instance):
    from tools.sqlite_backup_bundle import verify_bundle

    bundle = capture(backup_instance)
    expected = digest(bundle / "manifest.json")
    rewrite(bundle / "manifest.json", lambda m: m.update(backup_id="0" * 32))
    with pytest.raises(BackupError, match="MANIFEST_ALTERED"):
        verify_bundle(bundle, expected, confirmed=True)


def test_quarantined_or_raw_copy_cannot_be_verified(backup_instance, capsys):
    import shutil

    bundle = capture(backup_instance)
    quarantined = bundle.with_name(".incomplete-" + bundle.name)
    bundle.rename(quarantined)
    assert cli_verify(quarantined) == 1
    assert "INCOMPLETE_BUNDLE" in capsys.readouterr().err
    raw = backup_instance[2] / "raw-copy"
    raw.mkdir(mode=0o700)
    shutil.copyfile(backup_instance[1], raw / "database.sqlite3")
    assert cli_verify_without_manifest(raw) == 1
    assert "MISSING_FILE" in capsys.readouterr().err


def cli_verify_without_manifest(bundle):
    return main(
        [
            "verify",
            str(bundle),
            "--private-storage-confirmed",
            "--expected-manifest-sha256",
            "0" * 64,
        ]
    )


@pytest.mark.parametrize("field", ["path", "restore_path"])
def test_private_inventory_cannot_escape_bundle(backup_instance, field, capsys):
    bundle = capture(backup_instance)
    rewrite(
        bundle / "private-inventory.json",
        lambda value: value["files"][0].update({field: "../outside"}),
    )
    reseal(bundle)
    assert cli_verify(bundle) == 1
    assert "UNSAFE_PATH" in capsys.readouterr().err


@pytest.mark.skipif(os.name == "nt", reason="POSIX mode bits, Windows uses verified ACLs")
def test_verify_refuses_unprotected_scratch_parent(backup_instance):
    bundle = capture(backup_instance)
    bundle.parent.chmod(0o755)
    try:
        with pytest.raises(BackupError, match="PRIVATE_STORAGE_REQUIRED"):
            verify(bundle)
    finally:
        bundle.parent.chmod(0o700)
