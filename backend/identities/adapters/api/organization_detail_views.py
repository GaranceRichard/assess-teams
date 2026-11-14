from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_scope import (
    manageable_organization,
)
from identities.adapters.api.organization_serializers import (
    OrganizationSerializer,
    RenameOrganizationSerializer,
)
from identities.application.lifecycle import lock_identity_changes
from identities.application.organization_deletion import assert_organization_deletable
from identities.models import Organization
from journals.activity_records import (
    organization_deleted,
    organization_renamed,
)
from journals.log_context import describe_log_attempt
from journals.models import LogSource


class OrganizationDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description=(
            "Consulte toute organisation pour un Superadmin et uniquement son "
            "organisation d'affectation pour un Admin."
        ),
        responses={
            200: OrganizationSerializer,
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, organization_id: int):
        organization = manageable_organization(request.user, organization_id)
        describe_log_attempt(
            request, "organization-detail", LogSource.ORGANIZATIONS, organization=organization
        )
        return Response(OrganizationSerializer(organization).data)

    @extend_schema(
        description=(
            "Renomme une organisation. Le Superadmin agit partout et un Admin "
            "uniquement dans une organisation à laquelle il est rattaché."
        ),
        request=RenameOrganizationSerializer,
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
            "Échec de renommage de l’organisation",
            LogSource.ORGANIZATIONS,
            organization=organization,
        )
        previous_name = organization.name
        serializer = RenameOrganizationSerializer(organization, data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        if previous_name != organization.name:
            organization_renamed(request.user, organization)
        return Response(OrganizationSerializer(organization).data)

    @extend_schema(
        description=(
            "Supprime définitivement une organisation et ses rattachements sans "
            "supprimer les identités. Superadmin uniquement. Refus 400 dès qu’une équipe, "
            "un référentiel, un plan, une passation/snapshot ou une notification liée existe, "
            "quel que soit son état. Journaux/Logs conservés avec origine stable, sous "
            "rétention existante ; accès résiduel Superadmin. Refus sans effet métier partiel."
        ),
        responses={
            204: None,
            400: OpenApiResponse(
                response=inline_serializer(
                    "OrganizationDeleteRefusal", fields={"detail": serializers.CharField()}
                ),
                description="Dépendances protégées ou provenance des traces non garantie.",
            ),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, organization_id: int):
        if not request.user.is_superuser:
            raise PermissionDenied("Seul le Superadmin peut supprimer une organisation.")
        lock_identity_changes()
        organization = get_object_or_404(Organization, pk=organization_id)
        describe_log_attempt(
            request,
            "Échec de suppression de l’organisation",
            LogSource.ORGANIZATIONS,
            organization=organization,
        )
        assert_organization_deletable(organization)
        organization_deleted(request.user, organization)
        organization.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
