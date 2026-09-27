from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.organization_permissions import CanManageOrganizations
from teams.adapters.api.scope import manageable_organization, manageable_team
from teams.adapters.api.serializers import TeamInputSerializer, TeamSerializer


class TeamListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Liste les équipes actives d'une organisation accessible au Superadmin "
            "ou à un Admin qui en est membre."
        ),
        responses={200: TeamSerializer(many=True), 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    def get(self, request, organization_id: int):
        organization = manageable_organization(request.user, organization_id)
        teams = organization.teams.filter(is_active=True).prefetch_related("coaches")
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
        serializer = TeamInputSerializer(
            data=request.data,
            context={"organization": organization},
        )
        serializer.is_valid(raise_exception=True)
        team = serializer.save()
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
        serializer = TeamInputSerializer(
            team,
            data=request.data,
            context={"organization": team.organization},
        )
        serializer.is_valid(raise_exception=True)
        return Response(TeamSerializer(serializer.save()).data)

    @extend_schema(
        description="Archive une équipe active sans supprimer son historique.",
        responses={204: None, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    @transaction.atomic
    def delete(self, request, team_id: int):
        team = manageable_team(request.user, team_id)
        team.is_active = False
        team.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)
