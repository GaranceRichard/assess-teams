import pytest
from django.db import IntegrityError, connection, transaction
from django.urls import reverse

from assessments.models import QuestionScoreGuide
from journals.models import ActivityAction, ActivityEntry
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import client_for, taking_context
from tests.test_evaluations import csrf_delete

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]
GUIDES = [{"score": 0, "text": "À construire"}, {"score": 10, "text": "Partagé"}]


def draft():
    _, coach, admin, run = taking_context()
    evaluation = run.evaluation
    evaluation.status = "DRAFT"
    evaluation.save(update_fields=["status"])
    question = evaluation.questions.first()
    url = reverse("question-detail", kwargs={"question_id": question.pk})
    return client_for(admin), client_for(coach), evaluation, question, url


def test_optional_guides_create_replace_remove_and_name_only_preserves_them():
    client, _, evaluation, _, _ = draft()
    url = reverse("question-list", kwargs={"evaluation_id": evaluation.pk})
    created = csrf_post(client, url, {"name": "Critère", "score_guides": GUIDES})
    assert created.status_code == 201
    assert created.json()["score_guides"] == GUIDES
    detail = reverse("question-detail", kwargs={"question_id": created.json()["id"]})
    assert csrf_put(client, detail, {"name": "Renommé"}).json()["score_guides"] == GUIDES
    replacement = [{"score": 3, "text": "Un autre niveau"}]
    assert (
        csrf_put(client, detail, {"name": "Renommé", "score_guides": replacement}).json()[
            "score_guides"
        ]
        == replacement
    )
    assert ActivityEntry.objects.filter(action=ActivityAction.QUESTION_UPDATED).count() == 2
    assert (
        csrf_put(client, detail, {"name": "Renommé", "score_guides": []}).json()["score_guides"]
        == []
    )
    assert not QuestionScoreGuide.objects.exists()
    assert csrf_post(client, url, {"name": "Sans repère"}).json()["score_guides"] == []
    csrf_put(client, detail, {"name": "Renommé", "score_guides": GUIDES})
    assert csrf_delete(client, detail).status_code == 204
    assert not QuestionScoreGuide.objects.exists()


@pytest.mark.parametrize("invalid", [-1, 11, 1.5, 5.0, True, "5", None, {}, []])
def test_invalid_scores_do_not_mutate_question_or_previous_guides(invalid):
    client, _, _, question, url = draft()
    QuestionScoreGuide.objects.create(question=question, **GUIDES[0])
    response = csrf_put(
        client,
        url,
        {
            "name": "Forgé",
            "score_guides": [{"score": invalid, "text": "Refusé"}],
        },
    )
    assert response.status_code == 400
    question.refresh_from_db()
    assert question.name == "Première question"
    assert list(question.score_guides.values("score", "text")) == GUIDES[:1]
    assert not ActivityEntry.objects.exists()


@pytest.mark.parametrize(
    "guides",
    [
        [GUIDES[0], GUIDES[0]],
        [{"score": 2, "text": " "}],
        [{"score": 2}],
        [{"text": "Texte"}],
        [{"score": 2, "text": "Texte", "id": 99}],
        None,
        {},
        "text",
    ],
)
def test_invalid_structure_duplicate_or_blank_refuses_entire_write(guides):
    client, _, evaluation, _, url = draft()
    assert csrf_put(client, url, {"name": "Forgé", "score_guides": guides}).status_code == 400
    collection = reverse("question-list", kwargs={"evaluation_id": evaluation.pk})
    assert (
        csrf_post(client, collection, {"name": "Forgé", "score_guides": guides}).status_code == 400
    )
    assert evaluation.questions.count() == 2
    assert not QuestionScoreGuide.objects.exists()


@pytest.mark.parametrize("state", ["VALIDATED", "ARCHIVED"])
def test_published_and_archived_guides_are_immutable(state):
    client, _, evaluation, question, url = draft()
    QuestionScoreGuide.objects.create(question=question, **GUIDES[0])
    evaluation.status = state
    evaluation.save(update_fields=["status"])
    assert csrf_put(client, url, {"name": question.name, "score_guides": []}).status_code == 400
    assert question.score_guides.count() == 1


def test_tenant_and_role_refusals_cannot_replace_guides():
    _, coach, _, question, url = draft()
    other, _, _, _, _ = draft_other()
    for client, expected in [(other, 404), (coach, 403)]:
        assert (
            csrf_put(client, url, {"name": question.name, "score_guides": GUIDES}).status_code
            == expected
        )
    assert not question.score_guides.exists()


def draft_other():
    _, coach, admin, run = taking_context("Other")
    return (
        client_for(admin),
        client_for(coach),
        run.evaluation,
        run.evaluation.questions.first(),
        "",
    )


@pytest.mark.integration
def test_database_guarantees_unique_level_and_integer_bounds():
    _, _, _, question, _ = draft()
    QuestionScoreGuide.objects.create(question=question, **GUIDES[0])
    with pytest.raises(IntegrityError), transaction.atomic():
        QuestionScoreGuide.objects.create(question=question, **GUIDES[0])
    for score, text in [(-1, "Texte"), (11, "Texte"), (2.5, "Texte"), (2, "")]:
        with pytest.raises(IntegrityError), transaction.atomic(), connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO assessments_questionscoreguide (question_id, score, text) "
                "VALUES (%s, %s, %s)",
                [question.pk, score, text],
            )


@pytest.mark.parametrize("text", [None, 123, True, [], {}])
def test_appreciations_require_free_text_strings(text):
    client, _, _, question, url = draft()
    response = csrf_put(
        client,
        url,
        {
            "name": question.name,
            "score_guides": [{"score": 3, "text": text}],
        },
    )
    assert response.status_code == 400
    assert not question.score_guides.exists()
