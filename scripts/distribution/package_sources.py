"""Select production sources from immutable Git objects, never from local data."""

import io
import re
import subprocess
import tarfile

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
    data = git("archive", "--format=tar", sha, "--", *roots, binary=True)
    result = {}
    with tarfile.open(fileobj=io.BytesIO(data)) as archive:
        for path in selected:
            member = archive.getmember(path)
            require(member.isfile(), "Non-regular source refused")
            result[path] = archive.extractfile(member).read()
    return result


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
