from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.dashboard_serializers import DashboardSerializer
from assessments.application.dashboard import dashboard_projection


class DashboardView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="dashboard_read",
        description=(
            "Accueil personnel read-only. Superadmin : activité globale contextualisée par "
            "organisation ; Admin : son organisation ; Coach : ses passations assignées ; "
            "Viewer : résultats COMPLETED de son organisation, auteurs masqués. "
            "Au plus 10 événements par date DESC, run pk DESC, type DESC. "
            "EvaluationRun prouve la complétion initiale et la dernière révision séparément ; "
            "aucun log technique ni parsing du Journal. "
            "Les paramètres de périmètre envoyés sont ignorés."
        ),
        responses={200: DashboardSerializer, 403: OpenApiResponse(description="Session absente.")},
    )
    @transaction.atomic
    def get(self, request):
        return Response(DashboardSerializer(dashboard_projection(request.user)).data)
