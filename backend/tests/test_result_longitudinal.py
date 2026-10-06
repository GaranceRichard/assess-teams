import uuid
from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from assessments.application.expected_evaluations import ensure_expected_evaluation
from assessments.application.versioning import create_next_version
from assessments.models import EvaluationSchedule, Question
from tests.longitudinal_helpers import family_url, history_url, longitudinal_context
from tests.managed_user_helpers import csrf_post
from tests.results_helpers import another_run, results_context
from tests.taking_helpers import client_for, complete

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_organization_family_selects_highest_version_with_results_not_latest_completion():
    organization, _, admin, first, current = longitudinal_context()
    create_next_version(current.evaluation_id, admin)  # A newer draft without completed results.
    first.completed_at = timezone.now() + timedelta(days=30)
    first.save()
    client = client_for(admin)
    assert client.get(reverse("result-organizations")).json() == [
        {"id": organization.pk, "name": organization.name}
    ]
    families = client.get(reverse("result-families"), {"organization_id": organization.pk}).json()
    assert len(families) == 1
    assert families[0]["id"] == current.evaluation_id
    assert families[0]["version"] == 2
    radar = client.get(family_url(first)).json()
    assert radar["evaluation_id"] == current.evaluation_id
    assert radar["version"] == 2
    assert radar["teams"][0]["run_id"] == current.pk
    assert radar["axes"][0]["lineage_id"] == str(current.questions.first().lineage_id)


def test_history_has_every_completed_observation_in_chronological_order_and_snapshot_values():
    _, _, admin, first, current = longitudinal_context()
    middle = another_run(first)
    middle.completed_at = first.completed_at
    middle.save()
    another_run(current, state="in_progress")
    lineage = first.questions.first().lineage_id
    Question.objects.filter(evaluation__family_id=first.evaluation.family_id).update(name="Damaged")
    client = client_for(admin)
    response = client.get(history_url(current, lineage), {"team_ids": [current.team_id]})
    assert response.status_code == 200
    history = response.json()
    points = history["teams"][0]["points"]
    assert [p["run_id"] for p in points] == [first.pk, middle.pk, current.pk]
    assert [p["version"] for p in points] == [1, 1, 2]
    assert [p["score"] for p in points] == [0, 7, 0]
    assert [p["criterion_text"] for p in points] == ["Première question"] * 3
    assert client.get(history_url(current, lineage)).json()["teams"] == []


def test_copied_criterion_keeps_continuity_but_same_text_new_question_does_not():
    _, _, admin, first = results_context()
    source = first.evaluation.questions.first()
    version = create_next_version(first.evaluation_id, admin)
    copied = version.questions.get(lineage_id=source.lineage_id)
    copied.name, copied.index = "Renamed criterion", 9
    copied.save()
    version.questions.exclude(pk=copied.pk).delete()
    impostor = Question.objects.create(evaluation=version, index=1, name=source.name)
    client = client_for(admin)
    assert (
        csrf_post(
            client, reverse("evaluation-validate", kwargs={"evaluation_id": version.pk}), {}
        ).status_code
        == 200
    )
    schedule = EvaluationSchedule.objects.create(
        team=first.team,
        evaluation=version,
        assignee=first.assignee,
        mode="immediate",
        first_due_date=first.due_date,
    )
    current = ensure_expected_evaluation(schedule)
    assert complete(client, current).status_code == 200
    copied_history = client.get(
        history_url(current, copied.lineage_id), {"team_ids": [first.team_id]}
    ).json()["teams"][0]["points"]
    assert [(p["version"], p["criterion_text"], p["score"]) for p in copied_history] == [
        (1, source.name, 0),
        (2, "Renamed criterion", 10),
    ]
    new_history = client.get(
        history_url(current, impostor.lineage_id), {"team_ids": [first.team_id]}
    ).json()["teams"][0]["points"]
    assert [(p["version"], p["score"]) for p in new_history] == [(2, 0)]
    removed_lineage = first.questions.get(index=2).lineage_id
    assert client.get(history_url(current, removed_lineage)).status_code == 404
    assert client.get(history_url(current, uuid.uuid4())).status_code == 404


def test_history_has_distinct_series_and_rejects_a_team_with_only_older_version_results():
    organization, _, admin, first, current = longitudinal_context()
    from teams.models import Team

    second_team = Team.objects.create(organization=organization, name="Second")
    old_second = another_run(first, team=second_team)
    client = client_for(admin)
    lineage = current.questions.first().lineage_id
    url = history_url(current, lineage)
    assert client.get(url, {"team_ids": [second_team.pk]}).status_code == 404
    new_second = another_run(current, team=second_team)
    response = client.get(url, {"team_ids": [first.team_id, second_team.pk, first.team_id]})
    assert response.status_code == 200
    teams = response.json()["teams"]
    assert [team["team_id"] for team in teams] == [first.team_id, second_team.pk]
    assert {point["run_id"] for point in teams[0]["points"]} == {first.pk, current.pk}
    assert {point["run_id"] for point in teams[1]["points"]} == {old_second.pk, new_second.pk}
