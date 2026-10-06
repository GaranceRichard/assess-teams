from dataclasses import dataclass

from identities.models import Organization, User
from journals.activity_records import user_activity
from journals.models import ActivityAction


@dataclass(frozen=True)
class UserSnapshot:
    identifier: str
    email: str
    role: str | None
    is_active: bool
    organization: Organization | None

    @classmethod
    def capture(cls, user: User) -> "UserSnapshot":
        return cls(
            identifier=user.username,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            organization=user.organizations.first(),
        )


def record_invitation(actor: User, user: User, organization: Organization | None) -> None:
    user_activity(
        actor,
        user,
        ActivityAction.USER_INVITED,
        f"Invitation de {user.username} comme {user.role}",
        organization,
    )


def record_user_changes(actor: User, user: User, previous: UserSnapshot) -> None:
    if previous.identifier != user.username or previous.email != user.email:
        user_activity(
            actor,
            user,
            ActivityAction.USER_UPDATED,
            f"Modification de {user.username}",
            previous.organization,
        )
    if previous.role != user.role:
        user_activity(
            actor,
            user,
            ActivityAction.USER_ROLE_CHANGED,
            f"Changement de fonction de {user.username} : {previous.role} → {user.role}",
            previous.organization,
        )
    if previous.is_active != user.is_active:
        action = (
            ActivityAction.USER_REACTIVATED if user.is_active else ActivityAction.USER_DEACTIVATED
        )
        label = "Réactivation" if user.is_active else "Désactivation"
        user_activity(
            actor,
            user,
            action,
            f"{label} de {user.username}",
            previous.organization,
        )
