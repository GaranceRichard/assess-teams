import json
import os
import subprocess
import sys

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


@pytest.mark.parametrize("nodeids,count", [(["a", "a"], 2), (["a"], 0)])
def test_invalid_partition_is_rejected(nodeids, count):
    with pytest.raises(ValueError):
        shards.partition(nodeids, {}, count)


def test_real_pytest_shards_execute_the_entire_collection_once(tmp_path):
    suite = tmp_path / "suite"
    suite.mkdir()
    for filename in ("test_fast.py", "test_slow.py", "test_new.py"):
        (suite / filename).write_text("def test_pass():\n    assert True\n")
    manifests = []
    for index in (1, 2):
        output = tmp_path / str(index)
        output.mkdir()
        arguments = [str(suite), "-q", f"--rootdir={tmp_path}"]
        code = (
            "import sys,pytest; "
            f"sys.path.insert(0, {str(SCRIPTS)!r}); "
            "from pathlib import Path; from backend_shards import ShardSelection; "
            f"plugin=ShardSelection({index},2,{{'suite/test_slow.py':10}},Path({str(output)!r})); "
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
        assert len(manifest["collected"]) == 3
        assert manifest["exit_code"] == 0
        assert f"{len(manifest['selected'])} passed" in result.stdout
        manifests.append(manifest)
    selected = [nodeid for manifest in manifests for nodeid in manifest["selected"]]
    assert len(selected) == len(set(selected)) == 3
    assert set(selected) == set(manifests[0]["collected"])


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
