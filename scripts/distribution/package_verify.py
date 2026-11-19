"""Verify a copied partial candidate; never authorize a runtime or installation."""

import argparse
import re
import subprocess
import sys
from pathlib import Path

from package_caddy import verify as verify_caddy
from package_common import (
    BLOCKERS,
    ROOT,
    digest,
    inventory,
    read_json,
    require,
    safe_path,
    scan,
)
from package_components import component_inventory
from package_inputs import frontend_contract, wheels_contract
from package_sources import commands, git, source_records


def verify(directory, expected_sha256, source_sha, integrity_only=False):
    directory = Path(directory).resolve()
    manifest_path = directory / "manifest.json"
    require(
        digest(manifest_path.read_bytes()) == expected_sha256,
        "External manifest SHA-256 mismatch",
    )
    manifest = read_json(manifest_path)
    require(
        manifest["format"] == 1 and manifest["product"] == "assess-teams",
        "Unknown package format",
    )
    require(
        manifest["sourceCommit"] == source_sha
        and re.fullmatch(r"[a-f0-9]{40}", source_sha),
        "Source SHA mismatch",
    )
    require(manifest["profile"] == "REF-WIN-01", "Wrong target profile")
    require(
        manifest["version"] == read_json(ROOT / "package.json")["version"],
        "Application version mismatch",
    )
    require(
        manifest["runtime"] is None
        and manifest["installable"] is False
        and manifest["blockers"] == BLOCKERS,
        "Unqualified runtime refused (I01)",
    )
    require(manifest["targetRequires"] == [], "Network/Node/Docker requirement refused")
    require(
        manifest["files"] == inventory(directory), "Missing or altered package file"
    )
    expected_sources = source_records(source_sha)
    require(manifest["sourceFiles"] == expected_sources, "Source inventory mismatch")
    for entry in manifest["sourceFiles"]:
        path = safe_path(entry["path"])
        require(
            digest((directory / path).read_bytes()) == entry["sha256"],
            "Packaged source differs from Git SHA",
        )
    require(
        manifest["sourceTree"] == git("rev-parse", source_sha + "^{tree}").strip(),
        "Git source tree mismatch",
    )
    require(
        manifest["entrypoints"] == commands(e["path"] for e in expected_sources),
        "Production command missing",
    )
    frontend = frontend_contract(directory / "web", source_sha)
    require(
        digest((directory / "web/manifest.json").read_bytes())
        == manifest["inputs"]["frontendManifestSha256"],
        "Frontend receipt mismatch",
    )
    wheels = wheels_contract(directory / "python")
    require(len(wheels) == 15, "Incomplete wheel closure")
    caddy = verify_caddy(directory / "hosting/caddy")
    require(
        manifest["components"] == component_inventory(frontend, wheels, caddy),
        "Incomplete component provenance",
    )
    registered = {e["path"] for e in expected_sources}
    for entry in manifest["files"]:
        if entry["path"].endswith((".py", ".ps1")):
            require(
                entry["path"] in registered
                or entry["path"] == "verification/verify-package.ps1",
                "Unregistered executable source",
            )
        scan(directory / entry["path"], entry["path"])
    # This additionally rejects external executable HTML/CSS resources even if resealed.
    for path in (directory / "web").rglob("*"):
        if path.suffix in (".html", ".css"):
            text = path.read_text(encoding="utf-8")
            require(
                not re.search(
                    r"""(?:src\s*=|@import\s*|url\s*\()\s*["']?\s*(?:https?:)?//""",
                    text,
                    re.IGNORECASE,
                ),
                "Required CDN resource refused",
            )
    if not integrity_only:
        raise ValueError("REFUSED: " + BLOCKERS[0])
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--manifest-sha256", required=True)
    parser.add_argument("--source", required=True)
    parser.add_argument("--integrity-only", action="store_true")
    args = parser.parse_args()
    try:
        manifest = verify(
            args.directory, args.manifest_sha256, args.source, args.integrity_only
        )
        print(f"PASS partial integrity: {len(manifest['files'])} files; I01 OPEN")
    except (
        ValueError,
        OSError,
        KeyError,
        TypeError,
        subprocess.CalledProcessError,
    ) as error:
        print("REFUS " + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
