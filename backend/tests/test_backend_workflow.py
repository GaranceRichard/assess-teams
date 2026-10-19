"""Prevent selective CI from silently reverting to a serial complete backend run."""

import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]


def workflow(name):
    return yaml.safe_load((ROOT / f".github/workflows/{name}.yml").read_text(encoding="utf-8"))


def test_selective_and_exhaustive_share_the_complete_backend_engine():
    selective = workflow("quality")["jobs"]["backend"]
    exhaustive = workflow("exhaustive")["jobs"]["backend"]
    for job in (selective, exhaustive):
        assert job["uses"] == "./.github/workflows/backend.yml"
        assert "steps" not in job
        assert "continue-on-error" not in job
    assert exhaustive["needs"] == "identity"
    assert exhaustive["with"] == {"candidate": "${{ inputs.candidate || github.sha }}"}
    assert selective["with"]["candidate"] == "${{ github.sha }}"
    assert selective["with"]["complete"] == (
        "${{ contains(fromJSON(needs.plan.outputs.plan).checks.*.scope, 'backend') }}"
    )
    assert selective["with"]["base"] == (
        "${{ github.event.pull_request.base.sha || github.event.before }}"
    )


def test_targeted_backend_keeps_the_diff_selection_without_running_full_shards():
    config = workflow("backend")
    assert config[True]["workflow_call"]["inputs"]["complete"]["default"] is True
    jobs = config["jobs"]
    static = jobs["backend-static"]
    assert "if" not in static
    checkout = static["steps"][0]
    assert checkout["with"] == {"ref": "${{ inputs.candidate }}", "fetch-depth": 0}
    targeted = next(step for step in static["steps"] if "--only backend" in step.get("run", ""))
    assert targeted["if"] == "${{ !inputs.complete }}"
    assert targeted["env"]["QUALITY_DIFF_BASE"] == "${{ inputs.base }}"
    full = next(step for step in static["steps"] if "quality:full" in step.get("run", ""))
    assert full["if"] == "inputs.complete"
    for name in ("backend-tests", "backend-coverage"):
        assert jobs[name]["if"] == "inputs.complete"
    assert jobs["backend-coverage"]["needs"] == "backend-tests"
    for job in jobs.values():
        assert "continue-on-error" not in job
        assert all("continue-on-error" not in step for step in job["steps"])


def test_parallel_backend_capacity_matches_measured_weights_and_immutable_checkouts():
    jobs = workflow("backend")["jobs"]
    timing = json.loads((ROOT / "scripts/quality/backend-test-durations.json").read_text())
    assert timing["shards"] == 8
    assert jobs["backend-tests"]["strategy"] == {
        "fail-fast": False,
        "matrix": {"shard": list(range(1, timing["shards"] + 1))},
    }
    for job in jobs.values():
        assert job["steps"][0]["with"]["ref"] == "${{ inputs.candidate }}"
