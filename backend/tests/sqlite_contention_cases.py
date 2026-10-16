"""Executable contention cases, isolated from pytest coverage consolidation."""

import sys
from contextlib import closing
from pathlib import Path

from tests.sqlite_contention_harness import Peers, result, setup, verify
from tests.sqlite_contention_process import receive


def apis(path, data, timeout=False):
    with Peers(path) as peers:
        first = peers.start("api_hold", data)
        second = peers.start("api", {**data, "name": "Created second"})
        first.send("go")
        receive(first, "write_attempt")
        receive(first, "written")
        second.send("go")
        receive(second, "write_attempt")
        if timeout:
            refusal = result(second)
            assert refusal[0] == 500 and "base est occupée" in refusal[1]["detail"], refusal
            assert refusal[2]
        else:
            assert not second.poll(0.03), "Contender escaped a held writer"
        first.send("continue")
        assert result(first)[0] == 201
        if not timeout:
            assert result(second)[0] == 201
    verify(path, teams=1 if timeout else 2, activities=1 if timeout else 2)


def commit_rollback(path, data):
    with Peers(path) as peers:
        api = peers.start("api_hold", data)
        reader = peers.start("reader", data)
        reader.send("go")
        receive(reader, "held")
        api.send("go")
        receive(api, "write_attempt")
        receive(api, "written")
        api.send("continue")
        refusal = result(api)
        assert refusal[0] == 500 and "base est occupée" in refusal[1]["detail"], refusal
        reader.send("continue")
        assert result(reader) == "released"
    verify(path)


def api_worker(path, data):
    with Peers(path) as peers:
        api = peers.start("api_upgrade", data)
        worker = peers.start("password_hold", data)
        api.send("go")
        receive(api, "read")
        worker.send("go")
        receive(worker, "write_attempt")
        receive(worker, "written")
        api.send("continue")
        receive(api, "write_attempt")
        refusal = result(api)
        assert refusal[0] == 500 and "base est occupée" in refusal[1]["detail"], refusal
        worker.send("continue")
        receive(worker, "smtp")
        worker.send("continue")
        assert result(worker) == "sent"
    verify(path, password="sent")
    import sqlite3

    with closing(sqlite3.connect(path)) as db:
        assert db.execute("SELECT is_active FROM teams_team").fetchone() == (1,)


def run(case, path):
    data = setup(path)
    if case == "apis_release":
        apis(path, data)
    elif case == "apis_timeout":
        apis(path, data, timeout=True)
    elif case == "commit_rollback":
        commit_rollback(path, data)
    elif case == "api_worker_upgrade":
        api_worker(path, data)
    else:
        from tests.sqlite_contention_worker_cases import workers

        workers(case, path, data)
    print("qualified " + case, flush=True)


if __name__ == "__main__":
    run(sys.argv[1], Path(sys.argv[2]))
