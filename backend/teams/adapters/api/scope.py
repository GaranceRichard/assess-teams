from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from identities.models import User
from teams.models import Team


def readable_team(user: User, team_id: int) -> Team:
    teams = Team.objects.select_related("organization")
    if not user.is_superuser:
        teams = teams.filter(organization__users=user)
    try:
        return get_object_or_404(teams, pk=team_id)
    except Http404 as exc:
        raise NotFound("Équipe introuvable.") from exc


def manageable_team(user: User, team_id: int) -> Team:
    teams = Team.objects.select_related("organization").prefetch_related("coaches__organizations")
    if not user.is_superuser:
        teams = teams.filter(organization__users=user)
    return get_object_or_404(teams, pk=team_id, is_active=True)


def archivable_team(user: User, team_id: int) -> Team:
    teams = Team.objects.select_related("organization")
    if not user.is_superuser:
        teams = teams.filter(organization__users=user)
    return get_object_or_404(teams, pk=team_id)
