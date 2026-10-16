"""Real API requests with signals after reads or business/Journal writes."""

from unittest.mock import patch

from tests.sqlite_contention_process import pause


def api_operation(pipe, kind, data, stack):
    from django.urls import reverse
    from rest_framework.test import APIClient

    from identities.models import User
    from teams.adapters.api import views

    client = APIClient(enforce_csrf_checks=True)
    client.defaults["HTTP_ORIGIN"] = "https://testserver"
    client.force_login(User.objects.get(pk=data["admin"]))
    assert client.get(reverse("session-current"), secure=True).status_code == 200
    if kind == "api_hold":
        original = views.team_created

        def journal(*args):
            original(*args)
            pause(pipe, "written")

        stack.enter_context(patch.object(views, "team_created", journal))
    if kind == "api_upgrade":
        original = views.manageable_team

        def read(*args):
            team = original(*args)
            pause(pipe, "read")
            return team

        stack.enter_context(patch.object(views, "manageable_team", read))

    def invoke():
        if kind == "api_upgrade":
            response = client.delete(
                reverse("team-detail", kwargs={"team_id": data["team"]}),
                secure=True,
                HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
            )
        else:
            response = client.post(
                reverse("team-list", kwargs={"organization_id": data["organization"]}),
                {"name": data["name"], "coach_ids": []},
                format="json",
                secure=True,
                HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
            )
        return [response.status_code, response.data, response["X-Correlation-ID"]]

    return invoke
