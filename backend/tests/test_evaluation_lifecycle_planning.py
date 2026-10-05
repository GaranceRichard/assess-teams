import pytest
from django.urls import reverse

from assessments.models import EvaluationStatus
from identities.domain.users import Role
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.test_evaluation_lifecycle import transition
from tests.test_evaluation_schedules import logged_in_client, payload, planning_context

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("state", [EvaluationStatus.DRAFT, EvaluationStatus.ARCHIVED])
def test_create_and_update_require_validated_evaluation(state):
    organization, team, evaluation = planning_context()
    admin = create_user("actor", Role.ADMIN)
    organization.users.add(admin)
    client = logged_in_client(admin)
    data = payload(organization, team, evaluation, "immediate")
    route = reverse("evaluation-schedule-list")
    created = csrf_post(client, route, data)
    assert created.status_code == 201
    evaluation.status = state
    evaluation.save(update_fields=["status"])
    assert csrf_post(client, route, data).status_code == 404
    detail = reverse("evaluation-schedule-detail", kwargs={"schedule_id": created.json()["id"]})
    assert csrf_put(client, detail, data).status_code == 404
    assert team.evaluation_schedules.get().evaluation_id == evaluation.pk


def test_archiving_keeps_existing_planning_and_blocks_new_or_modified_planning():
    organization, team, evaluation = planning_context()
    admin = create_user("actor", Role.ADMIN)
    organization.users.add(admin)
    client = logged_in_client(admin)
    route = reverse("evaluation-schedule-list")
    data = payload(organization, team, evaluation, "monthly")
    created = csrf_post(client, route, data)
    assert created.status_code == 201
    assert transition(client, evaluation, "archive").status_code == 200
    historical = client.get(route).json()
    assert historical[0]["evaluation_id"] == evaluation.pk
    assert historical[0]["evaluation_name"] == evaluation.name
    detail = reverse("evaluation-schedule-detail", kwargs={"schedule_id": created.json()["id"]})
    assert csrf_put(client, detail, data).status_code == 404
    assert not ActivityEntry.objects.filter(
        action=ActivityAction.EVALUATION_SCHEDULE_UPDATED
    ).exists()


def test_forged_evaluation_from_other_organization_cannot_create_or_update_planning():
    organization, team, evaluation = planning_context()
    foreign, foreign_team, foreign_evaluation = planning_context("South")
    admin = create_user("actor", Role.ADMIN)
    organization.users.add(admin)
    client = logged_in_client(admin)
    route = reverse("evaluation-schedule-list")
    data = payload(organization, team, evaluation, "immediate")
    created = csrf_post(client, route, data)
    assert created.status_code == 201
    forged = {**data, "evaluation_id": foreign_evaluation.pk}
    assert csrf_post(client, route, forged).status_code == 404
    detail = reverse("evaluation-schedule-detail", kwargs={"schedule_id": created.json()["id"]})
    assert csrf_put(client, detail, forged).status_code == 404
    forged_organization = payload(foreign, foreign_team, foreign_evaluation, "immediate")
    assert csrf_put(client, detail, forged_organization).status_code == 404
    assert team.evaluation_schedules.get().evaluation_id == evaluation.pk
