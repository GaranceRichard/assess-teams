"""Run from backend: python -m tools.sqlite_concurrency --output report.jsonl."""

import argparse
import json
import platform
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from tempfile import TemporaryDirectory

from tools.sqlite_load import load
from tools.sqlite_probe import probe


def measure(directory, repeats):
    rows = []
    for repeat in range(repeats):
        for journal in ("DELETE", "WAL"):
            for timeout in (0.1, 1, 5):
                for scenario in (
                    "writer_waits",
                    "writer_times_out",
                    "read_during_write",
                    "reader_blocks_commit",
                ):
                    path = directory / f"probe-{len(rows)}.sqlite3"
                    row = probe(path, journal, timeout, scenario)
                    rows.append({"repeat": repeat + 1, "kind": "probe", **row})
            for processes in (1, 2, 4):
                for read_first, reopen in ((False, False), (False, True), (True, False)):
                    path = directory / f"load-{len(rows)}.sqlite3"
                    row = load(
                        path, journal, 5, processes=processes, read_first=read_first, reopen=reopen
                    )
                    rows.append({"repeat": repeat + 1, "kind": "load", **row})
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--repeats", type=int, default=3)
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error("--repeats must be positive")
    # Never accepts an existing database: all experiments are disposable, including WAL.
    with TemporaryDirectory(prefix="assess-sqlite-") as directory:
        report = {
            "measured_at_utc": datetime.now(UTC).isoformat(),
            "python": platform.python_version(),
            "sqlite": sqlite3.sqlite_version,
            "platform": platform.platform(),
            "machine": platform.machine(),
            "storage": "temporary directory on local filesystem; hardware not qualified",
            "rows": measure(Path(directory), args.repeats),
        }
    rows = report.pop("rows")
    records = [report, *rows]
    args.output.write_text("".join(json.dumps(row) + "\n" for row in records), encoding="utf-8")
    print(f"Recorded {len(rows)} measurements in {args.output}")


if __name__ == "__main__":
    main()
