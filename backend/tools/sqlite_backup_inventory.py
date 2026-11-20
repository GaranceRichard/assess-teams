"""Private completeness, safe inventory paths and migration compatibility."""

from pathlib import Path, PurePosixPath

from jsonschema import Draft202012Validator

from config.installation import read_document
from config.installation_paths import resolve_path
from tools.sqlite_backup_files import APP_FOLDERS, digest, regular, require, tree_files


def verify_inventory(root, private):
    require(
        isinstance(private, dict)
        and private.keys() == {"files", "source", "runtime", "backup_milliseconds", "nonce"},
        "INVENTORY_REFUSED",
    )
    records = private["files"]
    require(isinstance(records, list) and bool(records), "INVENTORY_REFUSED")
    names = []
    for record in records:
        require(
            isinstance(record, dict)
            and record.keys() == {"kind", "path", "restore_path", "source", "size", "sha256"},
            "INVENTORY_REFUSED",
        )
        name = record["path"]
        for value in (name, record["restore_path"]):
            require(
                isinstance(value, str) and not any(c in value for c in "\\:\x00"), "UNSAFE_PATH"
            )
            require(
                not PurePosixPath(value).is_absolute()
                and all(p not in {"", ".", ".."} for p in value.split("/")),
                "UNSAFE_PATH",
            )
        require(
            record["kind"]
            in {
                "configuration",
                "private",
                "required",
                "application",
                "frontend",
                "static",
                "runtime",
            },
            "INVENTORY_REFUSED",
        )
        path = root / name
        regular(path)
        require(
            path.stat().st_size == record["size"] and digest(path) == record["sha256"],
            "FILE_ALTERED",
        )
        names.append(name)
    require(
        len(set(names)) == len(names) and len({r["restore_path"] for r in records}) == len(records),
        "INVENTORY_REFUSED",
    )
    expected = {*names, "database.sqlite3", "manifest.json", "private-inventory.json"}
    require(
        {p.relative_to(root).as_posix() for p in tree_files(root)} == expected, "UNEXPECTED_CONTENT"
    )
    configuration = [r for r in records if r["kind"] == "configuration"]
    require(len(configuration) == 1, "INCOMPLETE_CONFIGURATION")
    config = configuration[0]
    document = read_document(root / config["path"])
    schema_records = [
        r for r in records if r["restore_path"] == "application/config/installation.schema.json"
    ]
    require(len(schema_records) == 1, "INCOMPLETE_APPLICATION")
    schema = read_document(root / schema_records[0]["path"])
    require(Draft202012Validator(schema).is_valid(document), "INCOMPLETE_CONFIGURATION")
    base = Path(config["source"]).parent
    required = [
        *document["secrets"].values(),
        document["http"]["certificate_file"],
        document["http"]["private_key_file"],
    ]
    require(
        {str(resolve_path(p, base)) for p in required}
        == {r["source"] for r in records if r["kind"] == "private"},
        "INCOMPLETE_CONFIGURATION",
    )
    require(
        str(resolve_path(document["sqlite"]["file"], base)) == private["source"],
        "PROVENANCE_MISMATCH",
    )
    require(
        all(
            any(r["kind"] == k for r in records)
            for k in ("application", "frontend", "static", "runtime")
        ),
        "INCOMPLETE_APPLICATION",
    )
    return records


def verify_migrations(schema, records):
    applied = {tuple(row) for row in schema["migrations"]}
    for app in APP_FOLDERS:
        prefix = f"application/{app}/migrations/"
        expected = {
            (app, PurePosixPath(r["restore_path"]).stem)
            for r in records
            if r["restore_path"].startswith(prefix)
            and r["restore_path"].endswith(".py")
            and PurePosixPath(r["restore_path"]).stem != "__init__"
        }
        require({row for row in applied if row[0] == app} == expected, "MIGRATIONS_MISMATCH")
