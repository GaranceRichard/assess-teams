from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiTypes, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.result_history_serializers import (
    ResultFamilyComparisonSerializer,
    ResultFamilyQuerySerializer,
    ResultFamilySerializer,
    ResultHistoryQuerySerializer,
    ResultHistorySerializer,
    ResultOrganizationSerializer,
)
from assessments.adapters.api.results_views import SCOPE_DESCRIPTION
from assessments.application.result_history import (
    criterion_history,
    result_family_versions_for,
    result_organizations_for,
)
from assessments.application.results import comparison_results


class ResultsReadView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]


class ResultOrganizationListView(ResultsReadView):
    @extend_schema(
        description=SCOPE_DESCRIPTION + "Organisations accessibles. L’organisation de l’Admin "
        "est imposée ; le Superadmin choisit. Cette liste n’accorde aucun accès aux résultats.",
        responses={200: ResultOrganizationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        return Response(
            ResultOrganizationSerializer(result_organizations_for(request.user), many=True).data
        )


class ResultFamilyListView(ResultsReadView):
    @extend_schema(
        description=SCOPE_DESCRIPTION + "Familles ayant des COMPLETED accessibles dans "
        "l’organisation. Chaque famille expose sa dernière version ayant des résultats "
        "accessibles selon version DESC, indépendamment du statut courant du modèle.",
        parameters=[ResultFamilyQuerySerializer],
        responses={
            200: ResultFamilySerializer(many=True),
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request):
        query = ResultFamilyQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        organization = get_object_or_404(
            result_organizations_for(request.user), pk=query.validated_data["organization_id"]
        )
        versions = result_family_versions_for(request.user, organization.pk)
        return Response(ResultFamilySerializer(versions, many=True).data)


class ResultFamilyComparisonView(ResultsReadView):
    @extend_schema(
        description=SCOPE_DESCRIPTION + "Radar : dernière position sur la dernière version "
        "de la famille ayant des résultats accessibles. Dernière COMPLETED par équipe selon "
        "completed_at DESC, pk DESC ; axes, lignées et scores issus des snapshots. "
        "Aucune agrégation ni retour à une passation plus ancienne "
        "si le snapshot est inutilisable.",
        responses={
            200: ResultFamilyComparisonSerializer,
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, family_id):
        version = get_object_or_404(result_family_versions_for(request.user), family_id=family_id)
        results = comparison_results(request.user, version.pk, include_lineage=True)
        results.update(evaluation_id=version.pk, version=version.version)
        return Response(ResultFamilyComparisonSerializer(results).data)


class ResultCriterionHistoryView(ResultsReadView):
    @extend_schema(
        description=SCOPE_DESCRIPTION + "Longitudinal chargé à la demande : observations "
        "COMPLETED d’un critère snapshoté pour les équipes sélectionnées. Continuité entre "
        "versions uniquement par lignée UUID explicite, jamais texte/index/position. Ordre "
        "completed_at ASC, pk ASC, un point par passation compatible, sans moyenne, "
        "interpolation ni tendance calculée. Critère absent du radar courant ou équipe "
        "inaccessible/non éligible sur sa version : 404. Aucun team_ids : séries vides.",
        parameters=[
            OpenApiParameter(
                "team_ids",
                OpenApiTypes.INT,
                many=True,
                explode=True,
                description="IDs répétés des équipes sélectionnées et éligibles sur le radar.",
            )
        ],
        responses={
            200: ResultHistorySerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, family_id, lineage_id):
        query = ResultHistoryQuerySerializer(
            data={"team_ids": request.query_params.getlist("team_ids")}
        )
        query.is_valid(raise_exception=True)
        version = get_object_or_404(result_family_versions_for(request.user), family_id=family_id)
        comparison = comparison_results(request.user, version.pk, include_lineage=True)
        history = criterion_history(
            request.user, version, comparison, lineage_id, query.validated_data["team_ids"]
        )
        return Response(ResultHistorySerializer(history).data)
