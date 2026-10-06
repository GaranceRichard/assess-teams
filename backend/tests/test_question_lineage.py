import uuid

import pytest
from django.db import IntegrityError, transaction
from django.urls import reverse

from assessments.application.versioning import create_next_version
from assessments.models import Question
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.results_helpers import results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_copy_and_draft_edits_preserve_lineage_and_new_question_gets_its_own():
    _, _, admin, original = results_context()
    source = original.evaluation
    copy = create_next_version(source.pk, admin)
    original_lineages = list(source.questions.values_list("lineage_id", flat=True))
    assert list(copy.questions.values_list("lineage_id", flat=True)) == original_lineages
    client = client_for(admin)
    question = copy.questions.first()
    response = csrf_put(
        client,
        reverse("question-detail", kwargs={"question_id": question.pk}),
        {"name": "Renamed copied criterion", "lineage_id": str(uuid.uuid4())},
    )
    assert response.status_code == 200
    question.refresh_from_db()
    assert question.lineage_id == original_lineages[0]
    created = csrf_post(
        client,
        reverse("question-list", kwargs={"evaluation_id": copy.pk}),
        {"name": source.questions.first().name, "lineage_id": str(original_lineages[0])},
    )
    assert created.status_code == 201
    assert Question.objects.get(pk=created.json()["id"]).lineage_id not in original_lineages
    question.delete()
    assert original.questions.filter(lineage_id=original_lineages[0]).exists()
    another = create_next_version(copy.pk, admin)
    assert list(another.questions.values_list("lineage_id", flat=True)) == list(
        copy.questions.values_list("lineage_id", flat=True)
    )


def test_source_and_lineage_are_snapshotted_and_not_read_from_the_current_question():
    _, _, _, run = results_context()
    snapshot = run.questions.first()
    original = snapshot.lineage_id
    assert original == snapshot.source_question.lineage_id
    Question.objects.filter(pk=snapshot.source_question_id).update(lineage_id=uuid.uuid4())
    snapshot.refresh_from_db()
    assert snapshot.lineage_id == original


def test_a_version_cannot_contain_the_same_lineage_twice():
    _, _, _, run = results_context()
    question = run.evaluation.questions.first()
    with pytest.raises(IntegrityError), transaction.atomic():
        Question.objects.create(
            evaluation=run.evaluation,
            index=99,
            name="Duplicate",
            lineage_id=question.lineage_id,
        )
