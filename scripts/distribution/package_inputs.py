"""Consume the MEP-058/059 contracts without replacing their verifiers."""

import subprocess
from pathlib import Path

from package_common import ROOT, digest, read_json, require
from package_sources import git
from python_wheelhouse import verify as verify_wheels


def frontend_contract(frontend, sha):
    subprocess.run(
        ["node", str(ROOT / "scripts/distribution/verify.mjs"), str(frontend)],
        check=True,
        capture_output=True,
        text=True,
    )
    manifest = read_json(Path(frontend) / "manifest.json")
    require(manifest["sourceCommit"] == sha, "Frontend source SHA mismatch")
    tracked = set(git("ls-files").splitlines())
    for group in ("sourceInputs", "preparationInputs"):
        for item in manifest[group]:
            path = ROOT / item["path"]
            require(path.is_file() and not path.is_symlink(), "Missing frontend input")
            require(
                digest(path.read_bytes()) == item["sha256"],
                "Frontend input differs from source: " + item["path"],
            )
            # Working bytes can contain CRLF; Git confirms the file is tracked.
            require(item["path"] in tracked, "Untracked frontend input")
    return manifest


def wheels_contract(path):
    return verify_wheels(Path(path))
