from django.conf import settings
from django.db import models
from django.db.models.functions import Lower


class Team(models.Model):
    organization = models.ForeignKey(
        "identities.Organization",
        on_delete=models.CASCADE,
        related_name="teams",
    )
    name = models.CharField(max_length=255)
    coaches = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="coached_teams",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name", "pk")
        constraints = [
            models.UniqueConstraint(
                "organization",
                Lower("name"),
                name="team_name_unique_per_organization",
            )
        ]
