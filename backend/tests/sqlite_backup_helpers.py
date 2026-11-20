"""Real migrated SQLite and fictitious private configuration for O07 tests."""

import json
import sqlite3
from contextlib import closing
from pathlib import Path

import pytest
from django.db import connection

from identities.models import Organization
from tests.installation_helpers import installation_file
from tools.sqlite_backup_bundle import create_bundle, verify_bundle
from tools.sqlite_backup_files import digest


@pytest.fixture
def backup_instance(tmp_path, transactional_db):
    config = installation_file(tmp_path)
    document = json.loads(config.read_text("utf-8"))
    for value in document["paths"].values():
        Path(value).mkdir(parents=True, exist_ok=True, mode=0o700)
    for name in ("frontend", "static", "runtime"):
        (Path(document["paths"][name]) / "index.html").write_text("fictitious assets", "utf-8")
    for name in ("certificate_file", "private_key_file"):
        Path(document["http"][name]).write_text("fictitious protected TLS material", "utf-8")
    Organization.objects.create(name="Before backup")
    source = tmp_path / document["sqlite"]["file"]
    connection.ensure_connection()
    with closing(sqlite3.connect(source)) as destination:
        connection.connection.backup(destination)
    return config, source, Path(document["paths"]["backups"])


def capture(instance, **kwargs):
    return create_bundle(instance[0], confirmed=True, inventory_confirmed=True, **kwargs)


def verify(bundle):
    return verify_bundle(bundle, digest(bundle / "manifest.json"), confirmed=True)


def rewrite(path, mutate):
    value = json.loads(path.read_text("utf-8"))
    mutate(value)
    path.write_text(json.dumps(value), "utf-8")


def reseal(bundle):
    rewrite(
        bundle / "manifest.json",
        lambda value: value.update(
            database_sha256=digest(bundle / "database.sqlite3"),
            inventory_sha256=digest(bundle / "private-inventory.json"),
        ),
    )
