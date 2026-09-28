from django.shortcuts import get_object_or_404

from identities.models import User
from teams.models import Team


def manageable_team(user: User, team_id: int) -> Team:
    teams = Team.objects.select_related("organization").prefetch_related("coaches")
    if not user.is_superuser:
        teams = teams.filter(organization__users=user)
    return get_object_or_404(teams, pk=team_id, is_active=True)
