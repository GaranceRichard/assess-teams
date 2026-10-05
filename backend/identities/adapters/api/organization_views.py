from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_permissions import actor_for
from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_scope import (
    manageable_organization,
    visible_organizations,
)
from identities.adapters.api.organization_serializers import (
    CreateOrganizationSerializer,
    OrganizationSerializer,
    UpdateOrganizationMembersSerializer,
)
from identities.domain.organizations import can_create_organizations
from journals.activity_records import (
    organization_created,
    organization_members_changed,
)
from journals.log_context import describe_log_attempt
from journals.models import LogSource


class OrganizationListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Liste toutes les organisations pour un Superadmin et uniquement son "
            "organisation d'affectation pour un Admin actif."
        ),
        responses={200: OrganizationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        organizations = visible_organizations(request.user)
        return Response(OrganizationSerializer(organizations, many=True).data)

    @extend_schema(
        description=(
            "Crée une organisation et l'affecte à un ou plusieurs utilisateurs. "
            "Action réservée au Superadmin ; chaque Admin, Coach ou Viewer "
            "appartient au plus à une organisation."
        ),
        request=CreateOrganizationSerializer,
        responses={
            201: OrganizationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request):
        describe_log_attempt(
            request,
            "Échec de création de l’organisation",
            LogSource.ORGANIZATIONS,
        )
        if not can_create_organizations(actor_for(request.user)):
            raise PermissionDenied("Seul le Superadmin peut créer une organisation.")
        serializer = CreateOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        describe_log_attempt(
            request, "organization-create", LogSource.ORGANIZATIONS, organization=organization
        )
        organization_created(request.user, organization)
        return Response(
            OrganizationSerializer(organization).data,
            status=status.HTTP_201_CREATED,
        )


class OrganizationMemberUpdateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Remplace les membres d'une organisation pour un Superadmin ou un "
            "Admin actif dans son organisation. Un Admin ne peut jamais modifier "
            "les rattachements des Admin ; chaque membre est limité à une organisation."
        ),
        request=UpdateOrganizationMembersSerializer,
        responses={
            200: OrganizationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, organization_id: int):
        organization = manageable_organization(request.user, organization_id)
        describe_log_attempt(
            request,
            "Échec de modification des membres de l’organisation",
            LogSource.ORGANIZATIONS,
            organization=organization,
        )
        previous = {user.pk: user.username for user in organization.users.all()}
        serializer = UpdateOrganizationMembersSerializer(
            organization,
            data=request.data,
            context={"actor": actor_for(request.user)},
        )
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        current = {user.pk: user.username for user in organization.users.all()}
        organization_members_changed(request.user, organization, previous, current)
        return Response(OrganizationSerializer(organization).data)
