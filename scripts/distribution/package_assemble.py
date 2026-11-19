"""Assemble the reusable REFUSED MEP-024 candidate from qualified local inputs."""

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

from package_caddy import verify as verify_caddy
from package_common import (
    BLOCKERS,
    ROOT,
    digest,
    files,
    inventory,
    read_json,
    require,
    write_json,
)
from package_components import component_inventory
from package_inputs import frontend_contract, wheels_contract
from package_sources import assert_source, commands, git, source_blobs, source_records
from package_verify import verify

DOCUMENTS = [
    "operations.md",
    "operations-lifecycle.md",
    "operations-continuity.md",
    "installation-prerequisites.md",
    "configuration/unique-contract.md",
    "configuration/unique-loading.md",
    "frontend-distribution/README.md",
    "python-wheelhouse/protocol.md",
    "distribution-inventory/runtime-i01-report.md",
    "distribution-inventory/python.md",
    "distribution-inventory/python-notices.md",
    "autonomous-package/README.md",
    "autonomous-package/protocol.md",
]


def assemble(sha, frontend, caddy, output):
    tree = assert_source(sha)
    require(not output.exists(), "Package output must be absent")
    require(not output.with_suffix(".zip").exists(), "Archive output must be absent")
    frontend = Path(frontend).resolve()
    caddy = Path(caddy).resolve()
    web_manifest = frontend_contract(frontend, sha)
    wheelhouse = ROOT / "distribution/python/ref-win-01"
    wheels = wheels_contract(wheelhouse)
    caddy_manifest = verify_caddy(caddy)
    records = source_records(sha)
    output.mkdir(parents=True)
    blobs = source_blobs(sha)
    for record in records:
        path = record["path"]
        target = output / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(blobs[path])
    shutil.copytree(frontend, output / "web")
    shutil.copytree(wheelhouse, output / "python")
    shutil.copytree(caddy, output / "hosting/caddy")
    for name in DOCUMENTS:
        source = ROOT / "docs/operations" / name
        target = output / "documentation" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(
            git("show", sha + ":" + source.relative_to(ROOT).as_posix(), binary=True)
        )
    verification = output / "verification"
    verification.mkdir()
    verification.joinpath("verify-package.ps1").write_bytes(
        git("show", sha + ":scripts/distribution/verify-package.ps1", binary=True)
    )
    output.joinpath("REFUSED.txt").write_text(
        "INCOMPLETE - NOT INSTALLABLE\n" + BLOCKERS[0] + "\n"
        "No runtime is included. No installation is authorized.\n"
        "I02: qualified rebuilt Swagger only. I03: Windows Server/MESS unqualified.\n",
        encoding="utf-8",
    )
    manifest = {
        "format": 1,
        "product": "assess-teams",
        "version": read_json(ROOT / "package.json")["version"],
        "profile": "REF-WIN-01",
        "sourceCommit": sha,
        "sourceTree": tree,
        "installable": False,
        "runtime": None,
        "blockers": BLOCKERS,
        "targetRequires": [],
        "sourceFiles": records,
        "entrypoints": commands(e["path"] for e in records),
        "api": "backend/config/wsgi.py:application",
        "migrations": "backend/*/migrations",
        "inputs": {
            "frontendManifestSha256": digest((frontend / "manifest.json").read_bytes()),
            "frontendPayloadSha256": web_manifest["payloadSha256"],
            "caddyManifestSha256": digest((caddy / "manifest.json").read_bytes()),
        },
        "components": component_inventory(web_manifest, wheels, caddy_manifest),
        "limitations": [
            "I01 runtime absent",
            "I03 no Server/MESS qualification",
            "Django/DRF statics retained in original wheels; installation not performed",
            "Future service/backup/recovery tools require reassembly after delivery",
        ],
        "files": inventory(output),
    }
    write_json(output / "manifest.json", manifest)
    manifest_sha = digest((output / "manifest.json").read_bytes())
    verify(output, manifest_sha, sha, integrity_only=True)
    assert_source(sha)
    archive_path = output.with_suffix(".zip")
    with zipfile.ZipFile(
        archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
    ) as archive:
        for path in files(output):
            member = zipfile.ZipInfo(
                path.relative_to(output).as_posix(), (1980, 1, 1, 0, 0, 0)
            )
            member.compress_type = zipfile.ZIP_DEFLATED
            member.external_attr = 0o100644 << 16
            archive.writestr(member, path.read_bytes(), compresslevel=9)
    with zipfile.ZipFile(archive_path) as archive:
        require(
            set(archive.namelist())
            == {p.relative_to(output).as_posix() for p in files(output)},
            "ZIP inventory mismatch",
        )
        for path in files(output):
            require(
                archive.read(path.relative_to(output).as_posix()) == path.read_bytes(),
                "ZIP copy mismatch",
            )
    receipt = {
        "sourceCommit": sha,
        "status": "REFUSED_I01",
        "installable": False,
        "manifestSha256": manifest_sha,
        "fileCount": len(manifest["files"]),
        "archiveSha256": digest(archive_path.read_bytes()),
        "archiveBytes": archive_path.stat().st_size,
    }
    write_json(output.with_suffix(".receipt.json"), receipt)
    return receipt


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True)
    parser.add_argument("--frontend", type=Path, required=True)
    parser.add_argument("--caddy", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = assemble(args.source, args.frontend, args.caddy, args.output.resolve())
        print(result)
        print("ASSEMBLED PARTIAL ONLY; FINAL DISTRIBUTION REFUSED (I01)")
    except (ValueError, OSError, KeyError) as error:
        print("REFUS " + str(error), file=sys.stderr)
        sys.exit(1)
