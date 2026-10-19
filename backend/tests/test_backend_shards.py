import json
import os
import subprocess
import sys
from collections import Counter

import pytest

from tests.ci_helpers import SCRIPTS, load_script, shards


def test_measured_files_are_balanced_without_losing_or_repeating_tests():
    nodeids = [f"tests/{file}.py::test_{index}" for file in "abcd" for index in range(2)]
    durations = {f"tests/{file}.py": seconds for file, seconds in zip("abcd", [8, 7, 3, 2])}
    plan = shards.partition(nodeids, durations, 2)
    assert sorted(plan[0] + plan[1]) == sorted(nodeids)
    assert not set(plan[0]).intersection(plan[1])
    assert plan[0] == [nodeid for nodeid in nodeids if "/a.py" in nodeid or "/d.py" in nodeid]
    assert plan == shards.partition(nodeids, durations, 2)


def test_unknown_test_files_are_included_and_parametrized_tests_stay_together():
    nodeids = ["tests/new.py::test_new[1]", "tests/new.py::test_new[2]", "tests/old.py::test_old"]
    plan = shards.partition(nodeids, {"tests/old.py": 10}, 2)
    assert plan == [nodeids[:2], nodeids[2:]]


def test_only_audited_independent_cases_can_split_an_expensive_file():
    cases = [f"tests/critical.py::test_case[{index}]" for index in range(6)]
    ordinary = ["tests/ordinary.py::test_a", "tests/ordinary.py::test_b"]
    durations = {"tests/critical.py": 30, "tests/ordinary.py": 10}
    complete = cases + ordinary
    plan = shards.partition(complete, durations, 3, ["tests/critical.py"])
    assert sorted(node for part in plan for node in part) == sorted(complete)
    assert sum(bool(set(cases).intersection(part)) for part in plan) > 1
    assert sum(bool(set(ordinary).intersection(part)) for part in plan) == 1
    unsplit = shards.partition(complete, durations, 3)
    assert sum(bool(set(cases).intersection(part)) for part in unsplit) == 1


def test_new_file_weight_uses_scheduled_units_instead_of_a_split_file_total():
    cases = [f"tests/critical.py::test_case[{index}]" for index in range(6)]
    new = ["tests/new.py::test_new"]
    plan = shards.partition(cases + new, {"tests/critical.py": 600}, 2, ["tests/critical.py"])
    assert sorted(node for part in plan for node in part) == sorted(cases + new)
    assert all(set(cases).intersection(part) for part in plan)


@pytest.mark.parametrize("nodeids,count", [(["a", "a"], 2), (["a"], 0)])
def test_invalid_partition_is_rejected(nodeids, count):
    with pytest.raises(ValueError):
        shards.partition(nodeids, {}, count)


def test_real_pytest_shards_execute_the_entire_collection_once(tmp_path):
    suite = tmp_path / "suite"
    suite.mkdir()
    for filename in ("test_fast.py", "test_slow.py", "test_new.py"):
        (suite / filename).write_text("def test_pass():\n    assert True\n")
    (suite / "test_new.py").write_text(
        "\n".join(f"def test_case_{index}():\n    assert True\n" for index in range(6))
    )
    manifests = []
    for index in (1, 2, 3):
        output = tmp_path / str(index)
        output.mkdir()
        arguments = [str(suite), "-q", f"--rootdir={tmp_path}"]
        code = (
            "import sys,pytest; "
            f"sys.path.insert(0, {str(SCRIPTS)!r}); "
            "from pathlib import Path; from backend_shards import ShardSelection; "
            "durations={'suite/test_slow.py':10,'suite/test_fast.py':10,'suite/test_new.py':30}; "
            f"plugin=ShardSelection({index},3,durations,Path({str(output)!r}),"
            "['suite/test_new.py']); "
            f"raise SystemExit(pytest.main({arguments!r},"
            "plugins=[plugin]))"
        )
        result = subprocess.run(
            [sys.executable, "-c", code],
            env={**os.environ, "PYTEST_DISABLE_PLUGIN_AUTOLOAD": "1"},
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        manifest = json.loads((output / f"manifest-{index}.json").read_text())
        assert len(manifest["collected"]) == 8
        assert manifest["exit_code"] == 0
        assert f"{len(manifest['selected'])} passed" in result.stdout
        manifests.append(manifest)
    selected = [nodeid for manifest in manifests for nodeid in manifest["selected"]]
    assert len(selected) == len(set(selected)) == 8
    assert set(selected) == set(manifests[0]["collected"])
    assert sum(any("test_new.py" in node for node in item["selected"]) for item in manifests) > 1


def test_duration_refresh_uses_all_phases_and_rejects_failed_runs(tmp_path):
    timings = load_script("backend_test_timings")
    report = tmp_path / "junit.xml"
    report.write_text(
        '<testsuite><testcase classname="tests.test_example" time="3.5"/>'
        '<testcase classname="tests.test_example.TestGroup" time="2"/></testsuite>'
    )
    assert timings.file_durations([report]) == {"tests/test_example.py": 5.5}
    report.write_text(
        '<testsuite><testcase classname="tests.test_example" time="3.5">'
        "<failure/></testcase></testsuite>"
    )
    with pytest.raises(ValueError):
        timings.file_durations([report])


def test_duration_refresh_preserves_the_audited_case_split(tmp_path, monkeypatch):
    timings = load_script("backend_test_timings")
    config = tmp_path / "timings.json"
    split = ["tests/test_sqlite_critical_conflicts.py"]
    config.write_text(json.dumps({"shards": 6, "split_files": split, "seconds": {}}))
    report = tmp_path / "junit.xml"
    report.write_text('<testsuite><testcase classname="tests.test_new" time="2"/></testsuite>')
    monkeypatch.setattr(timings, "TIMINGS", config)
    monkeypatch.setattr(sys, "argv", ["timings", str(report), "--source", "successful run"])
    timings.main()
    refreshed = json.loads(config.read_text())
    assert refreshed["shards"] == 6
    assert refreshed["split_files"] == split
    assert refreshed["seconds"] == {"tests/test_new.py": 2}
    assert refreshed["source"] == "successful run"


def test_current_weights_balance_eight_deterministic_partitions():
    timing = json.loads(shards.TIMINGS.read_text())
    durations = timing["seconds"]
    split_files = timing["split_files"]
    assert split_files == ["tests/test_sqlite_critical_conflicts.py"]
    nodeids = [
        f"{filename}::test_example[{index}]"
        for filename in durations
        for index in range(42 if filename in split_files else 1)
    ]
    plan = shards.partition(nodeids, durations, timing["shards"], split_files)
    assert timing["shards"] == len(plan) == 8
    assert sorted(nodeid for part in plan for nodeid in part) == sorted(nodeids)
    assert [set(part) for part in plan] == [
        set(part) for part in shards.partition(list(reversed(nodeids)), durations, 8, split_files)
    ]
    sizes = Counter(nodeid.split("::")[0] for nodeid in nodeids)
    loads = [
        sum(durations[node.split("::")[0]] / sizes[node.split("::")[0]] for node in part)
        for part in plan
    ]
    assert max(loads) - min(loads) < 1
