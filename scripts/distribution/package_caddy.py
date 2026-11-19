"""Prepare pinned Caddy and original third-party notices on the build host."""

import argparse
import base64
import hashlib
import io
import re
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from package_common import (
    ROOT,
    digest,
    inventory,
    read_json,
    require,
    safe_path,
    write_json,
)
from wheel_metadata import rows

DOCS = ROOT / "docs/operations/distribution-inventory"
EXE_HASH = "2622e239c79df700b0eb92cbd950d1edee365e155a7859f358f0e55f002df591"
GO_HASH = "911f8f5782931320f5b8d1160a76365b83aea6447ee6c04fa6d5591467db9dad"


def escape(value):
    return "".join("!" + c.lower() if c.isupper() else c for c in value)


def acquire(cache, url, fetch):
    path = cache / digest(url.encode())
    if not path.exists():
        require(fetch, "Missing preparation cache: " + url)
        with urllib.request.urlopen(url, timeout=90) as response:
            data = response.read()
        path.write_bytes(data)
    return path.read_bytes()


def module_notice(row, cache, fetch, output):
    name, version, expected, license_id, notices = row
    url = "https://proxy.golang.org/" + escape(name) + "/@v/" + escape(version) + ".zip"
    data = acquire(cache, url, fetch)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = sorted(n for n in archive.namelist() if not n.endswith("/"))
        stream = "".join(digest(archive.read(n)) + "  " + n + "\n" for n in entries)
        actual = (
            "h1:" + base64.b64encode(hashlib.sha256(stream.encode()).digest()).decode()
        )
        require(actual == expected, "Caddy module h1 mismatch: " + name)
        # Go ZIP paths retain module spelling (the URL alone is escaped).
        prefix = entries[0].split("@", 1)[0] + "@" + version + "/"
        expected_notices = re.findall(r"([^ ,;]+): ([a-f0-9]{64})", notices)
        require(expected_notices, "Unattributed Caddy module")
        for file, sha in expected_notices:
            require(
                digest(archive.read(prefix + file)) == sha,
                "Original module notice mismatch: " + name,
            )
        selected = [
            n
            for n in entries
            if re.match(
                r"(?i)^(licen[cs]e|copying|notice)([.\\-]|$)", n.rsplit("/", 1)[-1]
            )
        ]
        records = []
        for n in selected:
            relative = "legal/" + name.replace("/", "_") + "/" + n[len(prefix) :]
            safe_path(relative)
            target = output / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(archive.read(n))
            records.append({"path": relative, "sha256": digest(target.read_bytes())})
    return {
        "name": name,
        "version": version,
        "origin": url,
        "license": license_id,
        "goH1": expected,
        "archiveSha256": digest(data),
        "notices": records,
    }


def prepare(cache, output, fetch=False):
    require(not output.exists(), "Caddy output must be absent")
    cache.mkdir(parents=True, exist_ok=True)
    output.mkdir(parents=True)
    artifacts = rows(DOCS / "artifacts.md")
    selected = [r for r in artifacts if r[0].startswith("caddy_")]
    origins = []
    for name, link, sha in selected:
        url = re.search(r"\((https:[^)]+)\)", link).group(1)
        data = acquire(cache, url, fetch)
        require(digest(data) == sha, "Caddy upstream aggregate mismatch")
        (output / name).write_bytes(data)
        origins.append({"file": name, "origin": url, "sha256": sha})
        if name.endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                for member in ("caddy.exe", "LICENSE"):
                    (output / member).write_bytes(archive.read(member))
    require(
        digest((output / "caddy.exe").read_bytes()) == EXE_HASH,
        "Unqualified Caddy executable",
    )
    url = "https://raw.githubusercontent.com/golang/go/go1.27.3/LICENSE"
    data = acquire(cache, url, fetch)
    require(digest(data) == GO_HASH, "Go license mismatch")
    (output / "Go-LICENSE").write_bytes(data)
    modules = rows(DOCS / "caddy-modules.md")
    require(len(modules) == 148, "Incomplete Caddy module inventory")
    with ThreadPoolExecutor(max_workers=4) as pool:
        components = list(
            pool.map(lambda row: module_notice(row, cache, fetch, output), modules)
        )
    manifest = {
        "version": "2.11.9",
        "goVersion": "go1.27.3",
        "origins": origins,
        "components": components,
        "files": inventory(output),
    }
    write_json(output / "manifest.json", manifest)
    verify(output)
    return manifest


def verify(output):
    manifest = read_json(output / "manifest.json")
    require(manifest["version"] == "2.11.9", "Caddy version mismatch")
    require(manifest["files"] == inventory(output), "Caddy missing/altered file")
    require(
        digest((output / "caddy.exe").read_bytes()) == EXE_HASH,
        "Caddy executable mismatch",
    )
    require(
        digest((output / "Go-LICENSE").read_bytes()) == GO_HASH, "Go license mismatch"
    )
    require(manifest["goVersion"] == "go1.27.3", "Caddy Go runtime mismatch")
    require(
        digest((output / "LICENSE").read_bytes())
        == "cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30",
        "Caddy license mismatch",
    )
    origins = []
    for filename, link, sha in rows(DOCS / "artifacts.md"):
        if filename.startswith("caddy_"):
            origins.append(
                {
                    "file": filename,
                    "origin": re.search(r"\((https:[^)]+)\)", link)[1],
                    "sha256": sha,
                }
            )
            require(
                digest((output / filename).read_bytes()) == sha,
                "Caddy aggregate missing or altered",
            )
    require(manifest["origins"] == origins, "Caddy origins mismatch")
    canonical = rows(DOCS / "caddy-modules.md")
    require(
        len(manifest["components"]) == len(canonical) == 148, "Missing Caddy component"
    )
    for item, row in zip(manifest["components"], canonical, strict=True):
        require(
            [item["name"], item["version"], item["goH1"], item["license"]] == row[:4],
            "Caddy provenance mismatch",
        )
        url = (
            "https://proxy.golang.org/"
            + escape(row[0])
            + "/@v/"
            + escape(row[1])
            + ".zip"
        )
        require(item["origin"] == url, "Caddy module origin mismatch")
        require(item["notices"], "Missing Caddy notices")
        for file, sha in re.findall(r"([^ ,;]+): ([a-f0-9]{64})", row[4]):
            path = "legal/" + item["name"].replace("/", "_") + "/" + file
            require(
                digest((output / path).read_bytes()) == sha,
                "Missing original Caddy license",
            )
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--fetch", action="store_true")
    args = parser.parse_args()
    prepare(args.cache.resolve(), args.output.resolve(), args.fetch)
