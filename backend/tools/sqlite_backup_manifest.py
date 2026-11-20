"""Strict public metadata: no paths, private hashes, row values or arbitrary labels."""

import re
import uuid
from datetime import datetime

from tools.sqlite_backup_files import fingerprint, require

METHOD = "sqlite3.Connection.backup"


def application_version(records):
    return fingerprint(
        [
            {k: r[k] for k in ("restore_path", "size", "sha256")}
            for r in records
            if r["kind"] in {"application", "frontend", "static", "runtime"}
        ]
    )


def manifest(identifier, started, finished, db_digest, version, schema, inventory_digest):
    return {
        "format": 1,
        "backup_id": identifier,
        "method": METHOD,
        "started_utc": started,
        "finished_utc": finished,
        "database_sha256": db_digest,
        "application_sha256": version,
        "schema_sha256": schema["schema_sha256"],
        "migrations_sha256": schema["migrations_sha256"],
        "inventory_sha256": inventory_digest,
        "restore_qualified": False,
    }


def validate_manifest(value):
    keys = {
        "format",
        "backup_id",
        "method",
        "started_utc",
        "finished_utc",
        "database_sha256",
        "application_sha256",
        "schema_sha256",
        "migrations_sha256",
        "inventory_sha256",
        "restore_qualified",
    }
    require(isinstance(value, dict) and value.keys() == keys, "MANIFEST_REFUSED")
    require(
        type(value["format"]) is int
        and value["format"] == 1
        and value["method"] == METHOD
        and value["restore_qualified"] is False,
        "METHOD_OR_FORMAT_REFUSED",
    )
    require(isinstance(value["backup_id"], str), "MANIFEST_REFUSED")
    require(str(uuid.UUID(value["backup_id"])) == value["backup_id"], "MANIFEST_REFUSED")
    for key in (
        "database_sha256",
        "application_sha256",
        "schema_sha256",
        "migrations_sha256",
        "inventory_sha256",
    ):
        require(
            isinstance(value[key], str) and re.fullmatch("[a-f0-9]{64}", value[key]),
            "MANIFEST_REFUSED",
        )
    for key in ("started_utc", "finished_utc"):
        require(
            isinstance(value[key], str)
            and re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+00:00", value[key]),
            "MANIFEST_REFUSED",
        )
        datetime.fromisoformat(value[key])
    require(value["started_utc"] <= value["finished_utc"], "MANIFEST_REFUSED")
