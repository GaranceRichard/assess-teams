import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import Evaluation, Question
from identities.domain.users import Role
from identities.models import User
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put


def logged_in_client(user: User) -> APIClient:
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    client.get(reverse("session-current"))
    return client


def csrf_delete(client: APIClient, route: str):
    return client.delete(route, HTTP_X_CSRFTOKEN=client.cookies["csrftoken"].value)


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_superadmin_manages_ordered_evaluations_and_questions() -> None:
    client = logged_in_client(create_superuser())
    evaluations = reverse("evaluation-list")
    second = csrf_post(client, evaluations, {"index": 2, "name": "Second"}).json()
    first = csrf_post(client, evaluations, {"index": 1, "name": " First "}).json()

    assert [item["name"] for item in client.get(evaluations).json()] == ["First", "Second"]

    updated = csrf_put(
        client,
        reverse("evaluation-detail", kwargs={"evaluation_id": first["id"]}),
        {"index": 1, "name": "Fondamentaux"},
    )
    questions = reverse("question-list", kwargs={"evaluation_id": first["id"]})
    later = csrf_post(client, questions, {"index": 2, "name": "Plus tard"}).json()
    earlier = csrf_post(client, questions, {"index": 1, "name": "Au début"}).json()
    renamed = csrf_put(
        client,
        reverse("question-detail", kwargs={"question_id": earlier["id"]}),
        {"index": 1, "name": "Question initiale"},
    )

    assert updated.json()["name"] == "Fondamentaux"
    assert [item["id"] for item in client.get(questions).json()] == [earlier["id"], later["id"]]
    assert renamed.json()["name"] == "Question initiale"
    assert (
        csrf_delete(
            client,
            reverse("question-detail", kwargs={"question_id": later["id"]}),
        ).status_code
        == 204
    )
    assert (
        csrf_delete(
            client,
            reverse("evaluation-detail", kwargs={"evaluation_id": first["id"]}),
        ).status_code
        == 204
    )
    assert not Question.objects.exists()
    assert Evaluation.objects.filter(pk=second["id"]).exists()


@pytest.mark.django_db
@pytest.mark.api
def test_admin_can_manage_evaluations() -> None:
    client = logged_in_client(create_user("admin", Role.ADMIN))

    response = csrf_post(
        client,
        reverse("evaluation-list"),
        {"index": 1, "name": "Référentiel"},
    )

    assert response.status_code == 201
    assert client.get(reverse("evaluation-list")).json()[0]["name"] == "Référentiel"


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_evaluation_management_refuses_unauthorized_roles(role: Role) -> None:
    client = logged_in_client(create_user("actor", role))

    response = client.get(reverse("evaluation-list"))

    assert response.status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_evaluation_management_requires_an_active_session() -> None:
    anonymous = APIClient()
    inactive = logged_in_client(create_user("inactive-admin", Role.ADMIN, is_active=False))

    assert anonymous.get(reverse("evaluation-list")).status_code == 403
    assert inactive.get(reverse("evaluation-list")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_evaluation_and_question_validation_rejects_invalid_values() -> None:
    client = logged_in_client(create_superuser())
    evaluations = reverse("evaluation-list")
    created = csrf_post(client, evaluations, {"index": 1, "name": "Valid"}).json()

    duplicate = csrf_post(client, evaluations, {"index": 1, "name": "Duplicate"})
    blank = csrf_post(client, evaluations, {"index": 2, "name": "   "})
    invalid_index = csrf_post(client, evaluations, {"index": 0, "name": "Invalid"})
    questions = reverse("question-list", kwargs={"evaluation_id": created["id"]})
    csrf_post(client, questions, {"index": 1, "name": "Valid question"})
    duplicate_question = csrf_post(client, questions, {"index": 1, "name": "Duplicate"})

    assert duplicate.status_code == 400
    assert blank.status_code == 400
    assert invalid_index.status_code == 400
    assert duplicate_question.status_code == 400
    assert Evaluation.objects.count() == 1
    assert Question.objects.count() == 1
