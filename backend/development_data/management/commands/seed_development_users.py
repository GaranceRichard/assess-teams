from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from identities.domain.users import Role
from identities.models import User

DEVELOPMENT_CREDENTIAL = "AssessTeams-Local-2026!"
DEVELOPMENT_IDENTITIES = (
    ("admin.dev@assess-teams.local", Role.ADMIN),
    ("coach.dev@assess-teams.local", Role.COACH),
    ("viewer.dev@assess-teams.local", Role.VIEWER),
)


class Command(BaseCommand):
    help = "Create the three local-only business identities without changing existing users."

    @transaction.atomic
    def handle(self, *args: object, **options: object) -> None:
        if settings.ENVIRONMENT != "development":
            raise CommandError("Development identities are disabled outside development.")

        for username, role in DEVELOPMENT_IDENTITIES:
            existing = User.objects.filter(username=username).first()
            if existing and self._matches_development_identity(existing, username, role):
                self.stdout.write(f"already ready {username}")
                continue
            if existing:
                raise CommandError(f"Reserved development identity conflicts: {username}")
            User.objects.create_user(
                username=username,
                email=username,
                password=DEVELOPMENT_CREDENTIAL,
                role=role.value,
                is_active=True,
            )
            self.stdout.write(self.style.SUCCESS(f"created {username}"))

    @staticmethod
    def _matches_development_identity(user: User, username: str, role: Role) -> bool:
        return (
            user.email == username
            and user.role == role.value
            and user.is_active
            and not user.is_superuser
            and user.check_password(DEVELOPMENT_CREDENTIAL)
        )
