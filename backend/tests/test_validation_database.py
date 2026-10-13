import json
import subprocess
import sys
from pathlib import Path

SETTINGS = Path(__file__).resolve().parents[1] / "config/settings_development.py"


def development_database():
    # Read real startup settings without pytest-django's cached database mutations.
    script = (
        "import json, runpy; "
        "settings = runpy.run_path('config/settings_development.py'); "
        "print(json.dumps(settings['DATABASES']['default'], default=str))"
    )
    output = subprocess.check_output(
        [sys.executable, "-c", script], cwd=SETTINGS.parents[1], text=True
    )
    return json.loads(output)


def test_e2e_database_override_is_inherited_by_development_settings(monkeypatch, tmp_path):
    database = str(tmp_path / "e2e.sqlite3")
    monkeypatch.setenv("ASSESS_E2E_DB", database)
    settings = development_database()
    assert settings["NAME"] == database
    assert settings["ENGINE"] == "django.db.backends.sqlite3"


def test_normal_development_database_is_preserved_without_e2e_override(monkeypatch):
    from config.settings_base import DATABASES

    # Reproduce the state left by database tests before this file in CI shards.
    monkeypatch.setitem(
        DATABASES["default"], "NAME", "file:memorydb_default?mode=memory&cache=shared"
    )
    monkeypatch.delenv("ASSESS_E2E_DB", raising=False)
    settings = development_database()
    assert settings["NAME"] == str(SETTINGS.parents[1] / "db.sqlite3")
