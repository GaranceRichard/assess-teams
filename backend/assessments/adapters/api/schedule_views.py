from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.schedule_scope import visible_schedules
from assessments.adapters.api.schedule_serializers import (
    CreateEvaluationScheduleSerializer,
    EvaluationScheduleSerializer,
)
from journals.activity_records import evaluation_scheduled
from journals.error_context import describe_attempt


class EvaluationScheduleListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Liste les planifications de toutes les organisations pour un Superadmin "
            "et uniquement celles de l’organisation d’un Admin."
        ),
        responses={200: EvaluationScheduleSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        return Response(
            EvaluationScheduleSerializer(visible_schedules(request.user), many=True).data
        )

    @extend_schema(
        description=(
            "Planifie une évaluation immédiate, fixe, mensuelle ou trimestrielle "
            "pour une équipe active de la même organisation."
        ),
        request=CreateEvaluationScheduleSerializer,
        responses={
            201: EvaluationScheduleSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request):
        describe_attempt(request, "Échec de planification de l’évaluation")
        serializer = CreateEvaluationScheduleSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        schedule = serializer.save()
        describe_attempt(
            request,
            "Échec de planification de l’évaluation",
            organization=schedule.team.organization,
            team=schedule.team,
        )
        evaluation_scheduled(request.user, schedule)
        return Response(
            EvaluationScheduleSerializer(schedule).data,
            status=status.HTTP_201_CREATED,
        )
