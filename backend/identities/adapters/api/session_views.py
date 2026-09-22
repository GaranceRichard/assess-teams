from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.session_serializers import (
    LoginSerializer,
    SessionUserSerializer,
)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="session_login",
        description="Ouvre une session produit pour une identité active.",
        request=LoginSerializer,
        responses={
            200: SessionUserSerializer,
            400: OpenApiResponse(OpenApiTypes.OBJECT, "Données invalides."),
            401: OpenApiResponse(description="Identifiants invalides ou compte inactif."),
            403: OpenApiResponse(description="Contrôle CSRF refusé."),
        },
        auth=[],
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, **serializer.validated_data)
        if user is None:
            return Response(
                {"detail": "Identifiant ou mot de passe invalide."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        login(request, user)
        return Response(SessionUserSerializer(user).data)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CurrentSessionView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="session_current",
        description="Retourne l'identité et la fonction de la session produit active.",
        responses={
            200: SessionUserSerializer,
            403: OpenApiResponse(description="Aucune session produit active."),
        },
    )
    def get(self, request):
        return Response(SessionUserSerializer(request.user).data)


class LogoutView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="session_logout",
        description="Ferme la session produit active.",
        request=None,
        responses={
            204: None,
            403: OpenApiResponse(description="Session absente ou contrôle CSRF refusé."),
        },
    )
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
