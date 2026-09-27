from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.adapters.api.permissions import CanManageEvaluations
from assessments.adapters.api.serializers import (
    EvaluationInputSerializer,
    EvaluationSerializer,
    QuestionInputSerializer,
    QuestionSerializer,
)
from assessments.models import Evaluation, Question


class EvaluationListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description="Liste les modèles d’évaluation dans l’ordre de leur index.",
        responses={200: EvaluationSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        return Response(EvaluationSerializer(Evaluation.objects.all(), many=True).data)

    @extend_schema(
        description="Crée un modèle d’évaluation ordonné.",
        request=EvaluationInputSerializer,
        responses={201: EvaluationSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    def post(self, request):
        serializer = EvaluationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evaluation = serializer.save()
        return Response(EvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)


class EvaluationDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description="Modifie l’index et le nom d’un modèle d’évaluation.",
        request=EvaluationInputSerializer,
        responses={
            200: EvaluationSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def put(self, request, evaluation_id: int):
        evaluation = get_object_or_404(Evaluation, pk=evaluation_id)
        serializer = EvaluationInputSerializer(evaluation, data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(EvaluationSerializer(serializer.save()).data)

    @extend_schema(
        description="Supprime un modèle d’évaluation et ses questions.",
        responses={204: None, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    def delete(self, request, evaluation_id: int):
        get_object_or_404(Evaluation, pk=evaluation_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QuestionListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    def evaluation(self, evaluation_id: int) -> Evaluation:
        return get_object_or_404(Evaluation, pk=evaluation_id)

    @extend_schema(
        description="Liste dans l’ordre les questions d’un modèle d’évaluation.",
        responses={
            200: QuestionSerializer(many=True),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def get(self, request, evaluation_id: int):
        questions = self.evaluation(evaluation_id).questions.all()
        return Response(QuestionSerializer(questions, many=True).data)

    @extend_schema(
        description="Ajoute une question ordonnée à un modèle d’évaluation.",
        request=QuestionInputSerializer,
        responses={
            201: QuestionSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def post(self, request, evaluation_id: int):
        evaluation = self.evaluation(evaluation_id)
        serializer = QuestionInputSerializer(data=request.data, context={"evaluation": evaluation})
        serializer.is_valid(raise_exception=True)
        question = serializer.save()
        return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)


class QuestionDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanManageEvaluations]

    @extend_schema(
        description="Modifie l’index et le nom d’une question.",
        request=QuestionInputSerializer,
        responses={
            200: QuestionSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def put(self, request, question_id: int):
        question = get_object_or_404(Question.objects.select_related("evaluation"), pk=question_id)
        serializer = QuestionInputSerializer(
            question,
            data=request.data,
            context={"evaluation": question.evaluation},
        )
        serializer.is_valid(raise_exception=True)
        return Response(QuestionSerializer(serializer.save()).data)

    @extend_schema(
        description="Supprime une question d’un modèle d’évaluation.",
        responses={204: None, 403: OpenApiResponse(), 404: OpenApiResponse()},
    )
    def delete(self, request, question_id: int):
        get_object_or_404(Question, pk=question_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
