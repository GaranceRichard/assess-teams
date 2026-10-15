import pytest

from tools.sqlite_load import load
from tools.sqlite_probe import probe

pytestmark = [pytest.mark.integration, pytest.mark.functional]


@pytest.mark.parametrize("journal", ["DELETE", "WAL"])
@pytest.mark.parametrize("scenario", ["writer_waits", "writer_times_out", "read_during_write"])
def test_separate_processes_wait_read_or_refuse_without_partial_writes(tmp_path, journal, scenario):
    result = probe(tmp_path / "probe.sqlite3", journal, 0.1, scenario, hold=0.03)
    if scenario == "writer_times_out":
        assert result["outcome"] == "locked"
        assert result["code"] == "SQLITE_BUSY"
        assert 0.08 <= result["seconds"] < 5
        assert result["value"] == result["audit"] == 0
    else:
        assert result["outcome"] == "ok"
        assert result["value"] == result["audit"] == (2 if scenario == "writer_waits" else 0)
    assert result["integrity"] == "ok"


@pytest.mark.parametrize("journal, outcome", [("DELETE", "locked"), ("WAL", "ok")])
def test_reader_snapshot_blocks_delete_commit_but_not_wal(tmp_path, journal, outcome):
    result = probe(tmp_path / "probe.sqlite3", journal, 0.1, "reader_blocks_commit")
    assert result["outcome"] == outcome
    assert result["value"] == result["audit"] == (1 if outcome == "ok" else 0)
    assert result["integrity"] == "ok"


@pytest.mark.parametrize("reopen", [False, True])
def test_write_first_processes_preserve_counter_and_audit_with_connection_policy(tmp_path, reopen):
    result = load(tmp_path / "load.sqlite3", "DELETE", 5, count=5, hold=0.005, reopen=reopen)
    assert result["success"] == 10
    assert result["errors"] == 0
    assert result["integrity"] == "ok"
