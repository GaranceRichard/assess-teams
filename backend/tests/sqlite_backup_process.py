"""Independent SQLite writers committing business data and journal in one transaction."""

import sqlite3
from contextlib import closing


def writer(source, pipe, prefix, hold):
    try:
        with closing(sqlite3.connect(source, timeout=10)) as connection:
            pipe.send("ready")
            assert pipe.recv() == "go"
            for index in range(12):
                marker = f"concurrent-{prefix}-{index}"
                connection.execute("BEGIN IMMEDIATE")
                cursor = connection.execute(
                    "INSERT INTO identities_organization(name) VALUES(?)", (marker,)
                )
                identifier = cursor.lastrowid
                if hold and index == 0:
                    pipe.send("half")
                    assert pipe.recv() == "continue"
                connection.execute(
                    """INSERT INTO journals_activityentry
                    (created_at,organization_id,organization_origin_id,organization_name,
                     actor_name,team_name,target_user_name,action,description)
                    VALUES(datetime('now'),?,?,?,'','','','organization_created',?)""",
                    (identifier, identifier, marker, marker),
                )
                connection.commit()
            pipe.send("done")
    finally:
        pipe.close()
