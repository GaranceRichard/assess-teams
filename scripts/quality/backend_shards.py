"""Partition pytest by file duration, splitting only audited independent cases."""

import argparse
import json
import os
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIMINGS = Path(__file__).with_name("backend-test-durations.json")


def partition(nodeids, durations, count, split_files=()):
    if count < 1 or len(nodeids) != len(set(nodeids)):
        raise ValueError("Invalid shard count or duplicate collected tests")
    files = {}
    sizes = Counter(nodeid.split("::", 1)[0] for nodeid in nodeids)

    def group(nodeid):
        filename = nodeid.split("::", 1)[0]
        return nodeid if filename in split_files else filename

    for nodeid in nodeids:
        files.setdefault(group(nodeid), []).append(nodeid)
    loads = [0.0] * count
    assignments = {}
    # Unknown files are still executed, with a conservative default weight.
    default = max(
        (
            seconds / sizes.get(filename, 1) if filename in split_files else seconds
            for filename, seconds in durations.items()
        ),
        default=1.0,
    )

    def weight(name):
        filename = name.split("::", 1)[0]
        seconds = durations.get(filename, default)
        return seconds / sizes[filename] if filename in split_files else seconds

    for filename in sorted(files, key=lambda name: (-weight(name), name)):
        shard = min(range(count), key=lambda index: (loads[index], index))
        assignments[filename] = shard
        loads[shard] += weight(filename)
    return [
        [nodeid for nodeid in nodeids if assignments[group(nodeid)] == shard]
        for shard in range(count)
    ]


class ShardSelection:
    def __init__(self, index, count, durations, output, split_files=()):
        self.split_files = split_files
        self.index, self.count, self.durations, self.output = (
            index,
            count,
            durations,
            output,
        )

    def pytest_collection_modifyitems(self, session, config, items):
        import coverage
        import pytest

        collected = [item.nodeid for item in items]
        selected = partition(collected, self.durations, self.count, self.split_files)[
            self.index - 1
        ]
        if not selected:
            raise pytest.UsageError("Empty backend shard")
        selected_ids = set(selected)
        deselected = [item for item in items if item.nodeid not in selected_ids]
        items[:] = [item for item in items if item.nodeid in selected_ids]
        config.hook.pytest_deselected(items=deselected)
        manifest = {
            "shard": self.index,
            "count": self.count,
            "collected": collected,
            "selected": selected,
            "coverage_version": coverage.__version__,
        }
        (self.output / f"manifest-{self.index}.json").write_text(json.dumps(manifest))
        (self.output / f"coverage-version-{self.index}.txt").write_text(
            f"coverage=={coverage.__version__}\n"
        )

    def pytest_sessionfinish(self, session, exitstatus):
        path = self.output / f"manifest-{self.index}.json"
        if path.exists():
            manifest = json.loads(path.read_text())
            manifest["exit_code"] = int(exitstatus)
            path.write_text(json.dumps(manifest))


def main():
    import pytest

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("shard", type=int)
    args = parser.parse_args()
    timing = json.loads(TIMINGS.read_text())
    count = timing["shards"]
    if not 1 <= args.shard <= count:
        parser.error(f"shard must be between 1 and {count}")
    os.chdir(ROOT / "backend")
    sys.path.insert(0, str(Path.cwd()))
    output = Path("coverage")
    output.mkdir(exist_ok=True)
    os.environ["COVERAGE_FILE"] = str(output / f".coverage.{args.shard}")
    plugin = ShardSelection(
        args.shard, count, timing["seconds"], output, timing.get("split_files", ())
    )
    return pytest.main(
        [
            "--cov=.",
            f"--cov-config={ROOT / '.coveragerc'}",
            "--cov-report=",
            # The mandatory merge job enforces the unchanged global threshold.
            "--cov-fail-under=0",
            "--durations=20",
            f"--junitxml={output / f'junit-{args.shard}.xml'}",
        ],
        plugins=[plugin],
    )


if __name__ == "__main__":
    raise SystemExit(main())
