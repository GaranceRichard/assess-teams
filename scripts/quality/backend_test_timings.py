"""Refresh file weights from complete pytest JUnit reports (including setup/teardown)."""

import argparse
import json
from pathlib import Path
from xml.etree import ElementTree

from backend_shards import TIMINGS


def file_durations(reports):
    durations = {}
    for report in reports:
        for case in ElementTree.parse(report).iter("testcase"):
            if case.find("failure") is not None or case.find("error") is not None:
                raise ValueError("Use successful runs to refresh shard weights")
            filename = "/".join(case.attrib["classname"].split(".")[:2]) + ".py"
            durations[filename] = durations.get(filename, 0) + float(case.attrib["time"])
    return {filename: round(seconds, 3) for filename, seconds in sorted(durations.items())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reports", nargs="+", type=Path)
    parser.add_argument("--source", required=True, help="Run ID or description of the measurement")
    args = parser.parse_args()
    TIMINGS.write_text(
        json.dumps(
            {"shards": 2, "source": args.source, "seconds": file_durations(args.reports)}, indent=2
        )
        + "\n"
    )


if __name__ == "__main__":
    main()
