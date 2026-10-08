import pytest

from assessments.models import Evaluation, EvaluationStatus
from tests.managed_user_helpers import csrf_post, csrf_put
from tests.taking_helpers import (
    client_for,
    complete,
    revision_answers,
    route,
    start,
    taking_context,
)
from tests.test_appreciation_markers import MARKERS, detail
from tests.test_evaluation_lifecycle import transition
from tests.test_evaluation_versions import new_version

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("completed", [False, True])
def test_run_snapshot_retains_exact_markers_after_new_version_and_revision(completed):
    _, coach, admin, run = taking_context()
    source = run.evaluation
    source.status = EvaluationStatus.DRAFT
    source.save(update_fields=["status"])
    question = source.questions.first()
    admin_client = client_for(admin)
    assert (
        csrf_put(
            admin_client,
            detail(question),
            {
                "name": question.name,
                "appreciation_markers": MARKERS,
            },
        ).status_code
        == 200
    )
    assert transition(admin_client, source, "validate").status_code == 200
    coach_client = client_for(coach)
    started = start(coach_client, run)
    assert started.status_code == 200
    assert started.json()["questions"][0]["appreciation_markers"] == MARKERS
    assert started.json()["questions"][1]["appreciation_markers"] == []
    if completed:
        assert complete(coach_client, run).status_code == 200
    copied = Evaluation.objects.get(pk=new_version(admin_client, source).json()["id"])
    assert (
        csrf_put(
            admin_client,
            detail(copied.questions.first()),
            {
                "name": question.name,
                "appreciation_markers": [{"score": 8, "text": "Nouveau texte"}],
            },
        ).status_code
        == 200
    )
    assert transition(admin_client, copied, "validate").status_code == 200
    # Even an out-of-band change must never feed reads/revisions of existing snapshots.
    source.questions.filter(pk=question.pk).update(appreciation_markers=[])
    response = coach_client.get(route(run))
    assert response.json()["questions"][0]["appreciation_markers"] == MARKERS
    if not completed:
        assert complete(coach_client, run).status_code == 200
    before = coach_client.get(route(run)).json()
    revision = csrf_put(admin_client, route(run, "revision"), revision_answers(run, 8))
    assert revision.status_code == 200
    assert revision.json()["questions"][0]["appreciation_markers"] == MARKERS
    assert revision.json()["completed_at"] == before["completed_at"]
    assert revision.json()["filled_by"] == before["filled_by"]
    assert all(q["score"] == 8 for q in revision.json()["questions"])
    assert (
        csrf_post(coach_client, route(run, "finalize"), {}).json()["questions"][0][
            "appreciation_markers"
        ]
        == MARKERS
    )
