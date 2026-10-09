from uuid import uuid4

import pytest

from teams.models import Team
from tests.longitudinal_helpers import history_url, longitudinal_context
from tests.results_helpers import another_run
from tests.taking_helpers import client_for

pytestmark = [pytest.mark.django_db, pytest.mark.functional, pytest.mark.api]


def test_history_omits_missing_scores_and_unrelated_lineages_without_padding_teams():
    organization, _, admin, first, current = longitudinal_context()
    lineage = current.questions.first().lineage_id
    another_run(first, days=2, scores=(None, 3))
    unrelated = another_run(first, days=3)
    # Identical snapshot text does not establish continuity.
    unrelated.questions.filter(index=1).update(lineage_id=uuid4())
    second = Team.objects.create(organization=organization, name="Second")
    second_current = another_run(current, team=second, scores=(0, 3))
    third = Team.objects.create(organization=organization, name="Third")
    another_run(current, team=third)
    response = client_for(admin).get(
        history_url(current, lineage), {"team_ids": [first.team_id, second.pk, third.pk]}
    )
    assert response.status_code == 200
    series = response.json()["teams"]
    assert [len(team["points"]) for team in series] == [2, 1, 1]
    assert {point["run_id"] for point in series[0]["points"]} == {first.pk, current.pk}
    assert [point["version"] for point in series[0]["points"]] == [1, 2]
    assert [point["score"] for point in series[1]["points"]] == [0]
    assert series[1]["points"][0]["run_id"] == second_current.pk


def test_history_omits_old_missing_scores_and_preserves_the_measured_current_zero():
    _, _, admin, first, current = longitudinal_context()
    lineage = current.questions.first().lineage_id
    first.questions.filter(lineage_id=lineage).update(score=None)
    # A missing old criterion leaves only the measured, current observation.
    response = client_for(admin).get(history_url(current, lineage), {"team_ids": [first.team_id]})
    assert response.status_code == 200
    points = response.json()["teams"][0]["points"]
    assert [point["run_id"] for point in points] == [current.pk]
    assert [point["score"] for point in points] == [0]
