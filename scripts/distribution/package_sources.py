"""Select production sources from immutable Git objects, never from local data."""

import io
import re
import subprocess

from package_common import ROOT, digest, require


def git(*arguments, binary=False):
    return subprocess.check_output(
        ["git", "-C", str(ROOT), *arguments], text=not binary
    )


def assert_source(sha):
    require(bool(re.fullmatch(r"[a-f0-9]{40}", sha)), "Full source SHA required")
    require(git("rev-parse", "HEAD").strip() == sha, "Source SHA differs from HEAD")
    require(
        not git("status", "--porcelain", "--untracked-files=all").strip(),
        "Uncommitted source refused",
    )
    require(
        all(line.startswith("H ") for line in git("ls-files", "-v").splitlines()),
        "Sparse source refused",
    )
    return git("rev-parse", sha + "^{tree}").strip()


def source_paths(sha):
    paths = git("ls-tree", "-r", "--name-only", sha, "backend", "scripts/operations")
    selected = []
    for name in paths.splitlines():
        if name.startswith("backend/"):
            if re.search(r"(^|/)(tests|development_data)(/|$)", name):
                continue
            if name.endswith(("settings_development.py", "settings_test.py")):
                continue
            if name in (
                "backend/pyproject.toml",
                "backend/requirements-dev.txt",
                "backend/requirements.txt",
            ):
                continue
            require(
                name.endswith((".py", "installation.schema.json"))
                or bool(re.search(r"/(templates|static|locale)/", name)),
                "Unclassified backend resource: " + name,
            )
        selected.append(name)
    require("backend/config/installation.schema.json" in selected, "Missing schema")
    require("backend/config/wsgi.py" in selected, "Missing API")
    return sorted(selected + ["LICENSE", "NOTICE"])


def source_blobs(sha):
    selected = source_paths(sha)
    roots = sorted({path.split("/")[0] for path in selected})
    tree = git("ls-tree", "-r", sha, "--", *roots)
    entries = {}
    for line in tree.splitlines():
        metadata, path = line.split("\t", 1)
        entries[path] = metadata.split()
    for path in selected:
        mode, kind, _ = entries[path]
        require(
            mode in ("100644", "100755") and kind == "blob",
            "Non-regular source refused",
        )
    objects = [entries[path][2] for path in selected]
    result = subprocess.run(
        ["git", "-C", str(ROOT), "cat-file", "--batch"],
        input=("\n".join(objects) + "\n").encode(),
        capture_output=True,
        check=True,
    )
    stream = io.BytesIO(result.stdout)
    blobs = {}
    for path, oid in zip(selected, objects, strict=True):
        actual, kind, size = stream.readline().decode().split()
        require(actual == oid and kind == "blob", "Git object identity mismatch")
        blobs[path] = stream.read(int(size))
        require(stream.read(1) == b"\n", "Incomplete Git object")
    return blobs


def source_records(sha):
    return [
        {"path": path, "sha256": digest(data)}
        for path, data in source_blobs(sha).items()
    ]


def commands(paths):
    return sorted(
        path
        for path in paths
        if "/management/commands/" in path and not path.endswith("/__init__.py")
    )
