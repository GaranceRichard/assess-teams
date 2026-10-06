from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.schedule_scope import manageable_schedule, visible_schedules
from assessments.adapters.api.schedule_serializers import (
    EvaluationScheduleInputSerializer,
    EvaluationScheduleSerializer,
)
from assessments.application.schedule_notifications import notify_schedule_created
from assessments.models import EvaluationRunState
from journals.activity_records import (
    evaluation_schedule_deleted,
    evaluation_schedule_updated,
    evaluation_scheduled,
)
from journals.log_context import describe_log_attempt
from journals.models import LogSource


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
            "pour une équipe active de la même organisation. Le modèle doit être VALIDATED ; "
            "un brouillon ou modèle archivé retourne 404. Une planification ponctuelle "
            "dont toutes les passations sont complétées autorise une nouvelle planification "
            "indépendante pour la même équipe et le même modèle, avec historique conservé. "
            "Une planification récurrente ou non complétée bloque les doublons (400)."
        ),
        request=EvaluationScheduleInputSerializer,
        responses={
            201: EvaluationScheduleSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request):
        describe_log_attempt(
            request,
            "Échec de planification de l’évaluation",
            LogSource.PLANNING,
        )
        serializer = EvaluationScheduleInputSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        schedule = serializer.save()
        describe_log_attempt(
            request,
            "Échec de planification de l’évaluation",
            LogSource.PLANNING,
            organization=schedule.team.organization,
            team=schedule.team,
            evaluation=schedule.evaluation,
        )
        evaluation_scheduled(request.user, schedule)
        transaction.on_commit(lambda: notify_schedule_created(schedule.pk))
        return Response(
            EvaluationScheduleSerializer(schedule).data,
            status=status.HTTP_201_CREATED,
        )


class EvaluationScheduleDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Modifie l’équipe, le modèle, le responsable, la fréquence et la date "
            "d’une planification accessible. Le modèle doit être VALIDATED (sinon 404), "
            "même si la référence historique archivée reste consultable en lecture. "
            "Les mêmes règles de doublons qu’à la création s’appliquent : une planification "
            "ponctuelle complétée ne bloque pas ; une autre planification récurrente ou "
            "non complétée pour la même équipe et le même modèle retourne 400."
        ),
        request=EvaluationScheduleInputSerializer,
        responses={
            200: EvaluationScheduleSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, schedule_id: int):
        schedule = manageable_schedule(request.user, schedule_id)
        describe_log_attempt(
            request,
            "Échec de modification de la planification",
            LogSource.PLANNING,
            organization=schedule.team.organization,
            team=schedule.team,
            evaluation=schedule.evaluation,
        )
        serializer = EvaluationScheduleInputSerializer(
            schedule,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        schedule = serializer.save()
        evaluation_schedule_updated(request.user, schedule)
        transaction.on_commit(lambda: notify_schedule_created(schedule.pk))
        return Response(EvaluationScheduleSerializer(schedule).data)

    @extend_schema(
        description="Supprime une planification accessible.",
        responses={
            204: None,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, schedule_id: int):
        schedule = manageable_schedule(request.user, schedule_id)
        describe_log_attempt(
            request,
            "Échec de suppression de la planification",
            LogSource.PLANNING,
            organization=schedule.team.organization,
            team=schedule.team,
            evaluation=schedule.evaluation,
        )
        evaluation_schedule_deleted(request.user, schedule)
        schedule.runs.filter(state=EvaluationRunState.NOT_STARTED).delete()
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
