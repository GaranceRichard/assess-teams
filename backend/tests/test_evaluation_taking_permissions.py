import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", [Role.COACH, Role.ADMIN])
def test_cross_organization_ids_and_payloads_are_inaccessible(role):
    organization, _, _, _ = taking_context("North")
    _, south_coach, _, hidden = taking_context("South")
    complete(client_for(south_coach), hidden)
    actor = create_user("actor", role)
    organization.users.add(actor)
    client = client_for(actor)
    for endpoint in [route(hidden), route(hidden, "finalize"), route(hidden, "revision")]:
        assert client.get(endpoint).status_code in (404, 405)
    assert start(client, hidden).status_code == 404
    assert csrf_post(client, route(hidden, "finalize"), {}).status_code == 404
    assert csrf_put(client, route(hidden, "revision"), revision_answers(hidden)).status_code == 404
    question_id = hidden.questions.first().source_question_id
    assert csrf_put(client, route(hidden, "score", question_id), {"score": 4}).status_code == 404
    listed = client.get(reverse("evaluation-run-list"), {"organization_id": hidden.organization_id})
    assert all(row["organization_id"] == organization.pk for row in listed.json())


def test_non_assigned_coach_cannot_see_or_change_a_colleagues_evaluation():
    organization, _, _, run = taking_context()
    colleague = create_user("colleague", Role.COACH)
    organization.users.add(colleague)
    run.team.coaches.add(colleague)
    client = client_for(colleague)
    assert client.get(reverse("evaluation-run-list")).json() == []
    assert client.get(route(run)).status_code == 404
    assert start(client, run).status_code == 404


@pytest.mark.parametrize("role", [Role.VIEWER, None])
def test_viewer_and_anonymous_have_no_taking_rights(role):
    organization, _, _, run = taking_context()
    client = APIClient()
    if role:
        viewer = create_user("viewer", role)
        organization.users.add(viewer)
        client = client_for(viewer)
    assert client.get(reverse("evaluation-run-list")).status_code == 403
    assert client.get(route(run)).status_code == 403
    assert client.post(route(run), {}, format="json").status_code == 403


def test_superadmin_retains_global_access_and_admin_without_membership_sees_nothing():
    _, coach, _, run = taking_context()
    _, _, _, other = taking_context("South")
    root = client_for(create_superuser())
    assert len(root.get(reverse("evaluation-run-list")).json()) == 2
    assert complete(root, run).status_code == 200
    assert csrf_put(root, route(run, "revision"), revision_answers(run)).status_code == 200
    assert root.get(route(other)).status_code == 200
    unassigned = client_for(create_user("unassigned-admin", Role.ADMIN))
    assert unassigned.get(reverse("evaluation-run-list")).json() == []
    assert start(unassigned, run).status_code == 404
    run.organization.users.remove(coach)
    assert client_for(coach).get(route(run)).status_code == 404


def test_csrf_is_required_on_taking_writes():
    _, coach, _, run = taking_context()
    client = client_for(coach)
    assert client.post(route(run), {}, format="json").status_code == 403
