from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

from identities.domain.palettes import InterfacePalette
from identities.domain.users import Role


class User(AbstractUser):
    interface_palette = models.CharField(
        max_length=5,
        choices=[(palette.value, palette.value) for palette in InterfacePalette],
        default=InterfacePalette.GREEN.value,
    )
    role = models.CharField(
        max_length=6,
        choices=[(role.value, role.value) for role in Role],
        null=True,
        blank=True,
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(interface_palette__in=InterfacePalette.values()),
                name="identity_interface_palette_allowed",
            ),
            models.CheckConstraint(
                condition=(
                    Q(is_superuser=True, role__isnull=True)
                    | Q(is_superuser=False, role__isnull=False, role__in=Role.values())
                ),
                name="identity_has_one_business_role_or_is_superuser",
            ),
        ]


class Organization(models.Model):
    name = models.CharField(max_length=255)
    users = models.ManyToManyField(User, related_name="organizations")

    class Meta:
        ordering = ("name", "pk")
