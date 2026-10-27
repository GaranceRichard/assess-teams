import pytest
from django.urls import reverse

from assessments.application.versioning import create_next_version
from assessments.models import Evaluation, Question
from teams.models import Team
from tests.longitudinal_helpers import family_url, history_url, longitudinal_context
from tests.results_helpers import another_run
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_available_versions_include_archives_but_exclude_versions_without_completed_results():
    org, _, admin, first, current = longitudinal_context()
    empty = create_next_version(current.evaluation_id, admin)
    client = client_for(admin)
    url = reverse("result-families")
    family = client.get(url, {"organization_id": org.pk}).json()[0]
    assert family["id"] == current.evaluation_id
    assert [(v["id"], v["version"], v["status"]) for v in family["versions"]] == [
        (first.evaluation_id, 1, "ARCHIVED"),
        (current.evaluation_id, 2, "VALIDATED"),
    ]
    assert client.get(family_url(first), {"evaluation_id": empty.pk}).status_code == 404
    # A family remains available after its last active version is archived.
    Evaluation.objects.filter(pk=current.evaluation_id).update(status="ARCHIVED")
    family = client.get(url, {"organization_id": org.pk}).json()[0]
    assert [v["status"] for v in family["versions"]] == ["ARCHIVED", "ARCHIVED"]
    assert client.get(family_url(first)).json()["evaluation_id"] == current.evaluation_id
    assert client.get(family_url(first), {"evaluation_id": first.evaluation_id}).status_code == 200


def test_exact_archived_radar_uses_own_snapshots_teams_scores_and_preserves_all_records():
    org, _, admin, first, current = longitudinal_context()
    old_team = Team.objects.create(organization=org, name="Historical team")
    older = another_run(first, team=old_team)
    current.questions.filter(index=1).update(text="Current criterion", score=6)
    Question.objects.filter(evaluation_id=first.evaluation_id).update(name="Damaged live text")
    client = client_for(admin)
    url = family_url(first)
    old = client.get(url, {"evaluation_id": first.evaluation_id}).json()
    assert old["evaluation_id"] == first.evaluation_id
    assert old["version"] == 1
    assert old["axes"][0]["text"] == "Première question"
    assert {t["run_id"] for t in old["teams"]} == {first.pk, older.pk}
    assert next(t for t in old["teams"] if t["run_id"] == first.pk)["scores"] == [0, 10]
    recent = client.get(url, {"evaluation_id": current.evaluation_id}).json()
    assert recent["version"] == 2
    assert recent["axes"][0]["text"] == "Current criterion"
    assert [t["run_id"] for t in recent["teams"]] == [current.pk]
    assert recent["teams"][0]["scores"] == [6, 10]
    first.evaluation.refresh_from_db()
    assert first.evaluation.status == "ARCHIVED"
    assert list(first.questions.values_list("score", flat=True)) == [0, 10]


def test_archived_history_accepts_its_own_teams_and_removed_criteria_only_by_explicit_lineage():
    org, _, admin, first, current = longitudinal_context()
    old_team = Team.objects.create(organization=org, name="Old only")
    historical = another_run(first, team=old_team)
    removed = first.questions.get(index=2).lineage_id
    current.questions.filter(index=2).delete()
    client = client_for(admin)
    url = history_url(first, removed)
    query = {"evaluation_id": first.evaluation_id, "team_ids": [old_team.pk]}
    assert client.get(url, {"team_ids": [old_team.pk]}).status_code == 404
    response = client.get(url, query)
    assert response.status_code == 200
    points = response.json()["teams"][0]["points"]
    assert [(p["run_id"], p["version"], p["score"]) for p in points] == [(historical.pk, 1, 3)]
    assert client.get(url, {"evaluation_id": current.evaluation_id}).status_code == 404
    shared = first.questions.get(index=1).lineage_id
    points = client.get(
        history_url(first, shared),
        {"evaluation_id": first.evaluation_id, "team_ids": [first.team_id]},
    ).json()["teams"][0]["points"]
    assert {p["run_id"] for p in points} == {first.pk, current.pk}
