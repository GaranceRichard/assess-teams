"""CA01/CA04: transactional cuts while two independent processes write real tables."""

import multiprocessing
import sqlite3
import time
from contextlib import closing

import pytest

from tests import sqlite_backup_helpers
from tests.sqlite_backup_helpers import capture, verify
from tests.sqlite_backup_process import writer

backup_instance = sqlite_backup_helpers.backup_instance

pytestmark = [pytest.mark.functional, pytest.mark.integration]


def receive(pipe, expected):
    assert pipe.poll(20), "writer did not signal"
    assert pipe.recv() == expected


@pytest.mark.parametrize("journal", ["DELETE", "WAL"])
@pytest.mark.parametrize("repeat", range(3))
def test_backup_has_whole_concurrent_transactions(backup_instance, journal, repeat):
    source = backup_instance[1]
    with closing(sqlite3.connect(source)) as connection:
        assert connection.execute(f"PRAGMA journal_mode={journal}").fetchone() == (journal.lower(),)
        connection.execute("CREATE TABLE backup_padding(data BLOB)")
        connection.execute("INSERT INTO backup_padding VALUES(randomblob(4194304))")
        connection.commit()
    context = multiprocessing.get_context("spawn")
    peers = []
    try:
        for index in range(2):
            parent, child = context.Pipe()
            process = context.Process(
                target=writer, args=(str(source), child, f"{repeat}-{index}", index == 0)
            )
            process.start()
            child.close()
            peers.append((process, parent))
            receive(parent, "ready")
        peers[0][1].send("go")
        receive(peers[0][1], "half")
        released = False

        def progress(status, remaining, total):
            nonlocal released
            if not released:
                released = True
                peers[0][1].send("continue")
                peers[1][1].send("go")
            # Permit writer commits between API backup steps; no source lock is retained here.
            time.sleep(0.003)

        bundle = capture(backup_instance, progress=progress, timeout=30)
        assert released
        for process, pipe in peers:
            receive(pipe, "done")
            process.join(10)
            assert process.exitcode == 0
        verify(bundle)
        with closing(sqlite3.connect(source)) as connection:
            assert connection.execute(
                "SELECT count(*) FROM identities_organization"
            ).fetchone() == (25,)
            connection.execute("INSERT INTO identities_organization(name) VALUES('After backup')")
            connection.commit()
        with closing(sqlite3.connect(bundle / "database.sqlite3")) as connection:
            assert connection.execute(
                "SELECT count(*) FROM identities_organization WHERE name='Before backup'"
            ).fetchone() == (1,)
            assert connection.execute(
                "SELECT count(*) FROM identities_organization WHERE name='After backup'"
            ).fetchone() == (0,)
            organizations = {
                r[0]
                for r in connection.execute(
                    "SELECT name FROM identities_organization WHERE name LIKE 'concurrent-%'"
                )
            }
            activities = {
                r[0] for r in connection.execute("SELECT description FROM journals_activityentry")
            }
            assert organizations == activities
    finally:
        for process, pipe in peers:
            if process.is_alive():
                process.terminate()
            process.join(10)
            pipe.close()
