from django.urls import reverse
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.application.versioning import create_next_version
from assessments.models import EvaluationSchedule
from tests.managed_user_helpers import csrf_post
from tests.results_helpers import results_context
from tests.taking_helpers import client_for, complete


def family_url(run):
    return reverse("result-family-comparison", kwargs={"family_id": run.evaluation.family_id})


def history_url(run, lineage):
    return reverse(
        "result-criterion-history",
        kwargs={
            "family_id": run.evaluation.family_id,
            "lineage_id": lineage,
        },
    )


def next_completed(run, actor):
    version = create_next_version(run.evaluation_id, actor)
    client = client_for(actor)
    assert (
        csrf_post(
            client, reverse("evaluation-validate", kwargs={"evaluation_id": version.pk}), {}
        ).status_code
        == 200
    )
    schedule = EvaluationSchedule.objects.create(
        evaluation=version,
        team=run.team,
        assignee=run.assignee,
        mode="immediate",
        first_due_date=timezone.localdate(),
    )
    current = ensure_expected_evaluation(schedule)
    assert complete(client, current).status_code == 200
    current.refresh_from_db()
    return current


def longitudinal_context():
    organization, coach, admin, first = results_context()
    current = next_completed(first, admin)
    return organization, coach, admin, first, current
