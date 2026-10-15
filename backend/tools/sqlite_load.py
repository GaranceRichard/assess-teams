"""Synthetic write-first and read-before-write loads, using one connection per process."""

import multiprocessing
import sqlite3
import time
from contextlib import closing

from tools.sqlite_probe import connect, initialize, receive


def writer(path, journal, timeout, count, hold, read_first, reopen, channel):
    connection = connect(path, journal, timeout)
    channel.send("ready")
    channel.recv()
    samples = []
    for _ in range(count):
        start = time.perf_counter()
        code = None
        try:
            if connection is None:
                connection = connect(path, journal, timeout)
            connection.execute("BEGIN")
            if read_first:
                connection.execute("SELECT value FROM counter").fetchall()
            connection.execute("UPDATE counter SET value=value+1")
            connection.execute("INSERT INTO audit SELECT value FROM counter")
            time.sleep(hold)
            connection.execute("COMMIT")
        except sqlite3.OperationalError as error:
            code = error.sqlite_errorname
            if connection is not None and connection.in_transaction:
                connection.execute("ROLLBACK")
        finally:
            if reopen and connection is not None:
                connection.close()
                connection = None
        samples.append((round(time.perf_counter() - start, 6), code))
    if connection is not None:
        connection.close()
    channel.send(samples)
    channel.close()


def load(path, journal, timeout, processes=2, count=20, hold=0.01, read_first=False, reopen=False):
    initialize(path, journal)
    context = multiprocessing.get_context("spawn")
    workers = []
    channels = []
    try:
        for _ in range(processes):
            parent, child = context.Pipe()
            process = context.Process(
                target=writer,
                args=(path, journal, timeout, count, hold, read_first, reopen, child),
            )
            process.start()
            child.close()
            workers.append(process)
            channels.append(parent)
        for channel in channels:
            assert receive(channel) == "ready"
        start = time.perf_counter()
        for channel in channels:
            channel.send("go")
        samples = [
            sample
            for channel in channels
            for sample in receive(channel, count * (timeout + hold) + 20)
        ]
        elapsed = time.perf_counter() - start
    finally:
        for process in workers:
            process.join(timeout=2)
            if process.is_alive():
                process.terminate()
                process.join(timeout=5)
        for channel in channels:
            channel.close()
    assert all(process.exitcode == 0 for process in workers)
    durations = sorted(sample[0] for sample in samples)
    errors = [sample[1] for sample in samples if sample[1]]
    with closing(connect(path, journal, timeout)) as connection:
        value = connection.execute("SELECT value FROM counter").fetchone()[0]
        audit = connection.execute("SELECT COUNT(*) FROM audit").fetchone()[0]
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
    assert value == audit == processes * count - len(errors)
    return {
        "journal": journal,
        "timeout": timeout,
        "processes": processes,
        "count_per_process": count,
        "hold_seconds": hold,
        "read_first": read_first,
        "reopen": reopen,
        "success": value,
        "errors": len(errors),
        "codes": sorted(set(errors)),
        "seconds": round(elapsed, 6),
        "writes_per_second": round(value / elapsed, 2),
        "p50_seconds": durations[len(durations) // 2],
        "p95_seconds": durations[min(len(durations) - 1, int(len(durations) * 0.95))],
        "max_seconds": max(durations),
        "integrity": integrity,
    }
