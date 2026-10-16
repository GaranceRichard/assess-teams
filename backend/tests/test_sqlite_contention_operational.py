"""Qualification uses independent processes, actual endpoints/ORM and SQLite files."""

import subprocess
import sys
from pathlib import Path

import pytest

from tests.startup_helpers import production_environment

pytestmark = [pytest.mark.integration, pytest.mark.functional]


@pytest.mark.parametrize("environment", ["development", "production"])
@pytest.mark.parametrize(
    "case",
    [
        "apis_release",
        "apis_timeout",
        "commit_rollback",
        "api_worker_upgrade",
        "workers_same_job",
        "due_workers",
        "retry_release",
        "retry_commit",
        "retry_exhausted",
        "retry_rechecks",
        "smtp_not_replayable",
    ],
)
def test_operational_contention(case, tmp_path, environment):
    process = subprocess.run(
        [
            sys.executable,
            "-m",
            "tests.sqlite_contention_cases",
            case,
            str(tmp_path / "qualification.sqlite3"),
        ],
        cwd=Path(__file__).resolve().parents[1],
        env=production_environment(
            DJANGO_SETTINGS_MODULE=f"config.settings_{environment}",
            APP_BASE_URL="https://testserver",
        ),
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert process.returncode == 0, process.stdout + process.stderr
    assert "qualified " + case in process.stdout
    if case.startswith("retry_") or case == "workers_same_job":
        assert "outcome=retry_after_rollback" in process.stderr
    if case in {"retry_release", "retry_commit", "retry_rechecks", "workers_same_job"}:
        assert "outcome=resolved" in process.stderr
    if case == "retry_exhausted":
        assert "outcome=exhausted attempt=3" in process.stderr
    if case == "smtp_not_replayable":
        assert "outcome=stopped_without_replay" in process.stderr
