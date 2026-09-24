from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from identities.domain.users import Role
from identities.models import User

DEVELOPMENT_CREDENTIAL = "AssessTeams-Local-2026!"
DEVELOPMENT_IDENTITIES = (
    ("Admin", "admin.dev@assess-teams.local", Role.ADMIN),
    ("Coach", "coach.dev@assess-teams.local", Role.COACH),
    ("Viewer", "viewer.dev@assess-teams.local", Role.VIEWER),
)
LEGACY_IDENTIFIERS = {
    Role.ADMIN: ("admin.dev@assess-teams.local",),
    Role.COACH: ("coach.dev@assess-teams.local",),
    Role.VIEWER: ("viewer.dev@assess-teams.local",),
}


class Command(BaseCommand):
    help = "Create the three local-only business identities without changing existing users."

    @transaction.atomic
    def handle(self, *args: object, **options: object) -> None:
        if settings.ENVIRONMENT != "development":
            raise CommandError("Development identities are disabled outside development.")

        for username, email, role in DEVELOPMENT_IDENTITIES:
            self._reconcile_identity(username, email, role)

    def _reconcile_identity(self, username: str, email: str, role: Role) -> None:
        identifiers = (username, username.lower(), *LEGACY_IDENTIFIERS[role])
        candidates = list(User.objects.filter(username__in=identifiers).order_by("id"))
        for candidate in candidates:
            if candidate.is_superuser or candidate.role != role.value:
                raise CommandError(f"Reserved development identity conflicts: {candidate.username}")

        if not candidates:
            User.objects.create_user(
                username=username,
                email=email,
                password=DEVELOPMENT_CREDENTIAL,
                role=role.value,
                is_active=True,
            )
            self.stdout.write(self.style.SUCCESS(f"created {username}"))
            return

        identity = next(
            (candidate for candidate in candidates if candidate.username == username),
            candidates[0],
        )
        duplicate_ids = [candidate.id for candidate in candidates if candidate.id != identity.id]
        if duplicate_ids:
            User.objects.filter(id__in=duplicate_ids).delete()

        changed_fields = []
        for field, value in (("username", username), ("email", email), ("is_active", True)):
            if getattr(identity, field) != value:
                setattr(identity, field, value)
                changed_fields.append(field)
        if not identity.check_password(DEVELOPMENT_CREDENTIAL):
            identity.set_password(DEVELOPMENT_CREDENTIAL)
            changed_fields.append("password")
        if changed_fields:
            identity.save(update_fields=changed_fields)
        self.stdout.write(f"already ready {username}")
