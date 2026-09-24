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
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_permissions import CanViewManagedUsers, actor_for
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
from identities.domain.managed_users import can_invite_managed_user, can_manage_user
from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role
from identities.models import User


class ManagedUserListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewManagedUsers]

    @extend_schema(
        description="Liste les identités pour un Superadmin, un Admin ou un Coach actif.",
        responses={200: ManagedUserSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        users = User.objects.order_by("username", "email", "pk")
        return Response(ManagedUserSerializer(users, many=True).data)

    @extend_schema(
        description=(
            "Invite un utilisateur. Le Superadmin choisit toute fonction métier ; "
            "l'Admin choisit uniquement Coach ou Viewer."
        ),
        request=InviteUserSerializer,
        responses={201: ManagedUserSerializer, 400: OpenApiResponse(), 403: OpenApiResponse()},
    )
    @transaction.atomic
    def post(self, request):
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not can_invite_managed_user(actor_for(request.user), Role(data["role"])):
            raise PermissionDenied("Cette fonction ne peut pas être créée.")
        user = User(
            username=data["identifier"],
            email=data["email"],
            role=data["role"],
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        transaction.on_commit(lambda: send_invitation(user))
        return Response(ManagedUserSerializer(user).data, status=status.HTTP_201_CREATED)


class ManagedUserDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewManagedUsers]

    def _user(self, user_id: int) -> User:
        return get_object_or_404(User, pk=user_id)

    @extend_schema(
        description=(
            "Modifie une identité autorisée et, selon la fonction de l'appelant, "
            "sa fonction métier. Un Admin multi-organisation ne peut pas devenir "
            "Coach ou Viewer."
        ),
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
        user = get_object_or_404(User.objects.select_for_update(), pk=user_id)
        serializer = UpdateManagedUserSerializer(
            data=request.data,
            context={"user": user},
        )
        serializer.is_valid(raise_exception=True)
        role_value = serializer.validated_data.get("role", user.role)
        requested_role = Role(role_value) if role_value else None
        if not self._can_manage(request, user, requested_role):
            raise PermissionDenied("Vous ne pouvez pas modifier cet utilisateur.")
        if requires_single_organization(requested_role) and user.organizations.count() > 1:
            raise ValidationError(
                {"role": "Un Coach ou un Viewer appartient au plus à une organisation."}
            )
        previous_email = user.email
        user.username = serializer.validated_data["identifier"]
        user.email = serializer.validated_data["email"]
        if not user.is_superuser:
            user.role = requested_role.value
        user.save(update_fields=["email", "role", "username"])
        transaction.on_commit(lambda: send_update_notice(user, previous_email))
        return Response(ManagedUserSerializer(user).data)

    @extend_schema(
        description="Supprime une identité que la fonction de l'appelant peut administrer.",
        responses={
            204: None,
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, user_id: int):
        user = self._user(user_id)
        if not self._can_manage(request, user):
            raise PermissionDenied("Vous ne pouvez pas supprimer cet utilisateur.")
        identifier, email = user.username, user.email
        user.delete()
        transaction.on_commit(lambda: send_deletion_notice(identifier, email))
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def _can_manage(request, user: User, requested_role: Role | None = None) -> bool:
        target_role = Role(user.role) if user.role else None
        return can_manage_user(
            actor_for(request.user),
            target_is_self=user.pk == request.user.pk,
            target_is_superuser=user.is_superuser,
            target_role=target_role,
            requested_role=requested_role,
        )


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
