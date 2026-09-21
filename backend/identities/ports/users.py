from typing import Protocol

from identities.domain.users import Identity, Role


class IdentityAlreadyExists(Exception):
    pass


class UserRepository(Protocol):
    def create(self, username: str, password: str, role: Role) -> Identity: ...
