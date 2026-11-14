"""Independent SQLite peers synchronized around their first real write."""

from tests.sqlite_contention_process import configure, pause, receive


def child(pipe, path, kind, data):
    configure(path)
    from django.db import IntegrityError, connection, connections, transaction
    from rest_framework.test import APIClient

    from identities.models import Organization, User
    from journals.services import record_log
    from notifications.models import EmailNotification

    try:
        root = User.objects.get(pk=data["root"])
        # Keep a context loaded before a concurrent deletion, as middleware/workers can do.
        organization = Organization.objects.get(pk=data["organization"])
        client = APIClient(enforce_csrf_checks=True)
        client.defaults["HTTP_ORIGIN"] = "https://testserver"
        client.force_login(root)
        assert client.get("/api/session/", secure=True).status_code == 200
        client.defaults["HTTP_X_CSRFTOKEN"] = client.cookies["csrftoken"].value
        connection.ensure_connection()
        connection.cursor().execute("PRAGMA busy_timeout=3000")
        announced = False

        def sql(execute, query, params, many, context):
            nonlocal announced
            first = not announced and query.startswith(("UPDATE", "INSERT", "DELETE"))
            if first:
                announced = True
                pipe.send("write_attempt")
            result = execute(query, params, many, context)
            if first and data.get("hold"):
                assert connection.in_atomic_block
                pause(pipe, "written")
            return result

        pipe.send("ready")
        receive(pipe, "go")
        with connection.execute_wrapper(sql):
            if kind == "notification":
                try:
                    with transaction.atomic():
                        EmailNotification.objects.create(
                            organization=organization, recipient="synthetic@example.com"
                        )
                    outcome = [201, {}]
                except IntegrityError:
                    outcome = [409, {"detail": "Parent disappeared; no intention committed"}]
            elif kind == "log":
                entry = record_log(
                    organization=organization, level="INFO", source="system", message="Late trace"
                )
                outcome = [201, {"id": entry.pk}]
            else:
                route = f"/api/admin/organizations/{organization.pk}/"
                if kind == "team":
                    response = client.post(
                        route + "teams/", {"name": "Created", "coach_ids": []}, secure=True
                    )
                elif kind == "plan":
                    response = client.post(
                        "/api/admin/planning/",
                        {
                            "organization_id": organization.pk,
                            "team_id": data["team"],
                            "evaluation_id": data["evaluation"],
                            "assignee_id": data["coach"],
                            "mode": "immediate",
                        },
                        format="json",
                        secure=True,
                    )
                elif kind == "start":
                    response = client.post(
                        f"/api/evaluations/{data['run']}/", {}, format="json", secure=True
                    )
                else:
                    response = client.delete(route, secure=True)
                outcome = [response.status_code, response.json() if response.content else {}]
        pipe.send(["result", outcome])
    finally:
        connections.close_all()
        pipe.close()
