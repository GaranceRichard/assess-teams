from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from identities.adapters.api.admin_permissions import CanViewManagedUsers, actor_for
from identities.adapters.api.admin_serializers import ManagedUserSerializer
from identities.adapters.api.managed_user_scope import visible_managed_users
from identities.adapters.api.user_activity import UserSnapshot, record_user_changes
from identities.application.invitations import send_activation_notice
from identities.application.lifecycle import (
    lock_identity_changes,
    mark_pending_responsibilities,
    validate_user_transition,
)
from identities.domain.managed_users import can_manage_user
from identities.domain.users import Role
from journals.log_context import describe_log_attempt
from journals.models import LogSource

LIFECYCLE_SCOPE = (
    "Superadmin : toute identité hors soi. Admin : Coach/Viewer de son organisation. "
    "Coach : Viewer de son organisation. Session active et CSRF obligatoires. "
)


@transaction.atomic
def change_activation(request, user_id: int, active: bool):
    lock_identity_changes()
    user = get_object_or_404(visible_managed_users(request.user).select_for_update(), pk=user_id)
    previous = UserSnapshot.capture(user)
    describe_log_attempt(
        request,
        "Échec de changement d’activation",
        LogSource.IDENTITIES,
        organization=previous.organization,
    )
    if not can_manage_user(
        actor_for(request.user),
        target_is_self=user.pk == request.user.pk,
        target_is_superuser=user.is_superuser,
        target_role=Role(user.role) if user.role else None,
    ):
        raise PermissionDenied("Vous ne pouvez pas administrer cet utilisateur.")
    validate_user_transition(user, user.role, active)
    if user.is_active != active:
        if not active:
            mark_pending_responsibilities(user)
        user.is_active = active
        user.save(update_fields=["is_active"])
        record_user_changes(request.user, user, previous)
        transaction.on_commit(lambda: send_activation_notice(user))
    return user


class DeactivateUserView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [CanViewManagedUsers]
    active = False

    @extend_schema(
        request=None,
        description=LIFECYCLE_SCOPE + "Désactive sans supprimer ; dernier Admin actif protégé.",
        responses={
            200: ManagedUserSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    @transaction.atomic
    def post(self, request, user_id: int):
        user = change_activation(request, user_id, self.active)
        return Response(ManagedUserSerializer(user).data)


class ReactivateUserView(DeactivateUserView):
    active = True

    @extend_schema(
        request=None,
        description=LIFECYCLE_SCOPE
        + "Réactive après validation des invariants, sans responsabilité restaurée.",
        responses={
            200: ManagedUserSerializer,
            400: OpenApiResponse(),
            403: OpenApiResponse(),
            404: OpenApiResponse(),
        },
    )
    def post(self, request, user_id: int):
        return super().post(request, user_id)
