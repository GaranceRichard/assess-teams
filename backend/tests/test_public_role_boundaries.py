import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from tests.identity_helpers import TEST_CREDENTIAL
from tests.isolation_helpers import business_snapshot, request, session

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["root", "admin", "coach", "viewer"])
@pytest.mark.parametrize("extra", [{"role": "Admin"}, {"is_superuser": True}, {"user_id": 1}])
def test_session_preference_cannot_change_privileges_or_target(isolation, role, extra):
    actor = isolation.root if role == "root" else getattr(isolation.a, role)
    client = session(actor)
    before = business_snapshot()

    response = request(
        client, "patch", reverse("session-current"), {"interface_palette": "blue", **extra}
    )

    assert response.status_code == 400
    assert business_snapshot() == before


@pytest.mark.parametrize("valid_token", [True, False])
def test_public_invitation_never_uses_forged_role_or_target(isolation, valid_token):
    target = isolation.a.viewer
    target.set_unusable_password()
    target.save(update_fields=["password"])
    token = default_token_generator.make_token(target) if valid_token else "invalid"
    url = reverse(
        "invitation-accept",
        kwargs={"uid": urlsafe_base64_encode(force_bytes(target.pk)), "token": token},
    )
    client = APIClient(enforce_csrf_checks=True)
    client.get(reverse("session-current"))
    before = business_snapshot()
    response = request(
        client,
        "post",
        url,
        {
            "password": TEST_CREDENTIAL,
            "role": "Admin",
            "is_superuser": True,
            "user_id": isolation.root.pk,
        },
    )

    assert response.status_code == (204 if valid_token else 400)
    target.refresh_from_db()
    assert target.role == "Viewer" and not target.is_superuser
    if valid_token:
        assert target.check_password(TEST_CREDENTIAL)
        saved_target = next(row for row in before["identities.User"] if row["id"] == target.pk)
        saved_target["password"] = target.password
        assert business_snapshot() == before
        # A public token sets only its owner's password; it never authenticates an administrator.
        assert client.get(reverse("session-current")).status_code == 403
        assert client.get(reverse("managed-user-list")).status_code == 403
        after = business_snapshot()
        assert request(client, "post", url, {"password": TEST_CREDENTIAL}).status_code == 400
        assert business_snapshot() == after
    else:
        assert business_snapshot() == before


@pytest.mark.contract
def test_openapi_describes_rejection_of_additional_administrative_fields():
    response = APIClient().get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    schema = response.json()
    for path, method in [("/api/admin/users/", "post"), ("/api/admin/users/{user_id}/", "put")]:
        operation = schema["paths"][path][method]
        assert "Champs supplémentaires refusés (400)" in operation["description"]
        assert "400" in operation["responses"]
        assert {"cookieAuth": []} in operation["security"]
        reference = operation["requestBody"]["content"]["application/json"]["schema"]["$ref"]
        properties = schema["components"]["schemas"][reference.split("/")[-1]]["properties"]
        assert {"is_superuser", "is_staff", "groups", "user_permissions"}.isdisjoint(properties)
