import subprocess
import sys
from pathlib import Path

import pytest

from tests.startup_helpers import production_environment


@pytest.mark.integration
@pytest.mark.parametrize("environment", ["development", "production"])
@pytest.mark.parametrize("kind", ["kill", "concurrent"])
def test_persistent_purge_recovery_on_real_sqlite(tmp_path, environment, kind):
    result = subprocess.run(
        [sys.executable, "-m", "tests.journal_purge_process", str(tmp_path / "purge.db"), kind],
        cwd=Path(__file__).resolve().parents[1],
        env=production_environment(
            DJANGO_SETTINGS_MODULE=f"config.settings_{environment}",
            JOURNAL_TECHNICAL_RETENTION_DAYS="7",
            JOURNAL_ACTIVITY_RETENTION_DAYS="keep",
        ),
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "qualified " + kind in result.stdout
