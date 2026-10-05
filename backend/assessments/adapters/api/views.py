from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.scope import (
    mutable_evaluation,
    visible_evaluations,
)
from assessments.adapters.api.serializers import (
    CreateEvaluationInputSerializer,
    EvaluationInputSerializer,
    EvaluationSerializer,
)
from journals.activity_records import evaluation_activity
from journals.log_context import describe_log_attempt
from journals.models import ActivityAction, LogSource


class EvaluationListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Liste, selon leur ordre interne invisible, tous les modèles d’évaluation "
            "pour un Superadmin et ceux de l’organisation d’un Admin."
        ),
        responses={200: EvaluationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        evaluations = visible_evaluations(request.user)
        return Response(EvaluationSerializer(evaluations, many=True).data)

    @extend_schema(
        description=(
            "Crée un brouillon dans une organisation accessible et lui attribue "
            "automatiquement un ordre interne invisible."
        ),
        request=CreateEvaluationInputSerializer,
        responses={
            201: EvaluationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request):
        describe_log_attempt(
            request,
            "Échec de création de l’évaluation",
            LogSource.ASSESSMENTS,
        )
        serializer = CreateEvaluationInputSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()
        describe_log_attempt(
            request,
            "Échec de création de l’évaluation",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
        )
        evaluation_activity(
            request.user,
            evaluation,
            ActivityAction.EVALUATION_CREATED,
            f"Création de l’évaluation {evaluation.name}",
        )
        return Response(EvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)


class EvaluationDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Modifie uniquement le nom d’un brouillon. Un modèle validé ou archivé retourne 400."
        ),
        request=EvaluationInputSerializer,
        responses={
            200: EvaluationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, evaluation_id: int):
        evaluation = mutable_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec de modification de l’évaluation",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
        )
        previous_name = evaluation.name
        serializer = EvaluationInputSerializer(
            evaluation,
            data=request.data,
            context={"organization": evaluation.organization},
        )
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()
        if previous_name != evaluation.name:
            evaluation_activity(
                request.user,
                evaluation,
                ActivityAction.EVALUATION_RENAMED,
                f"Renommage de l’évaluation {evaluation.name}",
            )
        return Response(EvaluationSerializer(evaluation).data)

    @extend_schema(
        description=(
            "Supprime physiquement un brouillon et ses questions ; refuse un modèle immuable."
        ),
        responses={
            204: None,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, evaluation_id: int):
        evaluation = mutable_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec de suppression de l’évaluation",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
        )
        evaluation_activity(
            request.user,
            evaluation,
            ActivityAction.EVALUATION_DELETED,
            f"Suppression de l’évaluation {evaluation.name}",
        )
        evaluation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
