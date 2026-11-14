import subprocess
import sys
from pathlib import Path

import pytest

from tests.startup_helpers import production_environment

pytestmark = [pytest.mark.integration, pytest.mark.functional]


@pytest.mark.parametrize("environment", ["development", "production"])
@pytest.mark.parametrize(
    "kind,order",
    [
        (kind, order)
        for kind in ("team", "plan", "start", "notification", "log", "delete")
        for order in ("first", "second")
        if kind != "delete" or order == "first"
    ],
)
def test_organization_deletion_serializes_with_independent_sqlite_processes(
    kind, order, environment, tmp_path
):
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "tests.organization_delete_concurrency",
            kind,
            order,
            str(tmp_path / "organization.sqlite3"),
        ],
        cwd=Path(__file__).resolve().parents[1],
        env=production_environment(
            DJANGO_SETTINGS_MODULE=f"config.settings_{environment}",
            APP_BASE_URL="https://testserver",
        ),
        capture_output=True,
        text=True,
        timeout=75,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "qualified organization deletion" in result.stdout
