"""Export license evidence for the Python packages actually redistributed."""

import argparse
import hashlib
import json
import re
from importlib import metadata
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]


def normalized(name):
    return re.sub(r"[-_.]+", "-", name).lower()


def runtime_distributions(requirements):
    from packaging.requirements import Requirement

    pending = [Requirement(line) for line in requirements.splitlines() if line.strip()]
    found = {}
    while pending:
        requirement = pending.pop()
        if requirement.marker and not requirement.marker.evaluate({"extra": ""}):
            continue
        name = normalized(requirement.name)
        if name in found:
            continue
        distribution = metadata.distribution(requirement.name)
        if requirement.specifier and distribution.version not in requirement.specifier:
            raise ValueError(f"Incompatible version : {requirement}")
        found[name] = distribution
        pending.extend(Requirement(value) for value in distribution.requires or [])
    return sorted(found.values(), key=lambda item: item.metadata["Name"].lower())


def component(distribution):
    notices = []
    for file in distribution.files or []:
        if re.match(
            r"^(licen[sc]e|copying|notice|authors)([.-]|$)",
            Path(str(file)).name,
            re.IGNORECASE,
        ):
            if Path(str(file)).is_absolute() or ".." in Path(str(file)).parts:
                raise ValueError(f"Unsafe notice path : {file}")
            path = Path(distribution.locate_file(file))
            if not path.is_file():
                raise ValueError(f"Missing notice : {file}")
            content = path.read_bytes()
            notices.append(
                {
                    "file": str(file),
                    "sha256": hashlib.sha256(content).hexdigest(),
                    "content": content,
                }
            )
    if not any(
        re.match(r"^(licen[sc]e|copying)", Path(n["file"]).name, re.IGNORECASE)
        for n in notices
    ):
        raise ValueError(f"Missing license text : {distribution.metadata['Name']}")
    license_id = distribution.metadata.get("License-Expression")
    if not license_id:
        license_id = distribution.metadata.get("License") or "See bundled license texts"
    return {
        "name": distribution.metadata["Name"],
        "version": distribution.version,
        "license": license_id,
        "notices": notices,
    }


def export(distributions, destination):
    components = [component(distribution) for distribution in distributions]
    destination.mkdir(parents=True, exist_ok=True)
    with ZipFile(destination / "notices.zip", "w") as archive:
        for item in components:
            for notice in item["notices"]:
                archive.writestr(
                    normalized(item["name"]) + "/" + notice["file"],
                    notice.pop("content"),
                )
        document = json.dumps(components, indent=2, ensure_ascii=False) + "\n"
        archive.writestr("inventory.json", document.encode("utf-8"))
    (destination / "inventory.json").write_text(document, encoding="utf-8")
    return components


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--include-dev", action="store_true")
    args = parser.parse_args()
    distributions = (
        sorted(metadata.distributions(), key=lambda d: d.metadata["Name"].lower())
        if args.include_dev
        else runtime_distributions(
            (ROOT / "backend/requirements.txt").read_text(encoding="utf-8")
        )
    )
    destination = ROOT / "build/legal/python"
    components = export(distributions, destination)
    print(f"Notices Python : {len(components)} composants dans {destination}")


if __name__ == "__main__":
    main()
