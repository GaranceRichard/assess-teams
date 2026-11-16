"""Resolve paths without creating directories, databases or private files."""

import os
from pathlib import Path, PureWindowsPath

from django.core.exceptions import ImproperlyConfigured


def invalid_path():
    raise ImproperlyConfigured(
        "Configuration: chemin ambigu, collision ou destination interdite."
    ) from None


def resolve_path(value, base):
    if not isinstance(value, str) or not value.strip():
        invalid_path()
    windows = PureWindowsPath(value)
    if (
        any(marker in value for marker in ("\x00", "%", "$", "~", "://"))
        or (windows.drive and not windows.root)
        or (windows.root and not windows.drive and (os.name == "nt" or value.startswith("\\")))
        or (":" in value and not windows.drive)
        or (os.name != "nt" and windows.drive)
    ):
        invalid_path()
    try:
        path = Path(value.replace("\\", "/"))
        return (path if path.is_absolute() else base / path).resolve()
    except (OSError, ValueError, RuntimeError):
        invalid_path()


def selected_file(value):
    if not value or not Path(value).is_absolute():
        raise ImproperlyConfigured(
            "ASSESS_CONFIG_FILE: chemin absolu explicite requis en production."
        )
    return resolve_path(value, Path.cwd())


def overlaps(first, second):
    return first == second or first in second.parents or second in first.parents


def validate_local_database(path):
    synchronized = {"onedrive", "dropbox", "google drive", "googledrive", "iclouddrive"}
    if str(path).startswith(("\\\\", "//")) or any(
        part.casefold() in synchronized or part.casefold().startswith("onedrive - ")
        for part in path.parts
    ):
        invalid_path()
    for name in ("OneDrive", "OneDriveConsumer", "OneDriveCommercial"):
        if os.environ.get(name) and overlaps(path, Path(os.environ[name]).resolve()):
            invalid_path()
    if os.name == "nt":
        import ctypes

        if ctypes.windll.kernel32.GetDriveTypeW(str(path.anchor)) == 4:
            invalid_path()


def resolve_paths(document, base):
    paths = document["paths"]
    for key, value in paths.items():
        paths[key] = resolve_path(value, base)
    directories = list(paths.values())
    for index, path in enumerate(directories):
        if path in directories[:index] or (path.exists() and not path.is_dir()):
            invalid_path()
    protected = [paths[key] for key in ("releases", "runtime", "frontend", "static")]
    if any(
        overlaps(paths["runtime"], paths[key]) for key in ("releases", "frontend", "static")
    ) or overlaps(paths["frontend"], paths["static"]):
        invalid_path()
    persistent = [paths[key] for key in ("data", "logs", "tmp", "backups")]
    for index, path in enumerate(persistent):
        if any(overlaps(path, other) for other in protected + persistent[:index]):
            invalid_path()
    files = [document.pop("_source")]
    for section, keys in (
        ("sqlite", ("file",)),
        ("http", ("certificate_file", "private_key_file")),
        ("secrets", tuple(document["secrets"])),
    ):
        for key in keys:
            path = resolve_path(document[section][key], base)
            document[section][key] = path
            if (
                any(overlaps(path, other) for other in files)
                or any(path == directory or path in directory.parents for directory in directories)
                or (path.exists() and not path.is_file())
            ):
                invalid_path()
            files.append(path)
    database = document["sqlite"]["file"]
    if paths["data"] not in database.parents:
        invalid_path()
    validate_local_database(database)
    private = files[2:]
    source_root = Path(__file__).resolve().parents[2]
    if any(overlaps(path, root) for path in private for root in [*protected, source_root]):
        invalid_path()
