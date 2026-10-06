import pytest
from django.contrib import admin
from django.contrib.auth.tokens import default_token_generator
from django.test import RequestFactory
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from identities.domain.users import Role
from identities.models import User
from tests.identity_helpers import TEST_CREDENTIAL, create_user
from tests.managed_user_helpers import authenticated_superadmin_client, csrf_post, csrf_put
from tests.taking_helpers import taking_context
from tests.test_user_lifecycle import activation

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_real_existing_session_and_new_login_cannot_act_after_deactivation():
    actor = create_user("actor", Role.COACH)
    client = APIClient(enforce_csrf_checks=True)
    client.get(reverse("session-current"))
    payload = {"username": actor.username, "password": TEST_CREDENTIAL}
    assert csrf_post(client, reverse("session-login"), payload).status_code == 200
    root_client, _ = authenticated_superadmin_client()
    assert activation(root_client, actor).status_code == 200
    for name in [
        "session-current",
        "dashboard",
        "managed-user-list",
        "evaluation-run-list",
        "activity-journal",
        "logs",
        "steering",
    ]:
        assert client.get(reverse(name)).status_code == 403
    assert (
        client.patch(
            reverse("session-current"),
            {"interface_palette": "red"},
            format="json",
            HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value,
        ).status_code
        == 403
    )
    assert csrf_post(client, reverse("session-login"), payload).status_code == 401
    assert activation(root_client, actor, True).status_code == 200
    assert csrf_post(client, reverse("session-login"), payload).status_code == 200


@pytest.mark.parametrize("duplicate_field", ["identifier", "email"])
def test_invitation_refuses_inactive_identity_without_reactivation_or_duplicate(duplicate_field):
    client, _ = authenticated_superadmin_client()
    target = create_user("existing", Role.VIEWER, is_active=False)
    target.email = "existing@example.com"
    target.save(update_fields=["email"])
    data = {"identifier": "new", "email": "new@example.com", "role": "Viewer"}
    data[duplicate_field] = (
        target.username.upper() if duplicate_field == "identifier" else target.email.upper()
    )
    before = User.objects.count()
    response = csrf_post(client, reverse("managed-user-list"), data)
    assert response.status_code == 400 and "réactivez" in str(response.json())
    assert User.objects.count() == before
    target.refresh_from_db()
    assert not target.is_active


def test_pending_invitation_cannot_set_password_while_disabled():
    target = User.objects.create(username="pending", email="pending@example.com", role="Viewer")
    target.set_unusable_password()
    target.save()
    token = default_token_generator.make_token(target)
    client, _ = authenticated_superadmin_client()
    assert activation(client, target).status_code == 200
    anonymous = APIClient(enforce_csrf_checks=True)
    anonymous.get(reverse("session-current"))
    url = reverse(
        "invitation-accept",
        kwargs={"uid": urlsafe_base64_encode(force_bytes(target.pk)), "token": token},
    )
    assert csrf_post(anonymous, url, {"password": TEST_CREDENTIAL}).status_code == 400
    target.refresh_from_db()
    assert not target.has_usable_password() and not target.is_active


def test_inactive_user_is_not_a_candidate_for_organization_team_or_schedule():
    organization, coach, actor, run = taking_context()
    client, _ = authenticated_superadmin_client()
    assert activation(client, coach).status_code == 200
    newcomer = create_user("newcomer", Role.VIEWER, is_active=False)
    response = csrf_put(
        client,
        reverse("organization-members", kwargs={"organization_id": organization.pk}),
        {"user_ids": [actor.pk, coach.pk, newcomer.pk]},
    )
    assert response.status_code == 400
    assert (
        csrf_post(
            client,
            reverse("team-list", kwargs={"organization_id": organization.pk}),
            {"name": "New", "coach_ids": [coach.pk]},
        ).status_code
        == 400
    )
    assert (
        csrf_put(
            client,
            reverse("evaluation-schedule-detail", kwargs={"schedule_id": run.schedule_id}),
            {
                "organization_id": organization.pk,
                "evaluation_id": run.evaluation_id,
                "team_id": run.team_id,
                "assignee_id": coach.pk,
                "mode": "immediate",
            },
        ).status_code
        == 404
    )
    # Existing references remain explainable in the administrative representations.
    run.team.coaches.add(coach)
    team = client.get(reverse("team-list", kwargs={"organization_id": organization.pk})).json()[0]
    assert team["coaches"][0]["is_active"] is False


def test_django_admin_has_no_standard_mutation_or_delete_path():
    _, root = authenticated_superadmin_client()
    request = RequestFactory().get("/admin/")
    request.user = root
    model_admin = admin.site._registry[User]
    assert not model_admin.has_add_permission(request)
    assert not model_admin.has_change_permission(request)
    assert not model_admin.has_delete_permission(request)
    assert model_admin.get_actions(request) == {}


def test_lifecycle_notice_after_commit_describes_state_and_skips_absent_email(
    django_capture_on_commit_callbacks,
    settings,
):
    from django.core import mail

    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    target = create_user("target", Role.COACH)
    client, _ = authenticated_superadmin_client()
    with django_capture_on_commit_callbacks(execute=True):
        assert activation(client, target).status_code == 200
    assert not mail.outbox
    target.email = "target@example.com"
    target.save(update_fields=["email"])
    with django_capture_on_commit_callbacks(execute=True):
        assert activation(client, target, True).status_code == 200
        assert activation(client, target, True).status_code == 200
    assert len(mail.outbox) == 1 and "actif" in mail.outbox[0].body
    with django_capture_on_commit_callbacks(execute=True):
        assert activation(client, target).status_code == 200
    assert len(mail.outbox) == 2 and "désactivé" in mail.outbox[1].body
