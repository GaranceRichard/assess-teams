from django.db.models import OuterRef, Subquery
from rest_framework.exceptions import NotFound

from assessments.application.results import completed_results_for, result_versions_for
from assessments.models import EvaluationRunQuestion
from identities.models import Organization


def result_organizations_for(user):
    organizations = Organization.objects.order_by("name", "pk")
    return organizations if user.is_superuser else organizations.filter(users=user).distinct()


def result_family_versions_for(user, organization_id=None):
    versions = result_versions_for(user)
    if organization_id is not None:
        versions = versions.filter(organization_id=organization_id)
    latest = versions.filter(family_id=OuterRef("family_id")).order_by("-version", "-pk")
    return versions.filter(pk=Subquery(latest.values("pk")[:1])).order_by("family__name", "pk")


def criterion_history(user, version, comparison, lineage_id, team_ids):
    axis = next((a for a in comparison["axes"] if a["lineage_id"] == lineage_id), None)
    eligible = {t["team_id"]: t for t in comparison["teams"]}
    if axis is None or not set(team_ids).issubset(eligible):
        raise NotFound()
    teams = [
        {"team_id": tid, "team_name": eligible[tid]["team_name"], "points": []}
        for tid in dict.fromkeys(team_ids)
    ]
    series = {team["team_id"]: team["points"] for team in teams}
    runs = completed_results_for(user).filter(
        evaluation__family_id=version.family_id, team_id__in=team_ids
    )
    observations = (
        EvaluationRunQuestion.objects.filter(
            run_id__in=runs.values("pk"), lineage_id=lineage_id, score__isnull=False
        )
        .order_by("run__completed_at", "run_id")
        .values(
            "run_id",
            "run__team_id",
            "run__team_name",
            "run__completed_at",
            "score",
            "text",
            "run__evaluation_id",
            "run__evaluation__version",
        )
    )
    for point in observations:
        series[point["run__team_id"]].append(
            {
                "run_id": point["run_id"],
                "team_name": point["run__team_name"],
                "completed_at": point["run__completed_at"],
                "score": point["score"],
                "criterion_text": point["text"],
                "evaluation_id": point["run__evaluation_id"],
                "version": point["run__evaluation__version"],
            }
        )
    return {"lineage_id": lineage_id, "criterion_text": axis["text"], "teams": teams}
