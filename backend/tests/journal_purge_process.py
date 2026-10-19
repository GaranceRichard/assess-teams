"""Real SQLite processes: a killed transaction and competing checkpoint writers."""

import multiprocessing
import sys
from datetime import timedelta
from unittest.mock import patch

from tests.sqlite_contention_process import configure, receive


def worker(pipe, path, run_id, hold):
    configure(path)
    from django.db import OperationalError, connection, connections

    from journals.purge import advance_run
    from journals.purge_models import JournalPurgeRun

    try:
        connection.cursor().execute("PRAGMA busy_timeout=100")
        pipe.send("ready")
        receive(pipe, "go")
        if hold:
            advance_run(run_id)
            pipe.send("committed")
            original = JournalPurgeRun.save

            def save(run, *args, **kwargs):
                original(run, *args, **kwargs)
                pipe.send("uncommitted")
                receive(pipe, "continue")

            with patch.object(JournalPurgeRun, "save", save):
                advance_run(run_id)
            pipe.send("released")
        else:
            try:
                run = advance_run(run_id)
                pipe.send(["advanced", run.deleted_count])
            except OperationalError:
                pipe.send("busy")
    finally:
        connections.close_all()
        pipe.close()


def scenario(path, kind):
    configure(path)
    from django.core.management import call_command
    from django.db import connections
    from django.utils import timezone

    from journals.models import ActivityEntry, LogEntry
    from journals.purge import advance_run, start_run
    from journals.purge_models import JournalPurgeRun
    from journals.purge_policy import check_integrity

    call_command("migrate", verbosity=0)
    for _ in range(4):
        row = LogEntry.objects.create(level="INFO", source="system", message="synthetic-private")
        LogEntry.objects.filter(pk=row.pk).update(created_at=timezone.now() - timedelta(days=8))
    ActivityEntry.objects.create(action="evaluation_completed", description="protected-proof")
    proof = list(ActivityEntry.objects.values())
    run = start_run(simulation=False, authorization="OPS-123", batch_size=1)
    connections.close_all()
    context = multiprocessing.get_context("spawn")
    children = []

    def start(hold):
        parent, remote = context.Pipe()
        process = context.Process(target=worker, args=(remote, path, run.pk, hold))
        process.start()
        remote.close()
        children.append((process, parent))
        receive(parent, "ready")
        return process, parent

    try:
        first, pipe = start(True)
        pipe.send("go")
        receive(pipe, "committed")
        receive(pipe, "uncommitted")
        if kind == "kill":
            first.kill()
            first.join(10)
            assert not first.is_alive() and first.exitcode != 0
            expected = 1
        else:
            second, peer = start(False)
            peer.send("go")
            receive(peer, "busy")
            second.join(10)
            assert second.exitcode == 0
            pipe.send("continue")
            receive(pipe, "released")
            first.join(10)
            assert first.exitcode == 0
            expected = 2
        checkpoint = JournalPurgeRun.objects.get(pk=run.pk)
        assert checkpoint.deleted_count == checkpoint.batches == expected
        assert LogEntry.objects.count() == 4 - expected
        check_integrity()
        for _ in range(5):
            checkpoint = advance_run(run.pk)
            if checkpoint.status == "completed":
                break
        assert checkpoint.status == "completed" and checkpoint.deleted_count == 4
        assert not LogEntry.objects.exists()
        assert list(ActivityEntry.objects.values()) == proof
        check_integrity()
    finally:
        connections.close_all()
        for process, pipe in children:
            if process.is_alive():
                process.kill()
            process.join(10)
            pipe.close()
    print("qualified " + kind)


if __name__ == "__main__":
    scenario(sys.argv[1], sys.argv[2])
