from django.db import connection
from django.db.models import F
from rest_framework.exceptions import ValidationError

from identities.domain.users import Role
from identities.models import Organization, User

LAST_ADMIN_MESSAGE = "Affectez ou activez d’abord un autre Admin dans cette organisation."


def lock_identity_changes() -> None:
    """Serialize role, activation and membership writes before reading invariants."""
    if connection.vendor == "sqlite":
        # SQLite has no row locks: obtain its writer lock before the first read.
        Organization.objects.update(name=F("name"))
    else:
        list(Organization.objects.select_for_update().order_by("pk"))


def validate_user_transition(
    user: User, role: str | None, active: bool, *, identity_validated: bool = False
) -> None:
    if user.role == Role.ADMIN.value and user.is_active and (not active or role != user.role):
        for organization in user.organizations.all():
            if (
                not organization.users.filter(role=Role.ADMIN.value, is_active=True)
                .exclude(pk=user.pk)
                .exists()
            ):
                raise ValidationError({"detail": LAST_ADMIN_MESSAGE})
    if active:
        if not user.is_superuser and role not in Role.values():
            raise ValidationError({"role": "La fonction métier est invalide."})
        if not user.is_superuser and user.organizations.count() > 1:
            raise ValidationError({"detail": "Une identité appartient au plus à une organisation."})
        if user.is_active or identity_validated:
            return
        duplicates = User.objects.exclude(pk=user.pk)
        if duplicates.filter(username__iexact=user.username).exists() or (
            user.email and duplicates.filter(email__iexact=user.email).exists()
        ):
            raise ValidationError({"detail": "Une identité utilise déjà cet identifiant ou mail."})


def mark_pending_responsibilities(user: User) -> None:
    from assessments.models import EvaluationRunState, EvaluationSchedule

    EvaluationSchedule.objects.filter(assignee=user).exclude(
        mode__in=("immediate", "fixed"), runs__state=EvaluationRunState.COMPLETED
    ).update(requires_reassignment=True)
