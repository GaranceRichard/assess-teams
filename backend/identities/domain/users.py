from dataclasses import dataclass
from enum import StrEnum


class Role(StrEnum):
    ADMIN = "Admin"
    COACH = "Coach"
    VIEWER = "Viewer"

    @classmethod
    def values(cls) -> tuple[str, ...]:
        return tuple(role.value for role in cls)


@dataclass(frozen=True)
class Actor:
    is_active: bool
    is_superuser: bool
    role: Role | None


@dataclass(frozen=True)
class Identity:
    id: int
    username: str
    role: Role
    is_active: bool


class UserCreationForbidden(Exception):
    pass


def ensure_user_creation_allowed(actor: Actor, requested_role: Role) -> None:
    if actor.is_active and actor.is_superuser:
        return
    raise UserCreationForbidden
