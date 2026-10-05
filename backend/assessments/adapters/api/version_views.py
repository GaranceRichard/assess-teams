from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.scope import manageable_evaluation
from assessments.adapters.api.serializers import EvaluationSerializer
from assessments.application.versioning import create_next_version
from journals.log_context import describe_log_attempt
from journals.models import LogSource


class CreateEvaluationVersionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Admin de l’organisation ou Superadmin : crée la prochaine version DRAFT "
            "d’une famille depuis toute version accessible. Copie le nom et toutes les "
            "questions avec leur ordre ; la source reste inchangée. Numérotation atomique. "
            "Les champs du corps sont ignorés ; la source provient exclusivement de l’URL."
        ),
        request=None,
        responses={201: EvaluationSerializer, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    def post(self, request, evaluation_id: int):
        source = manageable_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec de création d’une version",
            LogSource.ASSESSMENTS,
            organization=source.organization,
            evaluation=source,
        )
        created = create_next_version(source.pk, request.user)
        describe_log_attempt(
            request,
            "evaluation-version-create",
            LogSource.ASSESSMENTS,
            organization=created.organization,
            evaluation=created,
        )
        return Response(EvaluationSerializer(created).data, status=status.HTTP_201_CREATED)
