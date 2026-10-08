from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import Throttled, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.password_serializers import (
    PasswordChangeSerializer,
    PasswordRecoveryResponseSerializer,
    PasswordRecoverySerializer,
    PasswordResetSerializer,
)
from identities.application.password_limits import allow_password_attempt
from identities.application.passwords import change_password, reset_password
from identities.password_models import PasswordResetDelivery

CSRF_HEADER = OpenApiParameter("X-CSRFToken", str, OpenApiParameter.HEADER, required=True)
ERRORS = {
    400: OpenApiResponse(OpenApiTypes.OBJECT, "Validation refusée ; aucun changement."),
    403: OpenApiResponse(description="CSRF refusé ou session requise absente."),
    429: OpenApiResponse(OpenApiTypes.OBJECT, "Trop de tentatives. Réessayez plus tard."),
}
GENERIC_RECOVERY = "Si un compte actif correspond à cette adresse, un lien vous sera envoyé."


def limit_ip(request, scope: str, limit: int, seconds: int):
    # Forwarded headers are untrusted. The reverse proxy must set REMOTE_ADDR correctly.
    if not allow_password_attempt(
        scope, request.META.get("REMOTE_ADDR", "unknown"), limit, seconds
    ):
        raise Throttled(wait=seconds, detail="Trop de tentatives. Réessayez plus tard.")


def password_action(action, *args):
    try:
        return action(*args)
    except DjangoValidationError as exc:
        raise ValidationError(exc.message_dict) from None


class PrivatePasswordView(APIView):
    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store"
        response["Referrer-Policy"] = "no-referrer"
        return response


@method_decorator(csrf_protect, name="dispatch")
@method_decorator(sensitive_post_parameters(), name="dispatch")
class PasswordRecoveryView(PrivatePasswordView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="password_recovery_request",
        description=(
            "Demande publique, réponse 202 identique pour toute adresse valide. "
            "Remise différée pour compte actif unique avec mot de passe utilisable. "
            "20 demandes/heure/IP ; 3/heure/adresse, suppression silencieuse au-delà."
        ),
        request=PasswordRecoverySerializer,
        parameters=[CSRF_HEADER],
        responses={202: PasswordRecoveryResponseSerializer, **ERRORS},
        auth=[],
    )
    def post(self, request):
        limit_ip(request, "recovery-ip", 20, 3600)
        serializer = PasswordRecoverySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        if allow_password_attempt("recovery-email", email, 3, 3600):
            PasswordResetDelivery.objects.create(email=email)
        return Response({"detail": GENERIC_RECOVERY}, status=202)


@method_decorator(csrf_protect, name="dispatch")
@method_decorator(sensitive_post_parameters(), name="dispatch")
class PasswordResetView(PrivatePasswordView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="password_reset_confirm",
        description=(
            "Réinitialisation publique : token Django dédié valable une heure, invalidé "
            "par usage, changement de mot de passe ou connexion. Vérification atomique. "
            "Invalide toutes les sessions sans connexion automatique. "
            "30 tentatives/15 minutes/IP ; 10/15 minutes/uid."
        ),
        request=PasswordResetSerializer,
        parameters=[CSRF_HEADER],
        responses={204: None, **ERRORS},
        auth=[],
    )
    def post(self, request):
        limit_ip(request, "reset-ip", 30, 900)
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not allow_password_attempt("reset-uid", data["uid"], 10, 900):
            raise Throttled(wait=900, detail="Trop de tentatives. Réessayez plus tard.")
        password_action(
            reset_password,
            data["uid"],
            data["token"],
            data["password"],
            data["password_confirmation"],
        )
        return Response(status=204)


@method_decorator(sensitive_post_parameters(), name="dispatch")
class PasswordChangeView(PrivatePasswordView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="session_password_change",
        description=(
            "Modifie uniquement le compte connecté, pour tout rôle. Mot de passe actuel "
            "obligatoire, aucun identifiant cible accepté. Conserve et renouvelle la session "
            "courante ; invalide les autres sessions et liens. "
            "5 tentatives/15 minutes/compte ; 30/15 minutes/IP."
        ),
        request=PasswordChangeSerializer,
        parameters=[CSRF_HEADER],
        responses={204: None, **ERRORS},
    )
    def post(self, request):
        limit_ip(request, "change-ip", 30, 900)
        if not allow_password_attempt("change-user", str(request.user.pk), 5, 900):
            raise Throttled(wait=900, detail="Trop de tentatives. Réessayez plus tard.")
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = password_action(
            change_password,
            request.user.pk,
            data["current_password"],
            data["password"],
            data["password_confirmation"],
        )
        update_session_auth_hash(request, user)
        return Response(status=204)
