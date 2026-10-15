"""Controlled contention on disposable files; no retries or application lock management."""

import multiprocessing
import sqlite3
import time
from contextlib import closing, contextmanager


def connect(path, journal, timeout):
    connection = sqlite3.connect(path, timeout=timeout, isolation_level=None)
    connection.execute(f"PRAGMA journal_mode={journal}")
    connection.execute("PRAGMA synchronous=FULL")
    return connection


def initialize(path, journal):
    with closing(connect(path, journal, 5)) as connection:
        connection.executescript(
            "CREATE TABLE counter (value INTEGER); INSERT INTO counter VALUES (0);"
            "CREATE TABLE audit (value INTEGER);"
        )


def actor(path, journal, timeout, channel):
    with closing(connect(path, journal, timeout)) as connection:
        channel.send("ready")
        sql = channel.recv()
        channel.send("started")
        start = time.perf_counter()
        try:
            for statement in sql:
                connection.execute(statement).fetchall()
            result = {"outcome": "ok", "code": None}
        except sqlite3.OperationalError as error:
            result = {"outcome": "locked", "code": error.sqlite_errorname}
        result["seconds"] = round(time.perf_counter() - start, 6)
        channel.send(result)
    channel.close()


def receive(channel, timeout=20):
    if not channel.poll(timeout):
        raise TimeoutError("SQLite probe process did not answer")
    return channel.recv()


@contextmanager
def peer(path, journal, timeout):
    context = multiprocessing.get_context("spawn")
    parent, child = context.Pipe()
    process = context.Process(target=actor, args=(path, journal, timeout, child))
    process.start()
    child.close()
    try:
        assert receive(parent) == "ready"
        yield parent
    finally:
        process.join(timeout=2)
        if process.is_alive():
            process.terminate()
            process.join(timeout=5)
        parent.close()
    assert process.exitcode == 0


def probe(path, journal, timeout, scenario, hold=0.2):
    initialize(path, journal)
    with (
        closing(connect(path, journal, timeout)) as connection,
        peer(path, journal, timeout) as channel,
    ):
        if scenario == "reader_blocks_commit":
            connection.execute("BEGIN")
            connection.execute("SELECT * FROM counter").fetchall()
        else:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute("UPDATE counter SET value=1")
            connection.execute("INSERT INTO audit VALUES (1)")
        statements = [
            "BEGIN IMMEDIATE",
            "UPDATE counter SET value=value+1",
            "INSERT INTO audit SELECT value FROM counter",
            "COMMIT",
        ]
        if scenario == "read_during_write":
            statements = ["SELECT * FROM counter"]
        channel.send(statements)
        assert receive(channel) == "started"
        if scenario == "writer_waits":
            time.sleep(hold)
            connection.execute("COMMIT")
        result = receive(channel, timeout + 10)
        if connection.in_transaction:
            connection.execute("ROLLBACK")
    with closing(connect(path, journal, timeout)) as connection:
        result["value"] = connection.execute("SELECT value FROM counter").fetchone()[0]
        result["audit"] = connection.execute("SELECT COUNT(*) FROM audit").fetchone()[0]
        result["integrity"] = connection.execute("PRAGMA integrity_check").fetchone()[0]
    return {"journal": journal, "timeout": timeout, "scenario": scenario, **result}
