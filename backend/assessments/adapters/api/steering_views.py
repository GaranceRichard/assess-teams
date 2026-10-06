from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.result_history_serializers import ResultOrganizationSerializer
from assessments.adapters.api.steering_serializers import (
    SteeringQuerySerializer,
    SteeringSerializer,
)
from assessments.application.steering import steering_projection
from identities.adapters.api.organization_scope import (
    assigned_admin_organization,
    visible_organizations,
)

DESCRIPTION = (
    "Lecture seule, session active Admin/Superadmin uniquement. "
    "Coach/Viewer/anonyme/inactif : 403. "
    "Une organisation, jamais d’agrégat interorganisation. Admin : organisation unique imposée ; "
    "Superadmin : choix obligatoire. Équipes actives seulement. Résultat = COMPLETED accessible ; "
    "dernière complétion selon completed_at DESC puis pk DESC, nom snapshoté et version exacte. "
    "Jamais évaluée si aucune COMPLETED, sinon En retard si passation non complétée due_date "
    "strictement avant timezone.localdate(), sinon À jour. Tri retard/jamais/à jour puis nom/ID. "
    "Prochaine échéance = minimum des passations non complétées et next_due_date du planning "
    "non déjà satisfaite, y compris retard. Aucun score ni calcul Results."
)


class SteeringReadView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]


class SteeringOrganizationListView(SteeringReadView):
    @extend_schema(
        description=DESCRIPTION,
        responses={200: ResultOrganizationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        organizations = (
            visible_organizations(request.user).order_by("name", "pk")
            if request.user.is_superuser
            else [assigned_admin_organization(request.user)]
        )
        return Response(ResultOrganizationSerializer(organizations, many=True).data)


class SteeringView(SteeringReadView):
    @extend_schema(
        description=DESCRIPTION + " organization_id absent pour Superadmin/invalide : 400 ; "
        "organisation forgée/hors scope : 404. Absences : null et listes vides.",
        parameters=[SteeringQuerySerializer],
        responses={
            200: SteeringSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request):
        query = SteeringQuerySerializer(data=request.query_params.dict())
        query.is_valid(raise_exception=True)
        organization_id = query.validated_data.get("organization_id")
        if len(request.query_params.getlist("organization_id")) > 1:
            raise ValidationError("Une seule organisation doit être sélectionnée.")
        if request.user.is_superuser:
            if organization_id is None:
                raise ValidationError("Sélectionnez une organisation.")
            organization = get_object_or_404(
                visible_organizations(request.user), pk=organization_id
            )
        else:
            organization = assigned_admin_organization(request.user)
            if organization_id is not None and organization_id != organization.pk:
                raise NotFound()
        return Response(SteeringSerializer(steering_projection(request.user, organization)).data)
