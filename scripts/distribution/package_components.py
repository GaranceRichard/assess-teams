"""Trace included components without inventing product versions."""

import re

from package_common import ROOT, require


def component_inventory(frontend, wheels, caddy):
    """No implicit releases: use existing product and inventory versions."""
    text = (ROOT / "docs/operations/distribution-inventory/python.md").read_text(
        encoding="utf-8"
    )
    python = []
    from wheel_metadata import rows

    for row in rows(ROOT / "docs/operations/distribution-inventory/python.md"):
        if len(row) != 5:
            continue
        name, version, _, license_id, _ = row
        if name.lower().replace("_", "-") not in wheels:
            continue
        # Match by the locked hash, not by a guessed spelling of the project.
        sha = wheels[name.lower().replace("_", "-")][1]
        match = re.search(
            r"^\| (\S+\.whl) \| \[PyPI\]\(([^)]+)\) \| " + sha + r" \|$",
            text,
            re.MULTILINE,
        )
        require(match is not None, "Missing wheel origin")
        python.append(
            {
                "name": name,
                "version": version,
                "license": license_id,
                "origin": match[2],
                "destination": "python/wheels/" + match[1],
                "sha256": sha,
                "notices": "original .dist-info notices in wheel",
            }
        )
    return [
        {
            "name": "Assess Teams backend",
            "version": frontend["version"],
            "origin": "sourceCommit",
            "destination": "backend",
            "license": "Apache-2.0",
            "notices": ["LICENSE", "NOTICE"],
        },
        {
            "name": "normal frontend / Swagger",
            "version": frontend["version"],
            "origin": "web/manifest.json",
            "destination": "web",
            "notices": ["web/frontend/legal", "web/static/swagger-ui/legal"],
            "swaggerVersion": frontend["swagger"]["version"],
        },
        *python,
        {
            "name": "Caddy",
            "version": caddy["version"],
            "destination": "hosting/caddy",
            "origin": caddy["origins"],
            "license": "Apache-2.0",
            "notices": "hosting/caddy/manifest.json",
            "moduleCount": 148,
        },
        {
            "name": "Windows Task Scheduler",
            "version": "host supplied",
            "destination": None,
            "redistributed": False,
            "origin": "REF-WIN-01 host",
        },
    ]
