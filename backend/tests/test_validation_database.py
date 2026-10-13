import runpy
from pathlib import Path

SETTINGS = Path(__file__).resolve().parents[1] / "config/settings_development.py"


def test_e2e_database_override_is_inherited_by_development_settings(monkeypatch, tmp_path):
    database = str(tmp_path / "e2e.sqlite3")
    monkeypatch.setenv("ASSESS_E2E_DB", database)
    settings = runpy.run_path(str(SETTINGS))
    assert settings["DATABASES"]["default"]["NAME"] == database
    assert settings["DATABASES"]["default"]["ENGINE"] == "django.db.backends.sqlite3"


def test_normal_development_database_is_preserved_without_e2e_override(monkeypatch):
    monkeypatch.delenv("ASSESS_E2E_DB", raising=False)
    settings = runpy.run_path(str(SETTINGS))
    assert settings["DATABASES"]["default"]["NAME"] == SETTINGS.parents[1] / "db.sqlite3"
