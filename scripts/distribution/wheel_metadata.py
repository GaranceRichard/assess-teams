"""Verify the MEP-057 closure and original notices without fetching anything."""

import email
import hashlib
import re
import zipfile

from pip._vendor.packaging.markers import default_environment
from pip._vendor.packaging.requirements import Requirement
from pip._vendor.packaging.specifiers import SpecifierSet
from pip._vendor.packaging.tags import compatible_tags, cpython_tags, parse_tag
from pip._vendor.packaging.utils import canonicalize_name, parse_wheel_filename

ROOTS = {"django", "djangorestframework", "drf-spectacular", "waitress"}
PIN = r"^(\S+)==(\S+) --hash=sha256:([a-f0-9]{64})$"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def pins(text, strict=False):
    if strict:
        require(
            all(re.fullmatch(PIN, line) for line in text.splitlines()),
            "Lock contains an unpinned requirement or an unexpected directive",
        )
    entries = re.findall(PIN, text, re.MULTILINE)
    result = {canonicalize_name(n): (v, h) for n, v, h in entries}
    require(len(entries) == len(result) == 15, "Expected fifteen exact unique pins")
    return result


def rows(path):
    return [
        [cell.strip() for cell in line.strip("|").split("|")]
        for line in path.read_text(encoding="utf-8-sig").splitlines()
        if line.startswith("| ") and not line.startswith("| ---")
    ][1:]


def verify_metadata(path, name, version, notices):
    tags = set(cpython_tags((3, 13), abis=["cp313"], platforms=["win_amd64"]))
    tags.update(compatible_tags((3, 13), interpreter="cp313", platforms=["win_amd64"]))
    wheel_name, wheel_version, _, wheel_tags = parse_wheel_filename(path.name)
    require(wheel_tags & tags, "Incompatible wheel: " + path.name)
    require(
        wheel_name == name and str(wheel_version) == version, "Wheel identity mismatch"
    )
    with zipfile.ZipFile(path) as archive:
        metadata = [n for n in archive.namelist() if n.endswith(".dist-info/METADATA")]
        require(len(metadata) == 1, "Missing or ambiguous METADATA")
        meta = email.message_from_bytes(archive.read(metadata[0]))
        wheel = email.message_from_bytes(archive.read(metadata[0][:-8] + "WHEEL"))
        declared_tags = set()
        for tag in wheel.get_all("Tag", []):
            declared_tags.update(parse_tag(tag))
        require(declared_tags == wheel_tags, "Filename/WHEEL tag mismatch")
        require(canonicalize_name(meta["Name"]) == name, "METADATA name mismatch")
        require(meta["Version"] == version, "METADATA version mismatch")
        require(
            "3.13.17" in SpecifierSet(meta["Requires-Python"]),
            "Requires-Python mismatch",
        )
        expected = [(p, h) for n, p, h in notices if canonicalize_name(n) == name]
        require(expected, "No inventoried notice for " + name)
        for notice, digest in expected:
            require(
                hashlib.sha256(archive.read(notice)).hexdigest() == digest,
                "Notice absent or altered: " + notice,
            )
    return {"version": version, "requires": meta.get_all("Requires-Dist", [])}


def verify_closure(items):
    environment = default_environment()
    environment.update(
        python_version="3.13",
        python_full_version="3.13.17",
        sys_platform="win32",
        platform_system="Windows",
        platform_machine="AMD64",
        os_name="nt",
        extra="",
        implementation_name="cpython",
        platform_python_implementation="CPython",
        implementation_version="3.13.17",
    )
    pending = list(ROOTS)
    visited = set()
    while pending:
        name = pending.pop()
        require(name in items, "Missing required distribution: " + name)
        if name in visited:
            continue
        visited.add(name)
        for raw in items[name]["requires"]:
            dependency = Requirement(raw)
            if dependency.marker and not dependency.marker.evaluate(environment):
                continue
            key = canonicalize_name(dependency.name)
            require(key in items, "Missing transitive dependency: " + key)
            require(
                items[key]["version"] in dependency.specifier,
                "Incompatible transitive version: " + key,
            )
            require(
                not dependency.url and not dependency.extras, "Unexpected URL or extra"
            )
            pending.append(key)
    require(
        visited == set(items), "Unexpected distribution outside the runtime closure"
    )
