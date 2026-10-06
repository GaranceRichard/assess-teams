import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from identities.domain.users import Role
from tests.identity_helpers import create_user
from tests.longitudinal_helpers import family_url, history_url, longitudinal_context
from tests.results_helpers import results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_admin_isolation_rejects_forged_organization_family_team_and_lineage():
    org, _, admin, own, current = longitudinal_context()
    foreign_org, _, _, foreign = results_context("Foreign")
    client = client_for(admin)
    families = reverse("result-families")
    assert client.get(families, {"organization_id": foreign_org.pk}).status_code == 404
    assert client.get(families, {"organization_id": org.pk}).status_code == 200
    assert client.get(family_url(foreign)).status_code == 404
    lineage = current.questions.first().lineage_id
    for ids in ([foreign.team_id], [own.team_id, foreign.team_id], [999999]):
        assert client.get(history_url(current, lineage), {"team_ids": ids}).status_code == 404
    foreign_lineage = foreign.questions.first().lineage_id
    assert client.get(history_url(current, foreign_lineage)).status_code == 404
    assert client.get(history_url(foreign, foreign_lineage)).status_code == 404
    # Even a deliberately colliding UUID in a foreign tenant cannot enter the series.
    foreign.questions.filter(index=1).update(lineage_id=lineage)
    data = client.get(history_url(current, lineage), {"team_ids": [own.team_id]}).json()
    assert {p["run_id"] for p in data["teams"][0]["points"]} == {own.pk, current.pk}


def test_coach_scope_applies_before_latest_version_and_history_selection():
    org, coach, admin, own, current = longitudinal_context()
    current.assignee = admin
    current.save()
    client = client_for(coach)
    assert client.get(family_url(current)).json()["evaluation_id"] == own.evaluation_id
    data = client.get(
        history_url(current, own.questions.first().lineage_id), {"team_ids": [own.team_id]}
    ).json()
    assert [p["run_id"] for p in data["teams"][0]["points"]] == [own.pk]
    org.users.remove(coach)
    assert client.get(history_url(current, own.questions.first().lineage_id)).status_code == 404


def test_superadmin_selects_organization_and_viewer_consults_own_results():
    org, _, admin, own, _ = longitudinal_context()
    foreign_org, _, _, foreign = results_context("Foreign")
    admin.is_superuser = True
    admin.role = None
    admin.save()
    client = client_for(admin)
    assert {o["id"] for o in client.get(reverse("result-organizations")).json()} == {
        org.pk,
        foreign_org.pk,
    }
    data = client.get(reverse("result-families"), {"organization_id": foreign_org.pk}).json()
    assert [f["family_id"] for f in data] == [foreign.evaluation.family_id]
    viewer = create_user("viewer", Role.VIEWER)
    org.users.add(viewer)
    viewer_client = client_for(viewer)
    assert (
        viewer_client.get(reverse("result-families"), {"organization_id": org.pk}).status_code
        == 200
    )
    assert viewer_client.get(family_url(own)).status_code == 200
    assert viewer_client.get(history_url(own, own.questions.first().lineage_id)).status_code == 200
    assert APIClient().get(reverse("result-organizations")).status_code == 403
    assert APIClient().get(history_url(own, own.questions.first().lineage_id)).status_code == 403


@pytest.mark.parametrize("query", [{}, {"organization_id": "oops"}, {"organization_id": 0}])
def test_family_query_requires_a_valid_organization(query):
    _, _, admin, _ = results_context()
    assert client_for(admin).get(reverse("result-families"), query).status_code == 400


@pytest.mark.parametrize("ids", [["oops"], [0], ["1,2"]])
def test_history_refuses_malformed_team_ids(ids):
    _, _, admin, run = results_context()
    response = client_for(admin).get(
        history_url(run, run.questions.first().lineage_id), {"team_ids": ids}
    )
    assert response.status_code == 400
