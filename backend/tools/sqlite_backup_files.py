"""Private file inventory, frozen inputs and safe paths for O07."""

import hashlib
import json
import os
import shutil
from pathlib import Path

APP_FOLDERS = ("assessments", "config", "identities", "journals", "notifications", "teams", "tools")


class BackupError(Exception):
    """Only fixed diagnostic codes may escape the operator boundary."""


def require(condition, code):
    if not condition:
        raise BackupError(code)


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode()


def fingerprint(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def write_json(path, value):
    with path.open("xb") as stream:
        stream.write(canonical(value) + b"\n")


def regular(path):
    require(not path.is_symlink() and not path.is_junction(), "UNSAFE_PATH")
    require(path.is_file(), "MISSING_FILE")
    require(not any(p.is_symlink() or p.is_junction() for p in path.parents), "UNSAFE_PATH")


def tree_files(root):
    require(root.is_dir(), "MISSING_DIRECTORY")
    require(not root.is_symlink() and not root.is_junction(), "UNSAFE_PATH")
    result = []
    for path in sorted(root.rglob("*")):
        require(not path.is_symlink() and not path.is_junction(), "UNSAFE_PATH")
        if path.is_file():
            regular(path)
            result.append(path)
        else:
            require(path.is_dir(), "UNSAFE_PATH")
    return result


def application_files(root):
    result = [root / "manage.py"]
    requirements = root / "requirements.txt"
    if requirements.exists():
        result.append(requirements)
    for folder in APP_FOLDERS:
        result.extend(
            p
            for p in tree_files(root / folder)
            if "__pycache__" not in p.parts and p.suffix in {".py", ".json"}
        )
    return sorted(result)


def inventory(settings, extras, application):
    document = settings["INSTALLATION"]
    sources = [("configuration", settings["INSTALLATION_CONFIG_FILE"])]
    sources.extend(("private", p) for p in document["secrets"].values())
    sources.extend(
        ("private", document["http"][k]) for k in ("certificate_file", "private_key_file")
    )
    sources.extend(("required", Path(p).absolute()) for p in extras)
    result = []
    for index, (kind, path) in enumerate(sources):
        result.append((kind, path, f"private/{index:04d}"))
    for kind, root in [
        ("application", application),
        *((k, document["paths"][k]) for k in ("frontend", "static", "runtime")),
    ]:
        paths = application_files(root) if kind == "application" else tree_files(root)
        require(bool(paths), "MISSING_FILE")
        result.extend((kind, p, f"{kind}/{p.relative_to(root).as_posix()}") for p in paths)
    database = document["sqlite"]["file"]
    for _, path, _ in result:
        regular(path)
        require(
            not path.samefile(database) and not path.name.endswith(("-wal", "-shm", "-journal")),
            "ACTIVE_FILE_REFUSED",
        )
    return result


def capture_files(root, inputs):
    records = []
    for index, (kind, source, restore_path) in enumerate(inputs):
        name = f"files/{index:05d}"
        before = digest(source)
        target = root / name
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        with source.open("rb") as reader, target.open("xb") as writer:
            shutil.copyfileobj(reader, writer)
        require(before == digest(target) == digest(source), "INPUT_CHANGED")
        records.append(
            dict(
                kind=kind,
                path=name,
                restore_path=restore_path,
                source=str(source),
                size=target.stat().st_size,
                sha256=before,
            )
        )
    return records


def check_frozen(inputs, records):
    require(
        [name for _, _, name in inputs] == [r["restore_path"] for r in records], "INPUT_CHANGED"
    )
    for (_, source, _), record in zip(inputs, records, strict=True):
        regular(source)
        require(digest(source) == record["sha256"], "INPUT_CHANGED")


def private_root(path, confirmed):
    require(confirmed, "PRIVATE_STORAGE_REQUIRED")
    require(path.is_dir(), "MISSING_DIRECTORY")
    require(not path.is_symlink() and not path.is_junction(), "UNSAFE_PATH")
    if os.name != "nt":
        require(path.stat().st_mode & 0o077 == 0, "PRIVATE_STORAGE_REQUIRED")
