from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_serializers import ChoosePasswordSerializer
from identities.application.invitations import invitation_is_valid
from identities.application.lifecycle import lock_identity_changes
from identities.application.passwords import validate_new_password
from identities.models import User


@method_decorator(csrf_protect, name="dispatch")
class AcceptInvitationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        request=ChoosePasswordSerializer,
        responses={
            204: None,
            400: OpenApiResponse(OpenApiTypes.OBJECT),
            403: OpenApiResponse(),
        },
        auth=[],
    )
    @transaction.atomic
    def post(self, request, uid: str, token: str):
        lock_identity_changes()
        serializer = ChoosePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            user = None
        if user is None or not invitation_is_valid(user, token):
            return Response(
                {"detail": "Cette invitation est invalide ou expirée."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_new_password(
                user, serializer.validated_data["password"], serializer.validated_data["password"]
            )
        except DjangoValidationError as exc:
            raise ValidationError(exc.message_dict) from None
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)
