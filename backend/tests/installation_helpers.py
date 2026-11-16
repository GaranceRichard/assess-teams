"""Fictitious installation files and generated private values, never printed."""

import atexit
import json
import os
import re
import secrets
from pathlib import Path
from tempfile import TemporaryDirectory

DIRECTORIES = []


def startup_audit():
    # atexit is LIFO: later application callbacks remain guarded. The pre-existing
    # coverage callback runs after this sentinel has finished observing startup.
    return """
import atexit, sys
audit_active = [True]
atexit.register(audit_active.clear)
def audit(event, arguments):
    if audit_active and event in {
        'sqlite3.connect', 'socket.connect', 'os.mkdir', 'os.remove', 'os.rename'
    }:
        raise AssertionError('UNEXPECTED_EFFECT')
sys.addaudithook(audit)
"""


def markdown_json(name):
    folder = Path(__file__).resolve().parents[2] / "docs/operations/configuration"
    text = (folder / name).read_text(encoding="utf-8-sig")
    return json.loads(re.search(r"```json\n(.*?)\n```", text, re.S)[1])


def installation_file(root=None):
    if root is None:
        directory = TemporaryDirectory(prefix="assess-config-")
        DIRECTORIES.append(directory)
        root = Path(directory.name)
    root = Path(root)
    document = markdown_json("unique-examples.md")
    document["paths"] = {key: str(root / key) for key in document["paths"]}
    document["paths"]["frontend"] = str(root / "releases/reference/frontend")
    document["paths"]["static"] = str(root / "releases/reference/static")
    document["sqlite"]["file"] = "data/assess.sqlite3"
    system_temp = Path(os.environ["LOCALAPPDATA"]) / "Temp" if os.name == "nt" else Path("/tmp")
    directory = TemporaryDirectory(prefix="assess-config-private-", dir=system_temp)
    DIRECTORIES.append(directory)
    private = Path(directory.name)
    document["http"].update(
        origin="https://assess.example",
        certificate_file=str(private / "reference.crt"),
        private_key_file=str(private / "reference.key"),
    )
    document["secrets"]["django_key_file"] = os.path.relpath(private / "django.key", root)
    (root / "tmp").mkdir(exist_ok=True)
    (private / "django.key").write_text(secrets.token_urlsafe(64), encoding="utf-8")
    source = root / "instance.json"
    source.write_text(json.dumps(document), encoding="utf-8")
    return source


def private_file(source, filename):
    source = Path(source)
    document = json.loads(source.read_text("utf-8"))
    return (source.parent / document["secrets"]["django_key_file"]).resolve().with_name(filename)


def change_document(source, dotted, value, remove=False):
    source = Path(source)
    document = json.loads(source.read_text("utf-8"))
    target = document
    keys = dotted.split(".")
    for key in keys[:-1]:
        target = target[key]
    if remove:
        target.pop(keys[-1], None)
    else:
        target[keys[-1]] = value
    source.write_text(json.dumps(document), encoding="utf-8")


def provision_database(source, database):
    source, database = Path(source), Path(database).resolve()
    document = json.loads(source.read_text("utf-8"))
    if document["sqlite"]["file"] == str(database):
        return
    document["paths"]["data"] = str(database.parent)
    document["sqlite"]["file"] = str(database)
    source.write_text(json.dumps(document), encoding="utf-8")


def cleanup():
    for directory in DIRECTORIES:
        directory.cleanup()


atexit.register(cleanup)
