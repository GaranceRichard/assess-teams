from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_serializers import (
    CreateOrganizationSerializer,
    OrganizationSerializer,
    RenameOrganizationSerializer,
    UpdateOrganizationMembersSerializer,
)
from identities.models import Organization


def manageable_organization(request, organization_id: int) -> Organization:
    organizations = Organization.objects.all()
    if not request.user.is_superuser:
        organizations = organizations.filter(users=request.user)
    return get_object_or_404(organizations, pk=organization_id)


class OrganizationListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

    @extend_schema(
        description="Liste les organisations pour un Superadmin ou un Admin actif.",
        responses={200: OrganizationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        organizations = Organization.objects.prefetch_related("users").all()
        return Response(OrganizationSerializer(organizations, many=True).data)

    @extend_schema(
        description=(
            "Crée une organisation et l'affecte à un ou plusieurs utilisateurs. "
            "Un utilisateur peut appartenir à plusieurs organisations."
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
        serializer = CreateOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
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
            "Admin actif. Au moins un membre et tout dernier Admin sont conservés."
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
        organization = manageable_organization(request, organization_id)
        serializer = UpdateOrganizationMembersSerializer(
            organization,
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        return Response(OrganizationSerializer(organization).data)


class OrganizationDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageOrganizations]

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
        organization = manageable_organization(request, organization_id)
        serializer = RenameOrganizationSerializer(organization, data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = serializer.save()
        return Response(OrganizationSerializer(organization).data)
