from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.taking_permissions import CanTakeEvaluations
from assessments.adapters.api.taking_scope import (
    accessible_evaluation_run,
    visible_evaluation_runs,
)
from assessments.adapters.api.taking_serializers import (
    EvaluationRevisionSerializer,
    EvaluationRunListSerializer,
    EvaluationRunSerializer,
    EvaluationScoreSerializer,
)
from assessments.application.taking import (
    complete_evaluation,
    revise_evaluation,
    save_evaluation_score,
    start_evaluation,
)
from assessments.application.taking_scope import is_evaluation_admin
from journals.log_context import describe_log_attempt
from journals.models import LogSource


def scoped_run(request, run_id: int):
    run = accessible_evaluation_run(request.user, run_id)
    describe_log_attempt(
        request,
        "Passation d’une évaluation",
        LogSource.ASSESSMENTS,
        organization=run.organization,
        team=run.team,
        evaluation=run.evaluation,
    )
    return run


class EvaluationRunListView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanTakeEvaluations]

    @extend_schema(
        description=(
            "Liste les évaluations assignées au Coach ou attendues dans le périmètre "
            "administratif, avec auteur, complétion et dernière révision."
        ),
        responses={200: EvaluationRunListSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        serializer = EvaluationRunListSerializer(
            visible_evaluation_runs(request.user),
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class EvaluationRunView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanTakeEvaluations]

    @extend_schema(
        description="Récupère une passation ; les questions ordonnées sont figées au démarrage.",
        responses={200: EvaluationRunSerializer, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    def get(self, request, run_id: int):
        run = scoped_run(request, run_id)
        return Response(EvaluationRunSerializer(run, context={"request": request}).data)

    @extend_schema(
        description=(
            "Commence une passation sur un modèle validé ou reprend sans double création "
            "celle liée à la planification accessible, même après archivage du modèle. "
            "Le périmètre est revérifié sur la passation verrouillée avant toute mutation."
        ),
        request=None,
        responses={
            200: EvaluationRunSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def post(self, request, run_id: int):
        run = scoped_run(request, run_id)
        if request.data:
            raise ValidationError("Le contexte d’une passation ne peut pas être remplacé.")
        run = start_evaluation(run, request.user)
        return Response(EvaluationRunSerializer(run, context={"request": request}).data)


class EvaluationScoreView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanTakeEvaluations]

    @extend_schema(
        description=(
            "Enregistre une note de brouillon entière entre 0 et 10. "
            "Le périmètre est revérifié sur la passation verrouillée avant toute mutation."
        ),
        request=EvaluationScoreSerializer,
        responses={
            204: None,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def put(self, request, run_id: int, question_id: int):
        run = scoped_run(request, run_id)
        serializer = EvaluationScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        save_evaluation_score(run, request.user, question_id, serializer.validated_data["score"])
        return Response(status=204)


class EvaluationFinalizeView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanTakeEvaluations]

    @extend_schema(
        description=(
            "Finalise atomiquement une passation dont toutes les notes sont présentes. "
            "Le périmètre est revérifié sur la passation verrouillée avant toute mutation."
        ),
        request=None,
        responses={
            200: EvaluationRunSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def post(self, request, run_id: int):
        run = scoped_run(request, run_id)
        if request.data:
            raise ValidationError("La provenance de complétion est déterminée par le serveur.")
        run = complete_evaluation(run, request.user)
        return Response(EvaluationRunSerializer(run, context={"request": request}).data)


class EvaluationRevisionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanTakeEvaluations]

    @extend_schema(
        description=(
            "Révise atomiquement toutes les notes d’une évaluation complétée sans "
            "modifier son auteur ni sa date de complétion initiaux. "
            "Le périmètre est revérifié sur la passation verrouillée avant toute mutation."
        ),
        request=EvaluationRevisionSerializer,
        responses={
            200: EvaluationRunSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def put(self, request, run_id: int):
        run = scoped_run(request, run_id)
        if not is_evaluation_admin(request.user):
            raise PermissionDenied("Seul un Admin peut réviser une évaluation.")
        serializer = EvaluationRevisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        run = revise_evaluation(
            run,
            request.user,
            serializer.validated_data["answers"],
        )
        return Response(EvaluationRunSerializer(run, context={"request": request}).data)
