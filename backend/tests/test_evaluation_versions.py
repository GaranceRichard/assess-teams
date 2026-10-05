import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse

from assessments.models import Evaluation, EvaluationFamily, EvaluationStatus, Question
from journals.models import ActivityAction, ActivityEntry
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.test_evaluation_lifecycle import context, transition
from tests.test_evaluations import csrf_delete

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def new_version(client, evaluation, body=None):
    return csrf_post(
        client,
        reverse("evaluation-new-version", kwargs={"evaluation_id": evaluation.pk}),
        body or {},
    )


def test_creation_assigns_an_organization_family_and_initial_draft():
    client, source, _ = context()
    response = csrf_post(
        client,
        reverse("evaluation-list"),
        {
            "organization_id": source.organization_id,
            "name": "Maturité Agile",
            "family_id": source.family_id,
            "version": 99,
            "status": "VALIDATED",
        },
    )
    assert response.status_code == 201
    data = response.json()
    created = Evaluation.objects.get(pk=data["id"])
    assert data["family_id"] != source.family_id
    assert (data["family_name"], data["version"], data["status"]) == (
        "Maturité Agile",
        1,
        "DRAFT",
    )
    assert created.family.organization_id == source.organization_id
    assert created.family.next_version == 2


@pytest.mark.parametrize("state", EvaluationStatus.values)
def test_new_version_copies_exact_content_and_order_without_changing_source(state):
    client, source, question = context()
    source.status = state
    source.save(update_fields=["status"])
    Question.objects.create(evaluation=source, index=7, name="Later criterion")
    before = list(source.questions.values_list("pk", "index", "name"))
    response = new_version(client, source, {"family_id": 987654, "version": 99})
    assert response.status_code == 201
    data = response.json()
    created = Evaluation.objects.get(pk=data["id"])
    assert (created.family_id, created.version, created.status) == (source.family_id, 2, "DRAFT")
    assert created.name == source.name
    assert list(created.questions.values_list("index", "name")) == [
        (1, "Criterion"),
        (7, "Later criterion"),
    ]
    assert not set(created.questions.values_list("pk", flat=True)) & {row[0] for row in before}
    source.refresh_from_db()
    assert (source.name, source.status, source.version) == ("Model", state, 1)
    assert list(source.questions.values_list("pk", "index", "name")) == before
    entry = ActivityEntry.objects.get(action=ActivityAction.EVALUATION_VERSION_CREATED)
    assert f"v2 (famille #{source.family_id})" in entry.description
    assert "depuis v1" in entry.description
    detail = reverse("evaluation-detail", kwargs={"evaluation_id": created.pk})
    assert csrf_put(client, detail, {"name": "Changed"}).status_code == 200
    copied = created.questions.get(index=1)
    assert (
        csrf_put(
            client,
            reverse("question-detail", kwargs={"question_id": copied.pk}),
            {
                "name": "Changed criterion",
            },
        ).status_code
        == 200
    )
    question.refresh_from_db()
    assert question.name == "Criterion"


def test_sequence_never_reuses_a_deleted_draft_number():
    client, source, _ = context()
    second = Evaluation.objects.get(pk=new_version(client, source).json()["id"])
    assert (
        csrf_delete(
            client, reverse("evaluation-detail", kwargs={"evaluation_id": second.pk})
        ).status_code
        == 204
    )
    third = new_version(client, source).json()
    fourth = new_version(client, source).json()
    assert (third["version"], fourth["version"]) == (3, 4)
    assert EvaluationFamily.objects.count() == 1


def test_validation_replaces_the_active_version_and_journals_both_transitions():
    client, first, _ = context()
    assert transition(client, first, "validate").status_code == 200
    second = Evaluation.objects.get(pk=new_version(client, first).json()["id"])
    assert transition(client, second, "validate").status_code == 200
    first.refresh_from_db()
    assert first.status == EvaluationStatus.ARCHIVED
    assert list(first.family.versions.filter(status="VALIDATED").values_list("pk", flat=True)) == [
        second.pk
    ]
    archived = ActivityEntry.objects.get(action=ActivityAction.EVALUATION_ARCHIVED)
    assert "automatique" in archived.description and "v1" in archived.description
    assert transition(client, first, "validate").status_code == 400
    assert (
        csrf_put(
            client,
            reverse("evaluation-detail", kwargs={"evaluation_id": first.pk}),
            {"name": "Forged"},
        ).status_code
        == 400
    )


@pytest.mark.parametrize("invalid", ["empty", "blank"])
def test_invalid_new_version_does_not_archive_active_version(invalid):
    client, first, _ = context()
    transition(client, first, "validate")
    second = Evaluation.objects.get(pk=new_version(client, first).json()["id"])
    if invalid == "empty":
        second.questions.all().delete()
    else:
        second.questions.update(name="   ")
    assert transition(client, second, "validate").status_code == 400
    first.refresh_from_db()
    assert first.status == EvaluationStatus.VALIDATED
    assert not ActivityEntry.objects.filter(action=ActivityAction.EVALUATION_ARCHIVED).exists()


def test_database_enforces_unique_number_and_single_validated_version():
    client, first, _ = context()
    second = Evaluation.objects.get(pk=new_version(client, first).json()["id"])
    with pytest.raises(IntegrityError), transaction.atomic():
        Evaluation.objects.filter(pk=second.pk).update(version=1)
    transition(client, first, "validate")
    with pytest.raises(IntegrityError), transaction.atomic():
        Evaluation.objects.filter(pk=second.pk).update(status="VALIDATED")
    with pytest.raises(IntegrityError), transaction.atomic():
        Evaluation.objects.filter(pk=second.pk).update(version=0)


def test_failed_copy_rolls_back_version_allocation_and_journal(monkeypatch):
    client, first, _ = context()

    def fail(*args, **kwargs):
        raise RuntimeError("copy failed")

    monkeypatch.setattr(Question.objects, "bulk_create", fail)
    with pytest.raises(RuntimeError, match="copy failed"):
        new_version(client, first)
    first.family.refresh_from_db()
    assert first.family.next_version == 2
    assert first.family.versions.count() == 1
    assert not ActivityEntry.objects.exists()
