import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import EvaluationStatus
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_superuser
from tests.test_evaluation_lifecycle import context, transition
from tests.test_evaluations import logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.api, pytest.mark.functional]


@pytest.mark.parametrize("action", ["validate", "archive"])
def test_lifecycle_requires_session_active_actor_and_csrf(action):
    _, evaluation, _ = context()
    if action == "archive":
        evaluation.status = EvaluationStatus.VALIDATED
        evaluation.save(update_fields=["status"])
    route = reverse(f"evaluation-{action}", kwargs={"evaluation_id": evaluation.pk})
    assert APIClient().post(route, {}).status_code == 403
    client = logged_in_client(create_superuser())
    assert client.post(route, {}, format="json").status_code == 403
    actor = create_superuser(username="inactive-root")
    actor.is_active = False
    actor.save(update_fields=["is_active"])
    assert transition(logged_in_client(actor), evaluation, action).status_code == 403
    evaluation.refresh_from_db()
    assert evaluation.status == (
        EvaluationStatus.DRAFT if action == "validate" else EvaluationStatus.VALIDATED
    )
    assert not ActivityEntry.objects.filter(
        action__in=[ActivityAction.EVALUATION_VALIDATED, ActivityAction.EVALUATION_ARCHIVED]
    ).exists()


def test_lifecycle_unknown_resource_and_inverse_methods_are_rejected():
    client, evaluation, _ = context()
    for action in ["validate", "archive"]:
        route = reverse(f"evaluation-{action}", kwargs={"evaluation_id": evaluation.pk + 1})
        response = client.post(route, {}, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)
        assert response.status_code == 404
    route = reverse("evaluation-validate", kwargs={"evaluation_id": evaluation.pk})
    assert client.get(route).status_code == 405
