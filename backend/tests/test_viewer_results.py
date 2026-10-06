import pytest
from django.urls import reverse

from assessments.application.results import completed_results_for
from assessments.application.taking_scope import evaluation_runs_for
from assessments.models import Evaluation, EvaluationRun, EvaluationRunState
from identities.domain.users import Role
from teams.models import Team
from tests.identity_helpers import create_user
from tests.longitudinal_helpers import family_url, history_url, longitudinal_context
from tests.results_helpers import another_run, comparison_url, results_context
from tests.taking_helpers import client_for, route

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def viewer_client(organization):
    viewer = create_user("results-viewer", Role.VIEWER)
    organization.users.add(viewer)
    return viewer, client_for(viewer)


def test_viewer_reads_completed_versions_and_teams_without_assignment():
    org, _, admin, run = results_context()
    viewer, client = viewer_client(org)
    second_team = Team.objects.create(organization=org, name="Other team", is_active=False)
    second = another_run(run, team=second_team)
    latest = another_run(run, days=2)
    latest.assignee = admin
    latest.save()
    another_run(run, days=3, state=EvaluationRunState.IN_PROGRESS, scores=(9, 9))
    waiting_team = Team.objects.create(organization=org, name="Waiting team")
    another_run(run, team=waiting_team, state=EvaluationRunState.NOT_STARTED)
    pending = Evaluation.objects.create(
        organization=org, family=run.evaluation.family, version=2, index=2, name="Pending"
    )
    assert client.get(reverse("result-organizations")).json() == [{"id": org.pk, "name": org.name}]
    versions = client.get(reverse("result-versions")).json()
    assert [v["id"] for v in versions] == [run.evaluation_id]
    families = client.get(reverse("result-families"), {"organization_id": org.pk}).json()
    assert [f["id"] for f in families] == [run.evaluation_id]
    assert client.get(f"/api/results/versions/{pending.pk}/").status_code == 404
    for url in (comparison_url(run), family_url(run)):
        response = client.get(url)
        assert response.status_code == 200
        teams = response.json()["teams"]
        assert {t["run_id"] for t in teams} == {latest.pk, second.pk}
        assert {t["team_id"] for t in teams} == {run.team_id, second_team.pk}
        assert all(t["scores"] == [7, 3] for t in teams)
    assert not evaluation_runs_for(viewer).exists()
    assert client.get(route(run)).status_code == 403
    assert client.get("/api/evaluations/").status_code == 403


def test_viewer_longitudinal_is_completed_only_and_rejects_foreign_ids():
    org, _, admin, first, current = longitudinal_context()
    _, client = viewer_client(org)
    foreign_org, _, _, foreign = results_context("Foreign")
    current.assignee = admin
    current.save()
    pending = another_run(current, days=3, state=EvaluationRunState.IN_PROGRESS)
    lineage = current.questions.first().lineage_id
    pending.questions.filter(index=1).update(lineage_id=lineage)
    foreign.questions.filter(index=1).update(lineage_id=lineage)
    assert client.get(family_url(current)).json()["evaluation_id"] == current.evaluation_id
    history = client.get(history_url(current, lineage), {"team_ids": [first.team_id]})
    assert history.status_code == 200
    points = history.json()["teams"][0]["points"]
    assert {p["run_id"] for p in points} == {first.pk, current.pk}
    assert {p["evaluation_id"] for p in points} == {first.evaluation_id, current.evaluation_id}
    assert (
        client.get(reverse("result-families"), {"organization_id": foreign_org.pk}).status_code
        == 404
    )
    assert client.get(comparison_url(foreign)).status_code == 404
    assert client.get(family_url(foreign)).status_code == 404
    assert client.get(history_url(foreign, lineage)).status_code == 404
    for ids in ([foreign.team_id], [first.team_id, foreign.team_id]):
        assert client.get(history_url(current, lineage), {"team_ids": ids}).status_code == 404
    foreign_lineage = foreign.questions.last().lineage_id
    assert client.get(history_url(current, foreign_lineage)).status_code == 404
    forged = client.get(
        comparison_url(first), {"organization_id": foreign_org.pk, "run_id": foreign.pk}
    )
    assert {t["run_id"] for t in forged.json()["teams"]} == {first.pk}


def test_viewer_loses_results_when_membership_or_active_status_is_removed():
    org, _, _, run = results_context()
    viewer, client = viewer_client(org)
    org.users.remove(viewer)
    for name in ("result-organizations", "result-versions"):
        assert client.get(reverse(name)).json() == []
    assert client.get(family_url(run)).status_code == 404
    assert client.get(history_url(run, run.questions.first().lineage_id)).status_code == 404
    assert client.get(reverse("result-families"), {"organization_id": org.pk}).status_code == 404
    org.users.add(viewer)
    viewer.is_active = False
    viewer.save()
    assert not completed_results_for(viewer).exists()
    assert client.get(reverse("result-versions")).status_code == 403


@pytest.mark.parametrize("method", ["post", "put", "patch", "delete"])
def test_viewer_cannot_mutate_results_or_administration(method):
    org, _, admin, run = results_context()
    _, client = viewer_client(org)
    csrf = {"HTTP_X_CSRFTOKEN": client.cookies["csrftoken"].value}
    result_urls = [
        reverse("result-organizations"),
        reverse("result-versions"),
        comparison_url(run),
        reverse("result-families"),
        family_url(run),
        history_url(run, run.questions.first().lineage_id),
    ]
    for url in result_urls:
        assert getattr(client, method)(url, {}, format="json", **csrf).status_code == 405
    admin_urls = [
        "/api/admin/users/",
        f"/api/admin/users/{admin.pk}/",
        "/api/admin/organizations/",
        f"/api/admin/organizations/{org.pk}/",
        f"/api/admin/organizations/{org.pk}/teams/",
        f"/api/admin/teams/{run.team_id}/",
        "/api/admin/evaluations/",
        "/api/admin/planning/",
    ]
    for url in admin_urls:
        assert getattr(client, method)(url, {}, format="json", **csrf).status_code == 403
    assert run.questions.first().score == 0
    assert run.team.is_active


def test_viewer_cannot_read_administration_even_in_own_organization():
    org, _, _, run = results_context()
    _, client = viewer_client(org)
    for url in (
        "/api/admin/users/",
        "/api/admin/organizations/",
        f"/api/admin/organizations/{org.pk}/",
        f"/api/admin/organizations/{org.pk}/teams/",
        "/api/admin/evaluations/",
        "/api/admin/planning/",
    ):
        assert client.get(url).status_code == 403


@pytest.mark.parametrize("foreign_reference", ["evaluation_id", "team_id"])
def test_viewer_rejects_inconsistent_cross_organization_run_references(foreign_reference):
    org, _, _, own = results_context()
    _, client = viewer_client(org)
    _, _, _, foreign = results_context("Foreign")
    EvaluationRun.objects.filter(pk=own.pk).update(
        **{foreign_reference: getattr(foreign, foreign_reference)}
    )
    assert client.get(reverse("result-versions")).json() == []
    assert client.get(comparison_url(foreign)).status_code == 404
    assert client.get(family_url(own)).status_code == 404
