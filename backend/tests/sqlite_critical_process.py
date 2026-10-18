"""Spawned HTTP peers: real sessions/CSRF, explicit SQL and Journal rendezvous."""

import time
from contextlib import ExitStack
from unittest.mock import patch

from tests.sqlite_contention_process import configure, pause, receive


def child(pipe, path, kind, data):
    configure(path)
    from django.db import connection, connections
    from rest_framework.test import APIClient

    from identities.models import User
    from journals.models import ActivityEntry

    try:
        client = APIClient(enforce_csrf_checks=True)
        client.defaults["HTTP_ORIGIN"] = "https://testserver"
        client.force_login(User.objects.get(pk=data["actor"]))
        assert client.get("/api/session/", secure=True).status_code == 200
        connection.ensure_connection()
        if data.get("short_timeout"):
            connection.cursor().execute("PRAGMA busy_timeout=100")
        else:
            assert connection.cursor().execute("PRAGMA busy_timeout").fetchone() == (5000,)
        with ExitStack() as stack:
            if data.get("hold") == "journal":
                original = ActivityEntry.save
                held = False

                def save(entry, *args, **kwargs):
                    nonlocal held
                    original(entry, *args, **kwargs)
                    if not held:
                        held = True
                        pause(pipe, "written")

                stack.enter_context(patch.object(ActivityEntry, "save", save))
            if data.get("hold") == "source":
                from assessments.adapters.api import version_views

                original_source = version_views.manageable_evaluation

                def source(*args):
                    current = original_source(*args)
                    pause(pipe, "source_read")
                    return current

                stack.enter_context(patch.object(version_views, "manageable_evaluation", source))
            announced = False
            held_sql = False

            def sql(execute, query, params, many, context):
                nonlocal announced, held_sql
                if not announced and query.startswith(("UPDATE", "INSERT", "DELETE")):
                    announced = True
                    pipe.send("write_attempt")
                value = execute(query, params, many, context)
                if (
                    data.get("hold") == "score"
                    and not held_sql
                    and query.startswith('UPDATE "assessments_evaluationrunquestion"')
                ):
                    held_sql = True
                    pause(pipe, "written")
                return value

            pipe.send("ready")
            receive(pipe, "go")
            started = time.monotonic()
            with connection.execute_wrapper(sql):
                method, url, body = request(kind, data)
                response = getattr(client, method)(
                    url,
                    body,
                    format="json",
                    secure=True,
                    HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
                )
            assert time.monotonic() - started < 15
            pipe.send(["result", [response.status_code, response.data]])
    finally:
        connections.close_all()
        pipe.close()


def request(kind, data):
    run = f"/api/evaluations/{data['run']}/"
    evaluation = f"/api/admin/evaluations/{data['evaluation']}/"
    user = f"/api/admin/users/{data['target']}/"
    if kind == "finalize":
        return "post", run + "finalize/", {}
    if kind == "score":
        return "put", run + f"responses/{data['question']}/", {"score": 9}
    if kind == "copy":
        return "post", evaluation + "versions/", {}
    if kind == "validate":
        return "post", evaluation + "validate/", {}
    if kind == "edit":
        return "put", evaluation, {"name": "Changed"}
    if kind == "remove_source":
        return "delete", evaluation, {}
    if kind == "deactivate":
        return "post", user + "deactivate/", {}
    if kind == "delete":
        return "delete", user, {}
    if kind in {"demote", "put_deactivate"}:
        return (
            "put",
            user,
            {
                "identifier": data["identifier"],
                "email": data["email"],
                **({"role": "Coach"} if kind == "demote" else {"is_active": False}),
            },
        )
    assert kind == "detach", kind
    return (
        "put",
        f"/api/admin/organizations/{data['organization']}/members/",
        {
            "user_ids": data["members"],
        },
    )
