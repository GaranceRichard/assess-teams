from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_permissions import CanViewManagedUsers, actor_for
from identities.adapters.api.admin_serializers import (
    InviteUserSerializer,
    ManagedUserSerializer,
    UpdateManagedUserSerializer,
)
from identities.adapters.api.managed_user_scope import visible_managed_users
from identities.adapters.api.organization_scope import assigned_admin_organization
from identities.adapters.api.user_activity import (
    UserSnapshot,
    record_invitation,
    record_user_changes,
    record_user_deletion,
)
from identities.application.invitations import (
    send_deletion_notice,
    send_invitation,
    send_update_notice,
)
from identities.domain.managed_users import can_invite_managed_user, can_manage_user
from identities.domain.organizations import requires_single_organization
from identities.domain.users import Role
from identities.models import User
from journals.error_context import describe_attempt


class ManagedUserListCreateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewManagedUsers]

    @extend_schema(
        description=(
            "Liste toutes les identités pour un Superadmin. Un Admin, Coach ou "
            "Viewer ne voit que les membres de son organisation, ou une liste vide "
            "sans rattachement."
        ),
        responses={200: ManagedUserSerializer(many=True), 403: OpenApiResponse()},
    )
    def get(self, request):
        users = visible_managed_users(request.user).order_by("username", "email", "pk")
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
        describe_attempt(request, "Échec d’envoi de l’invitation")
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not can_invite_managed_user(actor_for(request.user), Role(data["role"])):
            raise PermissionDenied("Cette fonction ne peut pas être créée.")
        organization = None
        if not request.user.is_superuser:
            organization = assigned_admin_organization(request.user)
            describe_attempt(
                request,
                "Échec d’envoi de l’invitation",
                organization=organization,
            )
        user = User(
            username=data["identifier"],
            email=data["email"],
            role=data["role"],
            is_active=True,
        )
        user.set_unusable_password()
        user.save()
        if organization:
            organization.users.add(user)
        record_invitation(request.user, user, organization)
        transaction.on_commit(lambda: send_invitation(user))
        return Response(ManagedUserSerializer(user).data, status=status.HTTP_201_CREATED)


class ManagedUserDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewManagedUsers]

    @extend_schema(
        description=(
            "Modifie une identité autorisée et, selon la fonction de l'appelant, "
            "sa fonction métier ou son activation. Seul le Superadmin administre "
            "un Admin. Un Coach agit uniquement sur un Viewer de son organisation."
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
        users = visible_managed_users(request.user).select_for_update()
        user = get_object_or_404(users, pk=user_id)
        previous = UserSnapshot.capture(user)
        describe_attempt(
            request,
            "Échec de modification de l’utilisateur",
            organization=previous.organization,
        )
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
                {"role": ("Un Admin, un Coach ou un Viewer appartient au plus à une organisation.")}
            )
        previous_email = user.email
        user.username = serializer.validated_data["identifier"]
        user.email = serializer.validated_data["email"]
        if not user.is_superuser:
            user.role = requested_role.value
        user.is_active = serializer.validated_data.get("is_active", user.is_active)
        user.save(update_fields=["email", "is_active", "role", "username"])
        record_user_changes(request.user, user, previous)
        transaction.on_commit(lambda: send_update_notice(user, previous_email))
        return Response(ManagedUserSerializer(user).data)

    @extend_schema(
        description=(
            "Supprime une identité que la fonction de l'appelant peut administrer. "
            "Un Coach agit uniquement sur un Viewer de son organisation."
        ),
        responses={
            204: None,
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def delete(self, request, user_id: int):
        user = get_object_or_404(visible_managed_users(request.user), pk=user_id)
        organization = user.organizations.first()
        describe_attempt(
            request,
            "Échec de suppression de l’utilisateur",
            organization=organization,
        )
        if not self._can_manage(request, user):
            raise PermissionDenied("Vous ne pouvez pas supprimer cet utilisateur.")
        identifier, email = user.username, user.email
        record_user_deletion(request.user, user, organization)
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
