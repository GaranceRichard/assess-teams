from urllib.parse import urlparse

from django.core import mail
from django.urls import reverse
from rest_framework.test import APIClient

from tests.identity_helpers import create_superuser


def authenticated_superadmin_client() -> tuple[APIClient, object]:
    client = APIClient(enforce_csrf_checks=True)
    user = create_superuser()
    client.force_login(user)
    client.get(reverse("session-current"))
    return client, user


def csrf_post(client: APIClient, route: str, data: dict):
    return client.post(
        route,
        data,
        format="json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


def csrf_put(client: APIClient, route: str, data: dict):
    return client.put(
        route,
        data,
        format="json",
        HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
    )


def invitation_route() -> str:
    path = urlparse(mail.outbox[-1].body.split()[-1]).path
    _, prefix, uid, token = path.rstrip("/").split("/")
    assert prefix == "invitation"
    return reverse("invitation-accept", kwargs={"uid": uid, "token": token})
