"""MEP-040: actual API operations, independent processes and file-backed SQLite."""

import subprocess
import sys
from pathlib import Path

import pytest

from tests.startup_helpers import production_environment

pytestmark = [pytest.mark.integration, pytest.mark.functional]

CASES = (
    "double_finalize",
    "finalize_score",
    "score_finalize",
    "stale_score",
    "double_copy",
    "copy_finalize",
    "copy_validate",
    "validate_copy_archived",
    "validate_edit",
    "double_validate",
    "stale_copy",
    "copy_edit",
    "double_deactivate",
    "double_demote",
    "deactivate_demote",
    "detach_deactivate",
    "delete_demote",
    "put_deactivate_demote",
    "compatible_admins",
    "writer_timeout",
    "commit_rollback",
)


@pytest.mark.parametrize("environment", ["development", "production"])
@pytest.mark.parametrize("case", CASES)
def test_critical_conflicts(case, environment, tmp_path):
    result = subprocess.run(
        [sys.executable, "-m", "tests.sqlite_critical_cases", case, str(tmp_path / "critical.db")],
        cwd=Path(__file__).resolve().parents[1],
        env=production_environment(
            DJANGO_SETTINGS_MODULE=f"config.settings_{environment}",
            APP_BASE_URL="https://testserver",
        ),
        capture_output=True,
        text=True,
        timeout=90,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "qualified " + case in result.stdout
    assert "outcome=retry_after_rollback" not in result.stderr
    if case in {
        "double_finalize",
        "finalize_score",
        "score_finalize",
        "writer_timeout",
        "commit_rollback",
    }:
        assert "outcome=non_replayable" in result.stderr
