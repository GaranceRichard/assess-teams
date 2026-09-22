from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views.decorators.csrf import csrf_protect
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_permissions import IsSuperadmin
from identities.adapters.api.admin_serializers import (
    ChoosePasswordSerializer,
    InviteUserSerializer,
    ManagedUserSerializer,
    UpdateManagedUserSerializer,
)
from identities.application.invitations import (
    invitation_is_valid,
    send_deletion_notice,
    send_invitation,
    send_update_notice,
)
from identities.models import User


class ManagedUserListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsSuperadmin]

    @extend_schema(responses={200: ManagedUserSerializer(many=True), 403: OpenApiResponse()})
    def get(self, request):
        users = User.objects.order_by("first_name", "email", "pk")
        return Response(ManagedUserSerializer(users, many=True).data)

    @extend_schema(
        request=InviteUserSerializer,
        responses={201: ManagedUserSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    @transaction.atomic
    def post(self, request):
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User(
            username=data["email"],
            email=data["email"],
            first_name=data["name"],
            role=data["role"],
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        transaction.on_commit(lambda: send_invitation(user))
        return Response(ManagedUserSerializer(user).data, status=status.HTTP_201_CREATED)


class ManagedUserDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsSuperadmin]

    def _user(self, user_id: int) -> User:
        return get_object_or_404(User, pk=user_id)

    @extend_schema(
        request=UpdateManagedUserSerializer,
        responses={
            200: ManagedUserSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def put(self, request, user_id: int):
        user = self._user(user_id)
        serializer = UpdateManagedUserSerializer(
            data=request.data,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)
        previous_email = user.email
        user.first_name = serializer.validated_data["name"]
        user.email = serializer.validated_data["email"]
        user.username = user.email
        user.save(update_fields=["first_name", "email", "username"])
        transaction.on_commit(lambda: send_update_notice(user, previous_email))
        return Response(ManagedUserSerializer(user).data)

    @extend_schema(
        responses={
            204: None,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        }
    )
    @transaction.atomic
    def delete(self, request, user_id: int):
        user = self._user(user_id)
        if user.pk == request.user.pk:
            return Response(
                {"detail": "Le Superadmin connecté ne peut pas supprimer son propre compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        name, email = user.first_name or user.username, user.email
        user.delete()
        transaction.on_commit(lambda: send_deletion_notice(name, email))
        return Response(status=status.HTTP_204_NO_CONTENT)


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
    def post(self, request, uid: str, token: str):
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
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)
