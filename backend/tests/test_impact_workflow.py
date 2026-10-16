from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


def workflow(name):
    return yaml.safe_load((ROOT / f".github/workflows/{name}.yml").read_text(encoding="utf-8"))


def test_selective_ci_uses_real_diff_and_same_planner_as_pre_push():
    jobs = workflow("quality")["jobs"]
    assert set(jobs) == {"plan", "full", "repository", "backend", "frontend", "e2e", "quality"}
    commands = [step.get("run", "") for step in jobs["plan"]["steps"]]
    assert any(
        "selective.mjs" in value and '--head "$GITHUB_SHA" --plan' in value for value in commands
    )
    for name in ("repository", "backend", "frontend", "e2e", "full"):
        assert jobs[name]["needs"] == "plan"
        assert "needs.plan.outputs" in jobs[name]["if"]
    assert jobs["full"]["uses"] == "./.github/workflows/exhaustive.yml"
    assert set(jobs["quality"]["needs"]) == set(jobs) - {"quality"}
    assert jobs["quality"]["if"] == "always()"
    assert jobs["quality"]["steps"][-1]["run"] == "node scripts/quality/selective-ci.mjs"
    hook = (ROOT / ".githooks/pre-push").read_text()
    assert "selective.mjs" in hook and "--pre-push" in hook
    assert "check-contribution-workflow.ps1" in hook


def test_nightly_and_manual_qualification_are_exhaustive_on_one_immutable_candidate():
    config = workflow("exhaustive")
    assert config[True]["schedule"] == [{"cron": "23 7 * * *"}]
    assert "workflow_dispatch" in config[True] and "workflow_call" in config[True]
    jobs = config["jobs"]
    assert "concurrency" not in config  # A new push must not cancel qualification.
    for name in ("repository", "backend-static", "backend-tests", "frontend"):
        assert jobs[name]["needs"] == "identity"
        checkout = jobs[name]["steps"][0]
        assert checkout["with"]["ref"] == "${{ inputs.candidate || github.sha }}"
    assert jobs["e2e"]["with"]["candidate"] == "${{ inputs.candidate || github.sha }}"
    report = workflow("exhaustive-report")["jobs"]["report"]
    steps = report["steps"]
    proof = next(index for index, step in enumerate(steps) if "attest-ci" in step.get("run", ""))
    gate = next(
        index for index, step in enumerate(steps) if "complete-ci.mjs" in step.get("run", "")
    )
    assert gate < proof and "if" not in steps[proof]
    assert steps[-1]["with"]["name"] == "qualification"
    assert steps[-1]["with"]["retention-days"] == 30


def test_promotion_requires_remote_qualification_and_never_deploys_on_failed_gate():
    config = workflow("promotion")
    assert config["permissions"] == {"contents": "read", "actions": "read"}
    command = config["jobs"]["promotion"]["steps"][-1]
    assert command["run"] == 'npm run quality:promote -- "$CANDIDATE" "$QUALIFICATION_RUN"'
    assert "continue-on-error" not in command


def test_exhaustive_domains_cannot_be_skipped_by_daily_impact_selection():
    jobs = workflow("exhaustive")["jobs"]
    assert jobs["backend-tests"]["strategy"]["matrix"]["shard"] == [1, 2, 3]
    assert jobs["backend-tests"]["strategy"]["fail-fast"] is False
    assert set(jobs["backend-coverage"]["needs"]) == {"identity", "backend-tests"}
    assert set(jobs["quality"]["needs"]) == {
        "repository",
        "backend-static",
        "backend-tests",
        "backend-coverage",
        "frontend",
        "e2e",
    }
    for name, job in jobs.items():
        if name != "quality":
            assert "if" not in job
        for step in job.get("steps", []):
            command = step.get("run", "")
            assert "selective.mjs" not in command and "quality:targeted" not in command
    qualifier = (ROOT / "scripts/quality/qualification.mjs").read_text(encoding="utf-8")
    assert '"--fresh"' in qualifier
