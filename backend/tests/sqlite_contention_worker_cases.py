"""Real worker contention, including the boundary after irreversible SMTP."""

from contextlib import closing

from tests.sqlite_contention_harness import Peers, result, verify
from tests.sqlite_contention_process import receive


def workers(case, path, data):
    if case == "due_workers":
        due_workers(path, data)
    elif case == "workers_same_job":
        same_job(path, data)
    elif case == "smtp_not_replayable":
        after_smtp(path, data)
    else:
        retry(path, data, case)


def retry(path, data, case):
    exhausted = case == "retry_exhausted"
    invalidated = case == "retry_rechecks"
    with Peers(path) as peers:
        worker = peers.start("password", data)
        holder = peers.start(
            "reader" if case == "retry_commit" else "writer", {**data, "invalidate": invalidated}
        )
        holder.send("go")
        receive(holder, "held")
        worker.send("go")
        receive(worker, "write_attempt")
        receive(worker, "retry")
        if exhausted:
            worker.send("continue")
            receive(worker, "retry")
            worker.send("continue")
            assert "base est occupée" in result(worker)
        holder.send("continue")
        assert result(holder) == "released"
        if not exhausted:
            worker.send("continue")
            if invalidated:
                assert result(worker) == "skipped"
            else:
                receive(worker, "smtp")
                worker.send("continue")
                assert result(worker) == "sent"
    verify(path, password="pending" if exhausted else "failed" if invalidated else "sent")


def same_job(path, data):
    with Peers(path) as peers:
        first = peers.start("password_hold", data)
        second = peers.start("password", data)
        first.send("go")
        receive(first, "write_attempt")
        receive(first, "written")
        second.send("go")
        receive(second, "write_attempt")
        receive(second, "retry")
        first.send("continue")
        receive(first, "smtp")
        second.send("continue")
        assert result(second) == "skipped"
        first.send("continue")
        assert result(first) == "sent"
    verify(path, password="sent")


def after_smtp(path, data):
    with Peers(path) as peers:
        worker = peers.start("email", data)
        holder = peers.start("writer", data)
        worker.send("go")
        receive(worker, "write_attempt")
        receive(worker, "smtp")  # Claim is durable; sending must never be replayed.
        holder.send("go")
        receive(holder, "held")
        worker.send("continue")
        assert "base est occupée" in result(worker)
        holder.send("continue")
        assert result(holder) == "released"
    verify(path, email="sending")


def due_workers(path, data):
    import sqlite3

    with Peers(path) as peers:
        first = peers.start("due_hold", data)
        second = peers.start("due", data)
        first.send("go")
        receive(first, "write_attempt")
        receive(first, "written")
        second.send("go")
        receive(second, "write_attempt")
        receive(second, "retry")
        first.send("continue")
        assert result(first) is True
        second.send("continue")
        assert result(second) is False
    verify(path)
    with closing(sqlite3.connect(path)) as db:
        assert db.execute("SELECT count(*) FROM assessments_evaluationrun").fetchone() == (1,)
        assert db.execute(
            "SELECT next_due_date FROM assessments_evaluationschedule"
        ).fetchone() == (None,)
        assert db.execute("SELECT count(*) FROM notifications_emailnotification").fetchone() == (2,)
