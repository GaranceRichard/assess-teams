from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.results_serializers import (
    ResultComparisonSerializer,
    ResultVersionSerializer,
)
from assessments.application.results import comparison_results, result_versions_for
from journals.log_context import describe_log_attempt
from journals.models import LogSource

SCOPE_DESCRIPTION = (
    "Session active. Scope de consultation : Superadmin global, Admin dans son "
    "organisation, Coach sur ses passations assignées, "
    "Viewer sur les COMPLETED de son organisation. "
)


class ResultVersionListView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        description=SCOPE_DESCRIPTION
        + "Versions exactes avec au moins une passation COMPLETED accessible, même archivées.",
        responses={200: ResultVersionSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        return Response(ResultVersionSerializer(result_versions_for(request.user), many=True).data)


class ResultComparisonView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        description=SCOPE_DESCRIPTION
        + "Une seule version. Dernière COMPLETED accessible par équipe selon completed_at "
        "décroissant puis ID décroissant. Axes et scores snapshotés ordonnés par index. "
        "Sans agrégation. Aucun retour à une ancienne passation en cas de snapshot inexploitable. "
        "Version inaccessible ou sans COMPLETED : 404.",
        responses={
            200: ResultComparisonSerializer,
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, evaluation_id: int):
        version = get_object_or_404(result_versions_for(request.user), pk=evaluation_id)
        describe_log_attempt(
            request,
            "Consultation des résultats",
            LogSource.ASSESSMENTS,
            organization=version.organization,
            evaluation=version,
        )
        results = comparison_results(request.user, version.pk)
        return Response(ResultComparisonSerializer(results).data)
