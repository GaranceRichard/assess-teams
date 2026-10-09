"""Require every test shard before enforcing the global backend coverage gate."""

import argparse
import json
from pathlib import Path

import coverage
from backend_shards import ROOT, TIMINGS


def validate_shards(directory, count):
    expected = {f".coverage.{index}" for index in range(1, count + 1)}
    if {path.name for path in directory.glob(".coverage.*")} != expected:
        raise ValueError("Missing or unexpected backend coverage shard")
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
        current = manifest["collected"]
        if not current or len(current) != len(set(current)):
            raise ValueError("Empty or duplicate test collection")
        if collected is None:
            collected = set(current)
        if set(current) != collected:
            raise ValueError("Test collections differ between shards")
        selected = manifest["selected"]
        if not selected or len(selected) != len(set(selected)) or executed.intersection(selected):
            raise ValueError("Empty or overlapping backend test shards")
        executed.update(selected)
    if executed != collected:
        raise ValueError("Backend shards do not execute exactly the complete test collection")
    return len(executed)


def combine(directory, config, count):
    total = validate_shards(directory, count)
    cov = coverage.Coverage(config_file=str(config), data_file=".coverage")
    cov.combine(data_paths=[str(directory)], strict=True, keep=True)
    cov.save()
    cov.xml_report(outfile="coverage/backend.xml")
    percent = cov.report(show_missing=True)
    threshold = max(90, cov.get_option("report:fail_under"))
    print(f"Global backend coverage: {percent:.2f}% ({total} tests; required {threshold}%)")
    return 0 if percent >= threshold else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    count = json.loads(TIMINGS.read_text())["shards"]
    return combine(args.directory, ROOT / ".coveragerc", count)


if __name__ == "__main__":
    raise SystemExit(main())
