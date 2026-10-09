import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = yaml.safe_load((ROOT / ".github/workflows/quality.yml").read_text(encoding="utf-8"))
JOBS = WORKFLOW["jobs"]
GATES = {"repository", "backend-static", "backend-tests", "backend-coverage", "frontend", "e2e"}


def test_every_independent_gate_runs_once_and_is_required() -> None:
    assert set(JOBS) == GATES | {"quality"}
    for gate in GATES - {"backend-tests", "backend-coverage"}:
        assert "needs" not in JOBS[gate]
        assert "if" not in JOBS[gate]
        commands = [step.get("run", "") for step in JOBS[gate]["steps"]]
        assert commands.count(f"npm run quality:full -- -Scope {gate}") == 1
        assert "npm run quality:full" not in commands
    assert set(JOBS["quality"]["needs"]) == GATES
    assert JOBS["quality"]["if"] == "${{ always() }}"
    assert JOBS["quality"]["name"] == "Full quality gate"
    assert JOBS["quality"]["steps"][-1]["env"]["QUALITY_JOB_RESULTS"] == "${{ toJSON(needs) }}"
    assert JOBS["quality"]["steps"][-1]["run"] == "node scripts/quality/complete-ci.mjs"


def test_caches_preserve_fresh_installs_and_real_e2e_prerequisites() -> None:
    for gate in ("backend-static", "backend-tests", "e2e"):
        steps = JOBS[gate]["steps"]
        setup = next(step for step in steps if step.get("uses") == "actions/setup-python@v5")
        assert setup["with"]["cache"] == "pip"
        assert setup["with"]["cache-dependency-path"] == "backend/requirements*.txt"
        assert sum(step.get("run") == "./scripts/bootstrap/backend.ps1" for step in steps) == 1
        assert not any("pip install" in step.get("run", "") for step in steps)
    for gate in ("frontend", "e2e"):
        steps = JOBS[gate]["steps"]
        setup = next(step for step in steps if step.get("uses") == "actions/setup-node@v4")
        assert setup["with"]["cache"] == "npm"
        assert setup["with"]["cache-dependency-path"] == "frontend/package-lock.json"
        assert sum(step.get("run") == "npm ci --prefix frontend" for step in steps) == 1
    browser_installs = [
        step["run"]
        for job in JOBS.values()
        for step in job["steps"]
        if "playwright install" in step.get("run", "")
    ]
    assert browser_installs == ["npx playwright install --with-deps --only-shell chromium"]


def test_obsolete_runs_are_cancelled_without_duplicate_push_and_pr_suites() -> None:
    # PyYAML's YAML 1.1 loader interprets the GitHub Actions key `on` as True.
    events = WORKFLOW[True]
    assert events["push"]["branches"] == ["main"]
    assert "pull_request" in events
    assert WORKFLOW["concurrency"]["cancel-in-progress"] is True
    group = WORKFLOW["concurrency"]["group"]
    assert "github.workflow" in group
    assert "github.event.pull_request.number || github.ref" in group
    checkout = JOBS["repository"]["steps"][0]
    assert checkout["with"]["fetch-depth"] == 0
    assert "QUALITY_DIFF_BASE" in JOBS["repository"]["env"]


def test_backend_tests_collect_once_per_shard_and_defer_only_the_global_coverage_gate():
    job = JOBS["backend-tests"]
    assert "needs" not in job and "if" not in job
    assert job["strategy"]["fail-fast"] is False
    timing = ROOT / "scripts/quality/backend-test-durations.json"
    count = json.loads(timing.read_text())["shards"]
    assert job["strategy"]["matrix"]["shard"] == list(range(1, count + 1))
    commands = [step.get("run", "") for step in job["steps"]]
    assert (
        commands.count(
            "backend/.venv/bin/python scripts/quality/backend_shards.py ${{ matrix.shard }}"
        )
        == 1
    )
    assert not any("quality:full" in command for command in commands)
    artifact = next(
        step for step in job["steps"] if step.get("uses") == "actions/upload-artifact@v4"
    )
    assert artifact["with"]["include-hidden-files"] is True
    assert artifact["with"]["if-no-files-found"] == "error"


def test_global_coverage_requires_all_shards_without_installing_or_running_backend_again():
    job = JOBS["backend-coverage"]
    assert job["needs"] == "backend-tests"
    assert "if" not in job
    commands = [step.get("run", "") for step in job["steps"]]
    assert "python -m pip install -r backend/coverage/coverage-version-1.txt" in commands
    assert "python ../scripts/quality/combine_backend_coverage.py coverage" in commands
    assert not any("pytest" in command or "bootstrap" in command for command in commands)
    download = next(
        step for step in job["steps"] if step.get("uses") == "actions/download-artifact@v4"
    )
    assert download["with"]["pattern"] == "backend-coverage-*"
    assert download["with"]["merge-multiple"] is True


def test_pages_waits_for_the_complete_quality_workflow_on_the_same_main_sha():
    pages = yaml.safe_load((ROOT / ".github/workflows/demo-pages.yml").read_text())
    trigger = pages[True]["workflow_run"]
    assert trigger == {
        "workflows": ["Quality gate"],
        "branches": ["main"],
        "types": ["completed"],
    }
    build = pages["jobs"]["build"]
    assert build["if"] == (
        "github.event.workflow_run.conclusion == 'success' && "
        "github.event.workflow_run.event == 'push'"
    )
    assert build["steps"][0]["with"]["ref"] == "${{ github.event.workflow_run.head_sha }}"
    assert pages["jobs"]["deploy"]["needs"] == "build"
