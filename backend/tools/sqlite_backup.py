"""O07 operator CLI: python -m tools.sqlite_backup create|verify --help."""

import argparse
import sqlite3
import sys
import time
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

from tools.sqlite_backup_bundle import create_bundle, verify_bundle
from tools.sqlite_backup_files import BackupError, digest


def progress_reporter():
    last_report = float("-inf")

    def report(status, remaining, total):
        nonlocal last_report
        now = time.monotonic()
        if status == sqlite3.SQLITE_DONE or now - last_report >= 5:
            print(
                f"BACKUP status={status} remaining_pages={remaining} total_pages={total}",
                file=sys.stderr,
            )
            last_report = now

    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser(
        "create", help="Capture the configured instance into private storage"
    )
    create.add_argument("--config", required=True, type=Path)
    create.add_argument("--inventory-confirmed", action="store_true")
    create.add_argument("--required-file", action="append", type=Path, default=[])
    create.add_argument("--timeout", type=float, default=300)
    create.add_argument("--progress", action="store_true")
    verify = commands.add_parser("verify", help="Check a closed bundle without opening the source")
    verify.add_argument("bundle", type=Path)
    verify.add_argument("--expected-manifest-sha256", required=True)
    for command in (create, verify):
        command.add_argument("--private-storage-confirmed", action="store_true")
    arguments = parser.parse_args(argv)
    try:
        if arguments.command == "create":
            target = create_bundle(
                arguments.config,
                confirmed=arguments.private_storage_confirmed,
                inventory_confirmed=arguments.inventory_confirmed,
                extras=arguments.required_file,
                timeout=arguments.timeout,
                progress=progress_reporter() if arguments.progress else None,
            )
            identifier = target.name
            checksum = digest(target / "manifest.json")
        else:
            public = verify_bundle(
                arguments.bundle,
                arguments.expected_manifest_sha256,
                confirmed=arguments.private_storage_confirmed,
            )
            identifier = public["backup_id"]
            checksum = digest(arguments.bundle / "manifest.json")
    except KeyboardInterrupt:
        print("REFUSED INTERRUPTED", file=sys.stderr)
        return 130
    except BackupError as error:
        print(f"REFUSED {error}", file=sys.stderr)
        return 1
    except (
        OSError,
        ValueError,
        TypeError,
        KeyError,
        AttributeError,
        RecursionError,
        sqlite3.Error,
        ImproperlyConfigured,
    ):
        # Exception messages may contain source paths, SQL row data or confidential configuration.
        print("REFUSED INVALID_OR_UNREADABLE_INPUT", file=sys.stderr)
        return 1
    print(f"VERIFIED {identifier} manifest_sha256={checksum} restore_qualified=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
