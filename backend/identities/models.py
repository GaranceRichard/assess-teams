from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

from identities.domain.users import Role


class User(AbstractUser):
    role = models.CharField(
        max_length=6,
        choices=[(role.value, role.value) for role in Role],
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(is_superuser=True, role__isnull=True)
                    | Q(is_superuser=False, role__isnull=False, role__in=Role.values())
                ),
                name="identity_has_one_business_role_or_is_superuser",
            )
        ]
