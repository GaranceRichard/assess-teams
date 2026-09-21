from dataclasses import dataclass

from identities.domain.users import Actor, Identity, Role, ensure_user_creation_allowed
from identities.ports.users import UserRepository


@dataclass(frozen=True)
class CreateUserCommand:
    actor: Actor
    username: str
    password: str
    role: Role


def create_user(command: CreateUserCommand, repository: UserRepository) -> Identity:
    ensure_user_creation_allowed(command.actor, command.role)
    return repository.create(command.username, command.password, command.role)
