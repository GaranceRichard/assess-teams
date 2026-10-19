import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = yaml.safe_load((ROOT / ".github/workflows/exhaustive.yml").read_text(encoding="utf-8"))
JOBS = WORKFLOW["jobs"]
SELECTIVE = yaml.safe_load((ROOT / ".github/workflows/quality.yml").read_text(encoding="utf-8"))
REPORT = yaml.safe_load((ROOT / ".github/workflows/exhaustive-report.yml").read_text())["jobs"][
    "report"
]
E2E = yaml.safe_load((ROOT / ".github/workflows/e2e.yml").read_text(encoding="utf-8"))["jobs"][
    "shards"
]
BACKEND = yaml.safe_load((ROOT / ".github/workflows/backend.yml").read_text(encoding="utf-8"))[
    "jobs"
]
EXECUTION = {**JOBS, **BACKEND, "e2e": E2E}
GATES = {"repository", "backend", "frontend", "e2e"}


def test_every_independent_gate_runs_once_and_is_required() -> None:
    assert set(JOBS) == GATES | {"quality", "identity"}
    for gate in GATES - {"backend"}:
        assert JOBS[gate]["needs"] == "identity"
        assert "if" not in JOBS[gate]
        commands = [step.get("run", "") for step in EXECUTION[gate]["steps"]]
        assert commands.count(f"npm run quality:full -- -Scope {gate}") == 1
        assert "npm run quality:full" not in commands
    assert set(JOBS["quality"]["needs"]) == GATES
    assert JOBS["quality"]["if"] == "${{ always() }}"
    assert REPORT["name"] == "Full quality gate"
    assert JOBS["quality"]["with"]["results"] == "${{ toJSON(needs) }}"
    assert any(
        step.get("run") == "node scripts/quality/complete-ci.mjs" for step in REPORT["steps"]
    )


def test_caches_preserve_fresh_installs_and_real_e2e_prerequisites() -> None:
    for gate in ("backend-static", "backend-tests", "e2e"):
        steps = EXECUTION[gate]["steps"]
        setup = next(step for step in steps if step.get("uses") == "actions/setup-python@v5")
        assert setup["with"]["cache"] == "pip"
        assert setup["with"]["cache-dependency-path"] == "backend/requirements*.txt"
        assert sum(step.get("run") == "./scripts/bootstrap/backend.ps1" for step in steps) == 1
        assert not any("pip install" in step.get("run", "") for step in steps)
    for gate in ("frontend", "e2e"):
        steps = EXECUTION[gate]["steps"]
        setup = next(step for step in steps if step.get("uses") == "actions/setup-node@v4")
        assert setup["with"]["cache"] == "npm"
        assert setup["with"]["cache-dependency-path"] == "frontend/package-lock.json"
        assert sum(step.get("run") == "npm ci --prefix frontend" for step in steps) == 1
    browser_installs = [
        step["run"]
        for job in EXECUTION.values()
        for step in job.get("steps", [])
        if "playwright install" in step.get("run", "")
    ]
    assert browser_installs == ["npx playwright install --with-deps --only-shell chromium"]


def test_obsolete_runs_are_cancelled_without_duplicate_push_and_pr_suites() -> None:
    # PyYAML's YAML 1.1 loader interprets the GitHub Actions key `on` as True.
    events = SELECTIVE[True]
    assert events["push"]["branches"] == ["main"]
    assert "pull_request" in events
    assert SELECTIVE["concurrency"]["cancel-in-progress"] is True
    group = SELECTIVE["concurrency"]["group"]
    assert "github.workflow" in group
    assert "github.event.pull_request.number || github.ref" in group
    checkout = JOBS["repository"]["steps"][0]
    assert checkout["with"]["fetch-depth"] == 0
    assert "QUALITY_DIFF_BASE" in JOBS["repository"]["env"]


def test_backend_tests_collect_once_per_shard_and_defer_only_the_global_coverage_gate():
    job = BACKEND["backend-tests"]
    assert "needs" not in job and job["if"] == "inputs.complete"
    assert job["strategy"]["fail-fast"] is False
    timing = ROOT / "scripts/quality/backend-test-durations.json"
    count = json.loads(timing.read_text())["shards"]
    assert job["strategy"]["matrix"]["shard"] == list(range(1, count + 1))
    commands = [step.get("run", "") for step in job.get("steps", [])]
    assert (
        commands.count(
            "backend/.venv/bin/python scripts/quality/backend_shards.py ${{ matrix.shard }}"
        )
        == 1
    )
    assert not any("quality:full" in command for command in commands)
    artifact = next(
        step for step in job.get("steps", []) if step.get("uses") == "actions/upload-artifact@v4"
    )
    assert artifact["with"]["include-hidden-files"] is True
    assert artifact["with"]["if-no-files-found"] == "error"


def test_global_coverage_requires_all_shards_without_installing_or_running_backend_again():
    job = BACKEND["backend-coverage"]
    assert job["needs"] == "backend-tests"
    assert job["if"] == "inputs.complete"
    commands = [step.get("run", "") for step in job.get("steps", [])]
    assert "python -m pip install -r backend/coverage/coverage-version-1.txt" in commands
    assert "python ../scripts/quality/combine_backend_coverage.py coverage" in commands
    assert not any("pytest" in command or "bootstrap" in command for command in commands)
    download = next(
        step for step in job.get("steps", []) if step.get("uses") == "actions/download-artifact@v4"
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


def test_two_e2e_shards_are_isolated_and_reports_are_required_by_the_final_gate():
    assert JOBS["e2e"]["uses"] == "./.github/workflows/e2e.yml"
    assert E2E["strategy"] == {"fail-fast": False, "matrix": {"shard": [1, 2]}}
    assert E2E["env"]["ASSESS_E2E_SHARD"] == "${{ matrix.shard }}/2"
    for name in ("DB", "BACKEND_PORT", "FRONTEND_PORT", "DEMO_PORT"):
        assert "matrix.shard" in E2E["env"][f"ASSESS_E2E_{name}"]
    artifact = E2E["steps"][-1]
    assert artifact["if"] == "${{ always() }}"
    assert artifact["with"]["include-hidden-files"] is True
    assert artifact["with"]["name"] == "playwright-shard-${{ matrix.shard }}"
    commands = [step.get("run", "") for step in REPORT["steps"]]
    assert any(
        "merge-reports" in command and "combine_e2e_reports.mjs" in command for command in commands
    )
    assert not any(
        "quality:full" in command or "playwright test" in command for command in commands
    )
    assert (
        next(
            step
            for step in REPORT["steps"]
            if step.get("run") == "node scripts/quality/complete-ci.mjs"
        )["if"]
        == "${{ always() }}"
    )
