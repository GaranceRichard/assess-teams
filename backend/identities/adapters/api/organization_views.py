from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.organization_permissions import CanManageOrganizations
from identities.adapters.api.organization_serializers import (
    CreateOrganizationSerializer,
    OrganizationSerializer,
)
from identities.models import Organization


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
