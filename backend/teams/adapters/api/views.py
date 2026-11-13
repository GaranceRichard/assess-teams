from django.db import transaction
from django.http import Http404
from drf_spectacular.utils import OpenApiResponse, PolymorphicProxySerializer, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from config.collection_pagination import PageQuerySerializer, collection_response, collection_schema
from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_scope import manageable_organization
from identities.application.lifecycle import lock_identity_changes
from identities.domain.users import Role
from journals.activity_records import team_archived, team_changed, team_created
from journals.log_context import describe_log_attempt
from journals.models import LogSource
from teams.adapters.api.permissions import CanReadTeams
from teams.adapters.api.scope import archivable_team, manageable_team, readable_team, readable_teams
from teams.adapters.api.serializers import (
    TEAM_ARCHIVE_ERROR_SCHEMA,
    TeamDetailErrorSerializer,
    TeamDetailSerializer,
    TeamInputSerializer,
    TeamListFilterSerializer,
    TeamSerializer,
)


class TeamListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanReadTeams | CanManageOrganizations]

    @extend_schema(
        description=(
            "Liste les équipes actives d'une organisation accessible au Superadmin "
            "ou à un Admin qui en est membre. Coach actif : seules ses affectations courantes "
            "dans son organisation courante (C04), projection minimale sans Coachs. "
            "include_archived inclut les archives pour les filtres Logs Admin/Superadmin ; "
            "la liste Coach reste active, même avec ce paramètre. "
            "Les Coachs retournés sont encore membres de cette organisation ; "
            "un ancien lien ne révèle pas leur identité courante hors organisation."
        ),
        parameters=[TeamListFilterSerializer, PageQuerySerializer],
        responses={
            200: PolymorphicProxySerializer(
                component_name="TeamReadCollection",
                serializers=[
                    collection_schema(TeamSerializer),
                    collection_schema(TeamDetailSerializer),
                ],
                resource_type_field_name=None,
                many=False,
            ),
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
        teams = readable_teams(request.user).filter(organization=organization)
        coach_read = not request.user.is_superuser and request.user.role == Role.COACH
        if coach_read or not filters.validated_data["include_archived"]:
            teams = teams.filter(is_active=True)
        serializer = TeamDetailSerializer if coach_read else TeamSerializer
        if not coach_read:
            teams = teams.prefetch_related("coaches__organizations")
        return collection_response(request, teams, serializer)

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
        lock_identity_changes()
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
    permission_classes = [CanReadTeams | CanManageOrganizations]

    @extend_schema(
        description=(
            "Consulte l'identité et l'état d'une équipe active ou archivée. "
            "Session active Superadmin (toute organisation) ou Admin membre de l'organisation. "
            "Coach actif actuellement affecté et membre courant de l'organisation (C04), "
            "y compris pour une archive. Ancienne affectation ou assignation de passation : "
            "aucun droit supplémentaire. Viewer refusé (403). "
            "Équipe inexistante ou hors périmètre : même 404 JSON sans donnée métier. "
            "Identifiant absent ou mal formé : 404 du routeur, potentiellement non JSON. "
            "Aucune mutation ni entrée au Journal métier ; le Log HTTP technique est conservé."
        ),
        responses={
            200: TeamDetailSerializer,
            403: OpenApiResponse(TeamDetailErrorSerializer, description="Session ou rôle refusé."),
            404: OpenApiResponse(TeamDetailErrorSerializer, description="Équipe introuvable."),
        },
    )
    def get(self, request, team_id: int):
        team = readable_team(request.user, team_id)
        describe_log_attempt(
            request, "team-detail", LogSource.TEAMS, organization=team.organization, team=team
        )
        return Response(TeamDetailSerializer(team).data)

    @extend_schema(
        description=(
            "Renomme une équipe active et remplace ses Coachs sans changer son organisation. "
            "Un ancien Coach désormais hors organisation ne peut pas être conservé (400)."
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
        lock_identity_changes()
        team = manageable_team(request.user, team_id)
        describe_log_attempt(
            request,
            "Échec de modification de l’équipe",
            LogSource.TEAMS,
            organization=team.organization,
            team=team,
        )
        previous_name = team.name
        previous_coaches = {
            coach.pk: coach.username
            if any(org.pk == team.organization_id for org in coach.organizations.all())
            else f"#{coach.pk}"
            for coach in team.coaches.all()
        }
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
        description=(
            "Archive une équipe active sans supprimer son historique. "
            "Une équipe accessible déjà archivée est refusée (400), sans nouvelle activité métier."
        ),
        responses={
            204: None,
            400: OpenApiResponse(
                TEAM_ARCHIVE_ERROR_SCHEMA,
                description="Équipe déjà archivée.",
            ),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, team_id: int):
        try:
            team = manageable_team(request.user, team_id)
        except Http404:
            team = archivable_team(request.user, team_id)
        describe_log_attempt(
            request,
            "Échec d’archivage de l’équipe",
            LogSource.TEAMS,
            organization=team.organization,
            team=team,
        )
        if not team.is_active:
            raise ValidationError("Équipe déjà archivée.")
        team.is_active = False
        team.save(update_fields=["is_active"])
        team_archived(request.user, team)
        return Response(status=status.HTTP_204_NO_CONTENT)
