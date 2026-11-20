"""SQLite online backup and isolated, read-only integrity inspection."""

import shutil
import sqlite3
import time
from contextlib import closing
from pathlib import Path
from tempfile import TemporaryDirectory

from tools.sqlite_backup_business import check_business
from tools.sqlite_backup_files import fingerprint, require


def connect_readonly(path):
    return sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True, timeout=0.1)


def online_backup(source, target, timeout, progress=None):
    require(timeout > 0, "INVALID_TIMEOUT")
    started = time.monotonic()

    def observe(status, remaining, total):
        require(time.monotonic() - started < timeout, "BACKUP_TIMEOUT")
        if progress:
            progress(status, remaining, total)

    # Exclusivity belongs to our newly created staging directory and empty file.
    with target.open("xb"):
        pass
    with closing(connect_readonly(source)) as reader, closing(sqlite3.connect(target)) as writer:
        reader.backup(writer, pages=128, progress=observe, sleep=0.05)
    return time.monotonic() - started


def inspect_database(path, scratch_parent):
    # Never inspect the live DB or execute migrations/repairs on the saved artifact.
    with TemporaryDirectory(prefix=".verify-", dir=scratch_parent) as temporary:
        isolated = Path(temporary) / "database.sqlite3"
        shutil.copyfile(path, isolated)
        with closing(connect_readonly(isolated)) as connection:
            connection.execute("PRAGMA query_only=ON")
            require(
                connection.execute("PRAGMA quick_check(1)").fetchall() == [("ok",)],
                "SQLITE_INTEGRITY",
            )
            require(
                connection.execute("PRAGMA integrity_check").fetchall() == [("ok",)],
                "SQLITE_INTEGRITY",
            )
            require(not connection.execute("PRAGMA foreign_key_check").fetchall(), "FOREIGN_KEYS")
            check_business(connection)
            schema = connection.execute(
                "SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name"
            ).fetchall()
            migrations = connection.execute(
                "SELECT app,name FROM django_migrations ORDER BY app,name"
            ).fetchall()
            return {
                "schema_sha256": fingerprint(schema),
                "migrations_sha256": fingerprint(migrations),
                "migrations": migrations,
            }
