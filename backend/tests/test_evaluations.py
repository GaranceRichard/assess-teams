import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from assessments.models import Evaluation, Question
from identities.domain.users import Role
from identities.models import Organization, User
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
    organization = Organization.objects.create(name="North")
    evaluations = reverse("evaluation-list")
    first = csrf_post(
        client, evaluations, {"organization_id": organization.pk, "name": " First "}
    ).json()
    second = csrf_post(
        client, evaluations, {"organization_id": organization.pk, "name": "Second"}
    ).json()

    assert [item["name"] for item in client.get(evaluations).json()] == ["First", "Second"]
    assert "index" not in first
    assert list(Evaluation.objects.values_list("index", flat=True)) == [1, 2]

    updated = csrf_put(
        client,
        reverse("evaluation-detail", kwargs={"evaluation_id": first["id"]}),
        {"name": "Fondamentaux"},
    )
    questions = reverse("question-list", kwargs={"evaluation_id": first["id"]})
    earlier = csrf_post(client, questions, {"name": "Au début"}).json()
    later = csrf_post(client, questions, {"name": "Plus tard"}).json()
    renamed = csrf_put(
        client,
        reverse("question-detail", kwargs={"question_id": earlier["id"]}),
        {"name": "Question initiale"},
    )

    assert updated.json()["name"] == "Fondamentaux"
    assert "index" not in updated.json()
    assert [item["id"] for item in client.get(questions).json()] == [earlier["id"], later["id"]]
    assert list(Question.objects.values_list("index", flat=True)) == [1, 2]
    assert renamed.json()["name"] == "Question initiale"
    assert (
        csrf_delete(
            client, reverse("question-detail", kwargs={"question_id": later["id"]})
        ).status_code
        == 204
    )
    assert (
        csrf_delete(
            client, reverse("evaluation-detail", kwargs={"evaluation_id": first["id"]})
        ).status_code
        == 204
    )
    assert not Question.objects.exists()
    assert Evaluation.objects.filter(pk=second["id"]).exists()


@pytest.mark.django_db
@pytest.mark.api
def test_admin_can_manage_evaluations_in_its_organization() -> None:
    admin = create_user("admin", Role.ADMIN)
    organization = Organization.objects.create(name="North")
    organization.users.add(admin)
    client = logged_in_client(admin)

    response = csrf_post(
        client,
        reverse("evaluation-list"),
        {"organization_id": organization.pk, "name": "Référentiel"},
    )

    assert response.status_code == 201
    assert response.json()["organization_id"] == organization.pk
    assert client.get(reverse("evaluation-list")).json()[0]["name"] == "Référentiel"


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
def test_admin_cannot_access_another_organizations_evaluations() -> None:
    first_admin = create_user("first-admin", Role.ADMIN)
    second_admin = create_user("second-admin", Role.ADMIN)
    first = Organization.objects.create(name="First")
    second = Organization.objects.create(name="Second")
    first.users.add(first_admin)
    second.users.add(second_admin)
    visible = Evaluation.objects.create(organization=first, index=1, name="Visible")
    hidden = Evaluation.objects.create(organization=second, index=1, name="Hidden")
    question = Question.objects.create(evaluation=hidden, index=1, name="Secret")
    client = logged_in_client(first_admin)

    assert [item["id"] for item in client.get(reverse("evaluation-list")).json()] == [visible.pk]
    assert (
        csrf_post(
            client,
            reverse("evaluation-list"),
            {"organization_id": second.pk, "name": "Injected"},
        ).status_code
        == 404
    )
    detail = reverse("evaluation-detail", kwargs={"evaluation_id": hidden.pk})
    assert (
        client.get(reverse("question-list", kwargs={"evaluation_id": hidden.pk})).status_code == 404
    )
    assert csrf_put(client, detail, {"name": "Changed"}).status_code == 404
    assert csrf_delete(client, detail).status_code == 404
    assert (
        csrf_post(
            client,
            reverse("question-list", kwargs={"evaluation_id": hidden.pk}),
            {"name": "Injected"},
        ).status_code
        == 404
    )
    assert (
        csrf_delete(
            client, reverse("question-detail", kwargs={"question_id": question.pk})
        ).status_code
        == 404
    )
    assert Evaluation.objects.filter(pk=hidden.pk, name="Hidden").exists()


@pytest.mark.django_db
@pytest.mark.functional
@pytest.mark.api
@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_evaluation_management_refuses_unauthorized_roles(role: Role) -> None:
    client = logged_in_client(create_user("actor", role))
    assert client.get(reverse("evaluation-list")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_evaluation_management_requires_an_active_session() -> None:
    anonymous = APIClient()
    inactive = logged_in_client(create_user("inactive-admin", Role.ADMIN, is_active=False))
    assert anonymous.get(reverse("evaluation-list")).status_code == 403
    assert inactive.get(reverse("evaluation-list")).status_code == 403


@pytest.mark.django_db
@pytest.mark.api
def test_evaluation_and_question_validation_rejects_blank_names() -> None:
    client = logged_in_client(create_superuser())
    organization = Organization.objects.create(name="North")
    evaluations = reverse("evaluation-list")
    base = {"organization_id": organization.pk}
    created = csrf_post(client, evaluations, {**base, "index": 99, "name": "Valid"}).json()
    blank = csrf_post(client, evaluations, {**base, "name": "   "})
    questions = reverse("question-list", kwargs={"evaluation_id": created["id"]})
    csrf_post(client, questions, {"index": 99, "name": "Valid question"})
    blank_question = csrf_post(client, questions, {"name": "   "})

    assert blank.status_code == 400
    assert blank_question.status_code == 400
    assert Evaluation.objects.get().index == 1
    assert Question.objects.get().index == 1
