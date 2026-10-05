from identities.models import Organization, User
from journals.evaluation_records import (  # noqa: F401
    evaluation_activity,
    evaluation_run_activity,
    evaluation_schedule_deleted,
    evaluation_schedule_updated,
    evaluation_scheduled,
    question_activity,
)
from journals.models import ActivityAction
from journals.services import record_activity
from teams.models import Team


def organization_created(actor: User, organization: Organization) -> None:
    record_activity(
        actor=actor,
        organization=organization,
        action=ActivityAction.ORGANIZATION_CREATED,
        description="Création de l’organisation",
    )


def organization_renamed(actor: User, organization: Organization) -> None:
    record_activity(
        actor=actor,
        organization=organization,
        action=ActivityAction.ORGANIZATION_RENAMED,
        description="Renommage de l’organisation",
    )


def organization_deleted(actor: User, organization: Organization) -> None:
    record_activity(
        actor=actor,
        organization=organization,
        action=ActivityAction.ORGANIZATION_DELETED,
        description="Suppression de l’organisation",
    )


def organization_members_changed(
    actor: User,
    organization: Organization,
    previous: dict[int, str],
    current: dict[int, str],
) -> None:
    for user_id in current.keys() - previous.keys():
        record_activity(
            actor=actor,
            organization=organization,
            action=ActivityAction.MEMBER_ASSIGNED,
            description=f"Attribution de {current[user_id]} à l’organisation",
        )
    for user_id in previous.keys() - current.keys():
        record_activity(
            actor=actor,
            organization=organization,
            action=ActivityAction.MEMBER_REMOVED,
            description=f"Retrait de {previous[user_id]} de l’organisation",
        )


def user_activity(
    actor: User,
    user: User,
    action: ActivityAction,
    description: str,
    organization: Organization | None = None,
) -> None:
    record_activity(
        actor=actor,
        organization=organization or user.organizations.first(),
        action=action,
        description=description,
    )


def team_created(actor: User, team: Team) -> None:
    record_activity(
        actor=actor,
        organization=team.organization,
        team=team,
        action=ActivityAction.TEAM_CREATED,
        description="Création de l’équipe",
    )
    for coach in team.coaches.all():
        coach_assigned(actor, team, coach.username)


def team_changed(
    actor: User,
    team: Team,
    previous_name: str,
    previous_coaches: dict[int, str],
) -> None:
    if previous_name != team.name:
        record_activity(
            actor=actor,
            organization=team.organization,
            team=team,
            action=ActivityAction.TEAM_RENAMED,
            description="Renommage de l’équipe",
        )
    current = {coach.pk: coach.username for coach in team.coaches.all()}
    for coach_id in current.keys() - previous_coaches.keys():
        coach_assigned(actor, team, current[coach_id])
    for coach_id in previous_coaches.keys() - current.keys():
        coach_removed(actor, team, previous_coaches[coach_id])


def coach_assigned(actor: User, team: Team, coach_name: str) -> None:
    record_activity(
        actor=actor,
        organization=team.organization,
        team=team,
        action=ActivityAction.COACH_ASSIGNED,
        description=f"Ajout du coach {coach_name}",
    )


def coach_removed(actor: User, team: Team, coach_name: str) -> None:
    record_activity(
        actor=actor,
        organization=team.organization,
        team=team,
        action=ActivityAction.COACH_REMOVED,
        description=f"Retrait du coach {coach_name}",
    )


def team_archived(actor: User, team: Team) -> None:
    record_activity(
        actor=actor,
        organization=team.organization,
        team=team,
        action=ActivityAction.TEAM_ARCHIVED,
        description="Archivage de l’équipe",
    )
