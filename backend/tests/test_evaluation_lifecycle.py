import pytest
from django.urls import reverse

from assessments.models import Evaluation, EvaluationStatus, Question
from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_superuser, create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.test_evaluations import csrf_delete, logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def transition(client, evaluation, action):
    return csrf_post(
        client, reverse(f"evaluation-{action}", kwargs={"evaluation_id": evaluation.pk}), {}
    )


def context(actor_kind="admin"):
    organization = Organization.objects.create(name="North")
    actor = create_superuser() if actor_kind == "superadmin" else create_user("admin", Role.ADMIN)
    if not actor.is_superuser:
        organization.users.add(actor)
    evaluation = Evaluation.objects.create(organization=organization, index=1, name="Model")
    question = Question.objects.create(evaluation=evaluation, index=1, name="Criterion")
    return logged_in_client(actor), evaluation, question


def test_creation_is_a_draft_even_with_forged_status():
    client, evaluation, _ = context()
    response = csrf_post(
        client,
        reverse("evaluation-list"),
        {"organization_id": evaluation.organization_id, "name": "New", "status": "VALIDATED"},
    )
    assert response.status_code == 201
    assert response.json()["status"] == EvaluationStatus.DRAFT
    assert Evaluation.objects.get(pk=response.json()["id"]).status == EvaluationStatus.DRAFT


@pytest.mark.parametrize("actor_kind", ["admin", "superadmin"])
def test_validation_and_archive_are_explicit_audited_and_preserve_questions(actor_kind):
    client, evaluation, question = context(actor_kind)
    validated = transition(client, evaluation, "validate")
    assert validated.status_code == 200
    assert validated.json()["status"] == EvaluationStatus.VALIDATED
    archived = transition(client, evaluation, "archive")
    assert archived.status_code == 200
    assert archived.json()["status"] == EvaluationStatus.ARCHIVED
    assert [item["id"] for item in client.get(reverse("evaluation-list")).json()] == [evaluation.pk]
    assert client.get(reverse("question-list", kwargs={"evaluation_id": evaluation.pk})).json() == [
        {"id": question.pk, "index": 1, "name": "Criterion"}
    ]
    for action in [ActivityAction.EVALUATION_VALIDATED, ActivityAction.EVALUATION_ARCHIVED]:
        entry = ActivityEntry.objects.get(action=action)
        assert entry.organization_id == evaluation.organization_id
        assert str(entry.actor_id) == client.session["_auth_user_id"]


@pytest.mark.parametrize("invalid", ["name", "questions"])
def test_validation_refuses_incomplete_drafts_without_a_success_journal(invalid):
    client, evaluation, _ = context()
    if invalid == "name":
        evaluation.name = "   "
        evaluation.save(update_fields=["name"])
    else:
        evaluation.questions.all().delete()
    response = transition(client, evaluation, "validate")
    evaluation.refresh_from_db()
    assert response.status_code == 400
    assert invalid in response.json()
    assert evaluation.status == EvaluationStatus.DRAFT
    assert not ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_VALIDATED).exists()


@pytest.mark.parametrize("state", [EvaluationStatus.VALIDATED, EvaluationStatus.ARCHIVED])
def test_all_evaluation_and_question_mutations_refused_for_immutable_models(state):
    client, evaluation, question = context()
    evaluation.status = state
    evaluation.save(update_fields=["status"])
    detail = reverse("evaluation-detail", kwargs={"evaluation_id": evaluation.pk})
    question_detail = reverse("question-detail", kwargs={"question_id": question.pk})
    questions = reverse("question-list", kwargs={"evaluation_id": evaluation.pk})
    assert csrf_put(client, detail, {"name": "Injected", "status": "DRAFT"}).status_code == 400
    assert csrf_delete(client, detail).status_code == 400
    assert csrf_post(client, questions, {"name": "Injected"}).status_code == 400
    assert csrf_put(client, question_detail, {"name": "Injected", "index": 2}).status_code == 400
    assert csrf_delete(client, question_detail).status_code == 400
    evaluation.refresh_from_db()
    question.refresh_from_db()
    assert (evaluation.name, evaluation.status) == ("Model", state)
    assert (question.name, question.index) == ("Criterion", 1)
    assert evaluation.questions.count() == 1
    assert not ActivityEntry.objects.exists()


@pytest.mark.parametrize(
    "state,action",
    [
        (EvaluationStatus.DRAFT, "archive"),
        (EvaluationStatus.VALIDATED, "validate"),
        (EvaluationStatus.ARCHIVED, "validate"),
        (EvaluationStatus.ARCHIVED, "archive"),
    ],
)
def test_forbidden_transitions_have_no_side_effect(state, action):
    client, evaluation, _ = context()
    evaluation.status = state
    evaluation.save(update_fields=["status"])
    assert transition(client, evaluation, action).status_code == 400
    evaluation.refresh_from_db()
    assert evaluation.status == state
    assert not ActivityEntry.objects.exists()


@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_lifecycle_refuses_non_admins(role):
    _, evaluation, _ = context()
    actor = create_user("unauthorized", role)
    evaluation.organization.users.add(actor)
    client = logged_in_client(actor)
    for action in ["validate", "archive"]:
        assert transition(client, evaluation, action).status_code == 403


def test_admin_cannot_transition_or_mutate_another_organization():
    _, evaluation, question = context()
    other = Organization.objects.create(name="South")
    actor = create_user("outsider", Role.ADMIN)
    other.users.add(actor)
    client = logged_in_client(actor)
    for action in ["validate", "archive"]:
        assert transition(client, evaluation, action).status_code == 404
    assert (
        csrf_put(
            client,
            reverse("question-detail", kwargs={"question_id": question.pk}),
            {"name": "Injected"},
        ).status_code
        == 404
    )
    evaluation.refresh_from_db()
    assert evaluation.status == EvaluationStatus.DRAFT
    assert not ActivityEntry.objects.exists()
