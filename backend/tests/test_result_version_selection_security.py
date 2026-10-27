import pytest
from django.urls import reverse

from assessments.application.versioning import create_next_version
from identities.domain.users import Role
from tests.identity_helpers import create_user
from tests.longitudinal_helpers import family_url, history_url, longitudinal_context
from tests.results_helpers import results_context
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


@pytest.mark.parametrize("role", ["superadmin", "admin", "coach", "viewer"])
def test_explicit_versions_preserve_role_scope_and_reject_wrong_family(role):
    org, coach, admin, first, current = longitudinal_context()
    foreign_org, _, _, foreign = results_context("Foreign")
    if role == "coach":
        actor = coach
        current.assignee = admin
        current.save()
    elif role == "viewer":
        actor = create_user("viewer", Role.VIEWER)
        org.users.add(actor)
    else:
        actor = admin
        if role == "superadmin":
            actor.organizations.clear()
            actor.is_superuser, actor.role = True, None
            actor.save()
    client = client_for(actor)
    families = client.get(reverse("result-families"), {"organization_id": org.pk}).json()
    expected = (
        [first.evaluation_id] if role == "coach" else [first.evaluation_id, current.evaluation_id]
    )
    assert [v["id"] for v in families[0]["versions"]] == expected
    lineage = first.questions.first().lineage_id
    own_query = {"evaluation_id": first.evaluation_id}
    assert client.get(family_url(first), own_query).status_code == 200
    assert client.get(history_url(first, lineage), own_query).status_code == 200
    for version_id in (foreign.evaluation_id, 999999):
        query = {"evaluation_id": version_id, "team_ids": [first.team_id]}
        assert client.get(family_url(first), query).status_code == 404
        assert client.get(history_url(first, lineage), query).status_code == 404
    foreign_query = {"evaluation_id": foreign.evaluation_id}
    expected_status = 200 if role == "superadmin" else 404
    assert client.get(family_url(foreign), foreign_query).status_code == expected_status
    foreign_lineage = foreign.questions.first().lineage_id
    assert (
        client.get(history_url(foreign, foreign_lineage), foreign_query).status_code
        == expected_status
    )
    if role != "superadmin":
        assert (
            client.get(reverse("result-families"), {"organization_id": foreign_org.pk}).status_code
            == 404
        )
    if role == "coach":
        query = {"evaluation_id": current.evaluation_id}
        assert client.get(family_url(first), query).status_code == 404
        assert client.get(history_url(first, lineage), query).status_code == 404


@pytest.mark.parametrize("evaluation_id", ["oops", "", 0, -1])
def test_malformed_version_is_rejected_instead_of_falling_back(evaluation_id):
    _, _, admin, first = results_context()
    client = client_for(admin)
    query = {"evaluation_id": evaluation_id}
    assert client.get(family_url(first), query).status_code == 400
    assert (
        client.get(history_url(first, first.questions.first().lineage_id), query).status_code == 400
    )


def test_history_rejects_version_without_completed_results():
    _, _, admin, first = results_context()
    empty = create_next_version(first.evaluation_id, admin)
    response = client_for(admin).get(
        history_url(first, first.questions.first().lineage_id), {"evaluation_id": empty.pk}
    )
    assert response.status_code == 404
