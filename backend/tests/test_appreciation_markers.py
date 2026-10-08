import pytest
from django.urls import reverse

from assessments.models import Evaluation, EvaluationStatus, Question
from identities.domain.users import Role
from identities.models import Organization
from journals.models import ActivityAction, ActivityEntry
from tests.identity_helpers import create_user
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.test_evaluation_lifecycle import context, transition
from tests.test_evaluation_versions import new_version
from tests.test_evaluations import logged_in_client

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]
MARKERS = [{"score": 0, "text": "À construire"}, {"score": 8, "text": "Partagé"}]


def detail(question):
    return reverse("question-detail", kwargs={"question_id": question.pk})


def test_markers_create_replace_remove_and_omission_preserves_them():
    client, evaluation, _ = context()
    collection = reverse("question-list", kwargs={"evaluation_id": evaluation.pk})
    created = csrf_post(client, collection, {"name": "Second", "appreciation_markers": MARKERS})
    assert created.status_code == 201
    question = Question.objects.get(pk=created.json()["id"])
    assert created.json()["appreciation_markers"] == MARKERS
    assert csrf_put(client, detail(question), {"name": "Renamed"}).status_code == 200
    question.refresh_from_db()
    assert question.appreciation_markers == MARKERS
    replacement = [{"score": 10, "text": "Réussi"}, {"score": 1, "text": "Réussi"}]
    response = csrf_put(
        client,
        detail(question),
        {
            "name": "Renamed",
            "appreciation_markers": replacement,
        },
    )
    assert response.status_code == 200
    assert response.json()["appreciation_markers"] == list(reversed(replacement))
    assert ActivityEntry.objects.filter(action=ActivityAction.QUESTION_UPDATED).count() == 2
    removed = csrf_put(client, detail(question), {"name": "Renamed", "appreciation_markers": []})
    assert removed.status_code == 200
    assert removed.json()["appreciation_markers"] == []
    question.refresh_from_db()
    assert question.appreciation_markers == []
    assert client.get(collection).json()[-1]["appreciation_markers"] == []


@pytest.mark.parametrize(
    "markers",
    [
        [{"score": -1, "text": "Non"}],
        [{"score": 11, "text": "Non"}],
        [{"score": 4.5, "text": "Non"}],
        [{"score": 4.0, "text": "Non"}],
        [{"score": True, "text": "Non"}],
        [{"score": "4", "text": "Non"}],
        [{"score": 5, "text": 42}],
        [{"score": 5, "text": ""}],
        [{"score": 5, "text": "   "}],
        [{"score": 5}],
        [{"text": "Non"}],
        None,
        {},
        [{"score": 5, "text": "Non", "question_id": 999}],
        [{"score": 5, "text": "Un"}, {"score": 5, "text": "Deux"}],
    ],
)
def test_invalid_markers_are_rejected_atomically_on_create_and_update(markers):
    client, evaluation, question = context()
    collection = reverse("question-list", kwargs={"evaluation_id": evaluation.pk})
    body = {"name": "Forged", "appreciation_markers": markers}
    assert csrf_post(client, collection, body).status_code == 400
    assert csrf_put(client, detail(question), body).status_code == 400
    question.refresh_from_db()
    assert (question.name, question.appreciation_markers) == ("Criterion", [])
    assert evaluation.questions.count() == 1
    assert not ActivityEntry.objects.exists()


@pytest.mark.parametrize("actor", ["admin", "superadmin"])
@pytest.mark.parametrize("state", EvaluationStatus.values)
def test_copy_preserves_markers_but_source_is_independent_and_immutable(actor, state):
    client, source, question = context(actor)
    assert (
        csrf_put(
            client, detail(question), {"name": question.name, "appreciation_markers": MARKERS}
        ).status_code
        == 200
    )
    if state != "DRAFT":
        assert transition(client, source, "validate").status_code == 200
    if state == "ARCHIVED":
        assert transition(client, source, "archive").status_code == 200
    copied = Evaluation.objects.get(pk=new_version(client, source).json()["id"]).questions.get()
    assert copied.appreciation_markers == MARKERS
    body = {"name": copied.name, "appreciation_markers": []}
    assert csrf_put(client, detail(copied), body).status_code == 200
    question.refresh_from_db()
    assert question.appreciation_markers == MARKERS
    if state != "DRAFT":
        assert csrf_put(client, detail(question), body).status_code == 400
        question.refresh_from_db()
        assert question.appreciation_markers == MARKERS


@pytest.mark.parametrize(
    "role,outsider,expected",
    [
        (Role.COACH, False, 403),
        (Role.VIEWER, False, 403),
        (Role.ADMIN, True, 404),
    ],
)
def test_marker_writes_enforce_role_and_organization(role, outsider, expected):
    _, evaluation, question = context()
    actor = create_user("outsider", role)
    organization = (
        Organization.objects.create(name="Other") if outsider else evaluation.organization
    )
    organization.users.add(actor)
    client = logged_in_client(actor)
    assert (
        csrf_put(
            client, detail(question), {"name": question.name, "appreciation_markers": MARKERS}
        ).status_code
        == expected
    )
    question.refresh_from_db()
    assert question.appreciation_markers == []
