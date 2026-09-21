from django.db import IntegrityError, transaction

from identities.domain.users import Identity, Role
from identities.models import User
from identities.ports.users import IdentityAlreadyExists


class DjangoUserRepository:
    @transaction.atomic
    def create(self, username: str, password: str, role: Role) -> Identity:
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                role=role.value,
                is_active=True,
            )
        except IntegrityError as error:
            raise IdentityAlreadyExists from error
        return Identity(
            id=user.pk,
            username=user.username,
            role=Role(user.role),
            is_active=user.is_active,
        )
