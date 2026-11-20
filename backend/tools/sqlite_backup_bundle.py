"""Create an exclusive private O07 bundle and verify its closed artifacts."""

import math
import platform
import secrets
import shutil
import sqlite3
import uuid
from datetime import UTC, datetime
from pathlib import Path

import django

from config.installation import load_installation, read_document
from config.installation_paths import overlaps
from tools.sqlite_backup_checks import inspect_database, online_backup
from tools.sqlite_backup_files import (
    capture_files,
    check_frozen,
    digest,
    inventory,
    private_root,
    regular,
    require,
    write_json,
)
from tools.sqlite_backup_inventory import verify_inventory, verify_migrations
from tools.sqlite_backup_manifest import application_version, manifest, validate_manifest


def verify_bundle(root, expected_manifest, *, confirmed=False):
    root = Path(root).absolute()
    private_root(root, confirmed)
    private_root(root.parent, confirmed)
    regular(root / "manifest.json")
    require(digest(root / "manifest.json") == expected_manifest, "MANIFEST_ALTERED")
    public = read_document(root / "manifest.json")
    validate_manifest(public)
    require(root.name == public["backup_id"], "INCOMPLETE_BUNDLE")
    regular(root / "private-inventory.json")
    require(
        digest(root / "private-inventory.json") == public["inventory_sha256"], "INVENTORY_ALTERED"
    )
    records = verify_inventory(root, read_document(root / "private-inventory.json"))
    require(digest(root / "database.sqlite3") == public["database_sha256"], "DATABASE_ALTERED")
    require(application_version(records) == public["application_sha256"], "APPLICATION_ALTERED")
    schema = inspect_database(root / "database.sqlite3", root.parent)
    verify_migrations(schema, records)
    for key in ("schema_sha256", "migrations_sha256"):
        require(schema[key] == public[key], "SCHEMA_MISMATCH")
    return public


def create_bundle(
    config, *, confirmed=False, inventory_confirmed=False, extras=(), timeout=300, progress=None
):
    require(inventory_confirmed, "FROZEN_INVENTORY_REQUIRED")
    require(math.isfinite(timeout) and timeout > 0, "INVALID_TIMEOUT")
    config = Path(config).absolute()
    regular(config)
    config_digest = digest(config)
    settings = load_installation({"ASSESS_CONFIG_FILE": str(config)})
    document = settings["INSTALLATION"]
    source = document["sqlite"]["file"]
    regular(source)
    destination = document["paths"]["backups"]
    private_root(destination, confirmed)
    application = Path(__file__).resolve().parents[1]
    inputs = inventory(settings, extras, application)
    require(
        not overlaps(destination, application)
        and all(not overlaps(destination, p) for _, p, _ in inputs)
        and not overlaps(destination, source),
        "DESTINATION_REFUSED",
    )
    required_space = source.stat().st_size * 2 + sum(p.stat().st_size for _, p, _ in inputs)
    require(shutil.disk_usage(destination).free > required_space, "INSUFFICIENT_SPACE")
    identifier = str(uuid.uuid4())
    staging = destination / (".incomplete-" + identifier)
    staging.mkdir(mode=0o700)
    started = datetime.now(UTC).isoformat(timespec="microseconds")
    records = capture_files(staging, inputs)
    require(records[0]["sha256"] == config_digest, "INPUT_CHANGED")
    elapsed = online_backup(source, staging / "database.sqlite3", timeout, progress)
    check_frozen(inventory(settings, extras, application), records)
    schema = inspect_database(staging / "database.sqlite3", destination)
    verify_migrations(schema, records)
    write_json(
        staging / "private-inventory.json",
        {
            "source": str(source),
            "files": records,
            "backup_milliseconds": round(elapsed * 1000),
            "nonce": secrets.token_hex(32),
            "runtime": {
                "python": platform.python_version(),
                "sqlite": sqlite3.sqlite_version,
                "django": django.get_version(),
            },
        },
    )
    public = manifest(
        identifier,
        started,
        datetime.now(UTC).isoformat(timespec="microseconds"),
        digest(staging / "database.sqlite3"),
        application_version(records),
        schema,
        digest(staging / "private-inventory.json"),
    )
    write_json(staging / "manifest.json", public)
    verify_inventory(staging, read_document(staging / "private-inventory.json"))
    # Re-read frozen inputs after all checks, including any configuration file changes.
    check_frozen(inventory(settings, extras, application), records)
    target = destination / identifier
    require(not target.exists(), "DESTINATION_EXISTS")
    staging.rename(target)
    return target
