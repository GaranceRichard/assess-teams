"""Require every test shard before enforcing the global backend coverage gate."""

import argparse
import json
from pathlib import Path
from xml.etree import ElementTree

import coverage
from backend_shards import ROOT, TIMINGS
from coverage.exceptions import CoverageException


def validate_shards(directory, count):
    expected = {f".coverage.{index}" for index in range(1, count + 1)}
    if {path.name for path in directory.glob(".coverage.*")} != expected:
        raise ValueError("Missing or unexpected backend coverage shard")
    for prefix, suffix in (
        ("manifest-", ".json"),
        ("junit-", ".xml"),
        ("coverage-version-", ".txt"),
    ):
        expected = {f"{prefix}{index}{suffix}" for index in range(1, count + 1)}
        if {path.name for path in directory.glob(f"{prefix}*{suffix}")} != expected:
            raise ValueError("Missing or unexpected backend shard evidence")
    collected = None
    executed = set()
    for index in range(1, count + 1):
        manifest = json.loads((directory / f"manifest-{index}.json").read_text())
        if manifest["shard"] != index or manifest["count"] != count:
            raise ValueError("Invalid shard identity")
        if manifest.get("exit_code") != 0:
            raise ValueError("Backend test shard did not complete successfully")
        if manifest["coverage_version"] != coverage.__version__:
            raise ValueError("Coverage versions differ between shards and merger")
        version = (directory / f"coverage-version-{index}.txt").read_text().strip()
        if version != f"coverage=={coverage.__version__}":
            raise ValueError("Invalid coverage version evidence")
        current = manifest["collected"]
        if not current or len(current) != len(set(current)):
            raise ValueError("Empty or duplicate test collection")
        if collected is None:
            collected = set(current)
        if set(current) != collected:
            raise ValueError("Test collections differ between shards")
        selected = manifest["selected"]
        if (
            not selected
            or len(selected) != len(set(selected))
            or executed.intersection(selected)
        ):
            raise ValueError("Empty or overlapping backend test shards")
        cases = list(
            ElementTree.parse(directory / f"junit-{index}.xml").iter("testcase")
        )
        if len(cases) != len(selected) or any(
            case.find(tag) is not None
            for case in cases
            for tag in ("failure", "error", "skipped")
        ):
            raise ValueError("Incomplete or unsuccessful backend JUnit evidence")
        executed.update(selected)
    if executed != collected:
        raise ValueError(
            "Backend shards do not execute exactly the complete test collection"
        )
    return len(executed)


def validate_coverage_files(directory, count):
    for index in range(1, count + 1):
        path = directory / f".coverage.{index}"
        if not path.stat().st_size:
            raise ValueError(f"Empty backend coverage shard {index}")
        data = coverage.CoverageData(basename=str(path))
        try:
            data.read()
            if not data.has_arcs() or not any(
                data.arcs(name) for name in data.measured_files()
            ):
                raise ValueError(f"Empty or non-branch backend coverage shard {index}")
        except CoverageException as error:
            raise ValueError(f"Unreadable backend coverage shard {index}") from error


def combine(directory, config, count):
    total = validate_shards(directory, count)
    validate_coverage_files(directory, count)
    cov = coverage.Coverage(config_file=str(config), data_file=".coverage")
    cov.combine(data_paths=[str(directory)], strict=True, keep=True)
    cov.save()
    cov.xml_report(outfile="coverage/backend.xml")
    percent = cov.report(show_missing=True)
    threshold = max(90, cov.get_option("report:fail_under"))
    print(
        f"Global backend coverage: {percent:.2f}% ({total} tests; required {threshold}%)"
    )
    return 0 if percent >= threshold else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    count = json.loads(TIMINGS.read_text())["shards"]
    return combine(args.directory, ROOT / ".coveragerc", count)


if __name__ == "__main__":
    raise SystemExit(main())
