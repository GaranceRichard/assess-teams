from django.db import connection
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

HEALTH_RESPONSE = inline_serializer(
    name="HealthResponse",
    fields={
        "status": serializers.CharField(),
        "database": serializers.CharField(),
    },
)


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        operation_id="health_retrieve",
        description="Vérifie que l’application et sa base de données répondent.",
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                response=HEALTH_RESPONSE,
                description="Application et base de données disponibles.",
                examples=[
                    OpenApiExample(
                        "Service disponible",
                        value={"status": "ok", "database": "ok"},
                    )
                ],
            ),
        },
        auth=[],
    )
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return Response({"status": "ok", "database": "ok"})
