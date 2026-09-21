from dataclasses import dataclass, field

import pytest

from identities.application.create_user import CreateUserCommand, create_user
from identities.domain.users import Actor, Identity, Role, UserCreationForbidden


@dataclass
class FakeRepository:
    created_roles: list[Role] = field(default_factory=list)

    def create(self, username: str, password: str, role: Role) -> Identity:
        self.created_roles.append(role)
        return Identity(id=42, username=username, role=role, is_active=True)


def command(actor: Actor, role: Role) -> CreateUserCommand:
    return CreateUserCommand(actor, "new-user", "valid-pass-123", role)


@pytest.mark.parametrize("role", list(Role))
def test_superadmin_creation_policy_accepts_every_business_role(role: Role) -> None:
    repository = FakeRepository()
    actor = Actor(is_active=True, is_superuser=True, role=None)

    identity = create_user(command(actor, role), repository)

    assert identity.role is role
    assert repository.created_roles == [role]


@pytest.mark.parametrize("role", [Role.COACH, Role.VIEWER])
def test_admin_creation_policy_accepts_non_admin_roles(role: Role) -> None:
    repository = FakeRepository()
    actor = Actor(is_active=True, is_superuser=False, role=Role.ADMIN)

    create_user(command(actor, role), repository)

    assert repository.created_roles == [role]


@pytest.mark.parametrize(
    "actor",
    [
        Actor(is_active=False, is_superuser=True, role=None),
        Actor(is_active=True, is_superuser=False, role=Role.ADMIN),
        Actor(is_active=True, is_superuser=False, role=Role.COACH),
        Actor(is_active=True, is_superuser=False, role=Role.VIEWER),
    ],
)
def test_forbidden_creation_never_calls_repository(actor: Actor) -> None:
    repository = FakeRepository()

    with pytest.raises(UserCreationForbidden):
        create_user(command(actor, Role.ADMIN), repository)

    assert repository.created_roles == []
