from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.scope import locked_evaluation
from assessments.adapters.api.serializers import EvaluationSerializer
from assessments.models import EvaluationStatus
from journals.activity_records import evaluation_activity
from journals.log_context import describe_log_attempt
from journals.models import ActivityAction, LogSource


class ValidateEvaluationView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Valide explicitement un brouillon nommé contenant au moins une question. "
            "Le modèle et ses questions deviennent immuables. L’ancienne version VALIDATED "
            "de la famille est automatiquement archivée dans la même transaction."
        ),
        request=None,
        responses={
            200: EvaluationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request, evaluation_id: int):
        evaluation = locked_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec de validation de l’évaluation",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
        )
        if evaluation.status != EvaluationStatus.DRAFT:
            raise ValidationError("Seul un brouillon peut être validé.")
        errors = {}
        if not evaluation.name.strip():
            errors["name"] = "Un nom valide est obligatoire."
        if not evaluation.questions.exists():
            errors["questions"] = "Au moins une question est obligatoire."
        if evaluation.questions.filter(name__regex=r"^\s*$").exists():
            errors["questions"] = "Chaque question doit avoir un nom valide."
        if errors:
            raise ValidationError(errors)
        for previous in evaluation.family.versions.filter(status=EvaluationStatus.VALIDATED):
            previous.status = EvaluationStatus.ARCHIVED
            previous.save(update_fields=["status"])
            evaluation_activity(
                request.user,
                previous,
                ActivityAction.EVALUATION_ARCHIVED,
                f"Archivage automatique de l’évaluation {previous.name}",
            )
        evaluation.status = EvaluationStatus.VALIDATED
        evaluation.save(update_fields=["status"])
        evaluation_activity(
            request.user,
            evaluation,
            ActivityAction.EVALUATION_VALIDATED,
            f"Validation de l’évaluation {evaluation.name}",
        )
        return Response(EvaluationSerializer(evaluation).data)


class ArchiveEvaluationView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Archive logiquement un modèle validé. Il reste accessible en lecture "
            "mais ne peut plus servir à une nouvelle planification."
        ),
        request=None,
        responses={
            200: EvaluationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request, evaluation_id: int):
        evaluation = locked_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec d’archivage de l’évaluation",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
        )
        if evaluation.status != EvaluationStatus.VALIDATED:
            raise ValidationError("Seule une évaluation validée peut être archivée.")
        evaluation.status = EvaluationStatus.ARCHIVED
        evaluation.save(update_fields=["status"])
        evaluation_activity(
            request.user,
            evaluation,
            ActivityAction.EVALUATION_ARCHIVED,
            f"Archivage de l’évaluation {evaluation.name}",
        )
        return Response(EvaluationSerializer(evaluation).data)
