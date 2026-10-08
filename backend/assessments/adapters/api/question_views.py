from django.db import transaction
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.scope import (
    manageable_evaluation,
    mutable_evaluation,
    mutable_question,
)
from assessments.adapters.api.serializers import QuestionInputSerializer, QuestionSerializer
from assessments.models import Evaluation
from journals.activity_records import question_activity
from journals.log_context import describe_log_attempt
from journals.models import ActivityAction, LogSource


class QuestionListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    def evaluation(self, user, evaluation_id: int) -> Evaluation:
        return manageable_evaluation(user, evaluation_id)

    @extend_schema(
        description="Liste dans l’ordre les questions d’un modèle d’évaluation.",
        responses={
            200: QuestionSerializer(many=True),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, evaluation_id: int):
        evaluation = self.evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "question-list",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
            evaluation=evaluation,
        )
        questions = evaluation.questions.prefetch_related("score_guides")
        return Response(QuestionSerializer(questions, many=True).data)

    @extend_schema(
        description=(
            "Ajoute une question à un brouillon ; refuse un modèle validé ou archivé (400)."
        ),
        request=QuestionInputSerializer,
        responses={
            201: QuestionSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request, evaluation_id: int):
        evaluation = mutable_evaluation(request.user, evaluation_id)
        describe_log_attempt(
            request,
            "Échec d’ajout d’une question",
            LogSource.ASSESSMENTS,
            organization=evaluation.organization,
            evaluation=evaluation,
        )
        serializer = QuestionInputSerializer(data=request.data, context={"evaluation": evaluation})
        serializer.is_valid(raise_exception=True)
        question = serializer.save()
        question_activity(
            request.user,
            question,
            ActivityAction.QUESTION_CREATED,
            f"Ajout de la question {question.name} à l’évaluation {evaluation.name}",
        )
        return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)


class QuestionDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description=(
            "Modifie le nom et les repères facultatifs d’une question de brouillon ; sinon 400. "
            "score_guides remplace la liste entière ; omission conserve, [] supprime. "
            "Chaque score doit être un entier JSON unique de 0 à 10 et le texte non vide."
        ),
        request=QuestionInputSerializer,
        responses={
            200: QuestionSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, question_id: int):
        question = mutable_question(request.user, question_id)
        describe_log_attempt(
            request,
            "Échec de modification de la question",
            LogSource.ASSESSMENTS,
            organization=question.evaluation.organization,
        )
        previous = QuestionSerializer(question).data
        serializer = QuestionInputSerializer(
            question,
            data=request.data,
            context={"evaluation": question.evaluation},
        )
        serializer.is_valid(raise_exception=True)
        question = serializer.save()
        if previous != QuestionSerializer(question).data:
            question_activity(
                request.user,
                question,
                ActivityAction.QUESTION_UPDATED,
                f"Modification de la question {question.name}",
            )
        return Response(QuestionSerializer(question).data)

    @extend_schema(
        description=(
            "Supprime une question de brouillon ; refuse un modèle validé ou archivé (400)."
        ),
        responses={
            204: None,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, question_id: int):
        question = mutable_question(request.user, question_id)
        describe_log_attempt(
            request,
            "Échec de suppression de la question",
            LogSource.ASSESSMENTS,
            organization=question.evaluation.organization,
        )
        question_activity(
            request.user,
            question,
            ActivityAction.QUESTION_DELETED,
            f"Suppression de la question {question.name}",
        )
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
