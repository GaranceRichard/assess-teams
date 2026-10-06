import runpy
from pathlib import Path

import pytest


@pytest.mark.functional
@pytest.mark.parametrize("port", [None, "5194"])
def test_development_csrf_trusts_only_the_configured_local_e2e_origin(monkeypatch, port):
    if port is None:
        monkeypatch.delenv("ASSESS_E2E_FRONTEND_PORT", raising=False)
    else:
        monkeypatch.setenv("ASSESS_E2E_FRONTEND_PORT", port)
    configuration = runpy.run_path(
        str(Path(__file__).resolve().parents[1] / "config/settings_development.py")
    )
    assert configuration["CSRF_TRUSTED_ORIGINS"] == [
        "http://127.0.0.1:5173",
        f"http://127.0.0.1:{port or '5180'}",
    ]
