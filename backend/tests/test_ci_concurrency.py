"""Evaluate the workflow's small GitHub expression subset, without publishing fixtures."""

import re
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[2]
POLICY = yaml.safe_load((ROOT / ".github/workflows/quality.yml").read_text(encoding="utf-8"))[
    "concurrency"
]


def expression(source, context):
    if " || " in source:
        left, right = source.split(" || ", 1)
        return expression(left, context) or expression(right, context)
    if " == " in source:
        left, right = source.split(" == ", 1)
        return expression(left, context) == expression(right, context)
    if source.startswith("'") and source.endswith("'"):
        return source[1:-1]
    return context.get(source)


def policy(event, run_id, pr=None, workflow="Quality gate", sha="same-sha"):
    context = {
        "github.workflow": workflow,
        "github.event_name": event,
        "github.event.pull_request.number": pr,
        "github.run_id": run_id,
        "github.ref": "refs/heads/main" if pr is None else f"refs/pull/{pr}/merge",
        "github.sha": sha,
    }
    group = re.sub(
        r"\$\{\{ (.*?) \}\}", lambda match: str(expression(match[1], context)), POLICY["group"]
    )
    cancel = POLICY["cancel-in-progress"]
    if isinstance(cancel, str):
        cancel = expression(cancel.removeprefix("${{ ").removesuffix(" }}"), context)
    return group, cancel


def test_configuration_uses_per_run_identity_except_for_same_pull_request():
    assert POLICY == {
        "group": "${{ github.workflow }}-${{ github.event_name }}-"
        "${{ github.event.pull_request.number || github.run_id }}",
        "cancel-in-progress": "${{ github.event_name == 'pull_request' }}",
    }


@pytest.mark.parametrize("shas", [("first", "second", "third"), ("same",) * 3])
def test_three_main_runs_cannot_cancel_running_or_replace_pending_validation(shas):
    runs = [policy("push", index, sha=sha) for index, sha in enumerate(shas, 1)]
    assert len({group for group, _ in runs}) == 3
    assert all(cancel is False for _, cancel in runs)


def test_same_pr_replaces_obsolete_validation_while_other_prs_remain_independent():
    first, second = policy("pull_request", 1, 42), policy("pull_request", 2, 42)
    assert first == second and first[1] is True
    assert first[0] != policy("pull_request", 3, 43)[0]
    assert first[0] != policy("push", 42)[0]
    assert first[0] != policy("pull_request", 4, 42, workflow="Other gate")[0]


def test_reusable_quality_workflows_cannot_cancel_their_callers():
    for name in ("exhaustive", "backend", "e2e", "selective-e2e", "exhaustive-report"):
        config = yaml.safe_load((ROOT / f".github/workflows/{name}.yml").read_text())
        assert "concurrency" not in config
        assert all("concurrency" not in job for job in config["jobs"].values())
