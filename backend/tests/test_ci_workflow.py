from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = yaml.safe_load((ROOT / ".github/workflows/quality.yml").read_text(encoding="utf-8"))
JOBS = WORKFLOW["jobs"]
GATES = {"repository", "backend", "frontend", "e2e"}


def test_every_independent_gate_runs_once_and_is_required() -> None:
    assert set(JOBS) == GATES | {"quality"}
    for gate in GATES:
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
    for gate in ("backend", "e2e"):
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
