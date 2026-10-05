from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_scope import manageable_organization
from journals.activity_records import team_archived, team_changed, team_created
from journals.log_context import describe_log_attempt
from journals.models import LogSource
from teams.adapters.api.scope import manageable_team
from teams.adapters.api.serializers import (
    TeamInputSerializer,
    TeamListFilterSerializer,
    TeamSerializer,
)


class TeamListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Liste les équipes actives d'une organisation accessible au Superadmin "
            "ou à un Admin qui en est membre. "
            "include_archived inclut les archives pour les filtres Logs."
        ),
        parameters=[TeamListFilterSerializer],
        responses={
            200: TeamSerializer(many=True),
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, organization_id: int):
        organization = manageable_organization(request.user, organization_id)
        describe_log_attempt(request, "team-list", LogSource.TEAMS, organization=organization)
        filters = TeamListFilterSerializer(data=request.query_params)
        filters.is_valid(raise_exception=True)
        teams = organization.teams.prefetch_related("coaches")
        if not filters.validated_data["include_archived"]:
            teams = teams.filter(is_active=True)
        return Response(TeamSerializer(teams, many=True).data)

    @extend_schema(
        description=(
            "Crée une équipe dans une organisation accessible et lui affecte zéro, "
            "un ou plusieurs Coachs actifs de cette organisation."
        ),
        request=TeamInputSerializer,
        responses={
            201: TeamSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request, organization_id: int):
        organization = manageable_organization(request.user, organization_id)
        describe_log_attempt(
            request,
            "Échec de création de l’équipe",
            LogSource.TEAMS,
            organization=organization,
        )
        serializer = TeamInputSerializer(
            data=request.data,
            context={"organization": organization},
        )
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        describe_log_attempt(
            request,
            "team-create",
            LogSource.TEAMS,
            organization=organization,
            team=team,
        )
        team_created(request.user, team)
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)


class TeamDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Renomme une équipe active et remplace ses Coachs sans changer son organisation."
        ),
        request=TeamInputSerializer,
        responses={
            200: TeamSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, team_id: int):
        team = manageable_team(request.user, team_id)
        describe_log_attempt(
            request,
            "Échec de modification de l’équipe",
            LogSource.TEAMS,
            organization=team.organization,
            team=team,
        )
        previous_name = team.name
        previous_coaches = {coach.pk: coach.username for coach in team.coaches.all()}
        serializer = TeamInputSerializer(
            team,
            data=request.data,
            context={"organization": team.organization},
        )
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
        team_changed(request.user, team, previous_name, previous_coaches)
        return Response(TeamSerializer(team).data)

    @extend_schema(
        description="Archive une équipe active sans supprimer son historique.",
        responses={204: None, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    @transaction.atomic
    def delete(self, request, team_id: int):
        team = manageable_team(request.user, team_id)
        describe_log_attempt(
            request,
            "Échec d’archivage de l’équipe",
            LogSource.TEAMS,
            organization=team.organization,
            team=team,
        )
        team.is_active = False
        team.save(update_fields=["is_active"])
        team_archived(request.user, team)
        return Response(status=status.HTTP_204_NO_CONTENT)
