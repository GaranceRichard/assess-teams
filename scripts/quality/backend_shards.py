"""Partition the complete pytest collection by measured file duration."""

import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIMINGS = Path(__file__).with_name("backend-test-durations.json")


def partition(nodeids, durations, count):
    if count < 1 or len(nodeids) != len(set(nodeids)):
        raise ValueError("Invalid shard count or duplicate collected tests")
    files = {}
    for nodeid in nodeids:
        files.setdefault(nodeid.split("::", 1)[0], []).append(nodeid)
    loads = [0.0] * count
    assignments = {}
    # Unknown files are still executed, with a conservative default weight.
    default = max(durations.values(), default=1.0)
    for filename in sorted(files, key=lambda name: (-durations.get(name, default), name)):
        shard = min(range(count), key=lambda index: (loads[index], index))
        assignments[filename] = shard
        loads[shard] += durations.get(filename, default)
    return [
        [nodeid for nodeid in nodeids if assignments[nodeid.split("::", 1)[0]] == shard]
        for shard in range(count)
    ]


class ShardSelection:
    def __init__(self, index, count, durations, output):
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
        selected = partition(collected, self.durations, self.count)[self.index - 1]
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
    plugin = ShardSelection(args.shard, count, timing["seconds"], output)
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
