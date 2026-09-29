import uuid

from django.conf import settings
from django.db import models


class ActivityAction(models.TextChoices):
    ORGANIZATION_CREATED = "organization_created", "Organisation créée"
    ORGANIZATION_RENAMED = "organization_renamed", "Organisation renommée"
    ORGANIZATION_DELETED = "organization_deleted", "Organisation supprimée"
    MEMBER_ASSIGNED = "member_assigned", "Membre affecté"
    MEMBER_REMOVED = "member_removed", "Membre retiré"
    USER_INVITED = "user_invited", "Utilisateur invité"
    USER_UPDATED = "user_updated", "Utilisateur modifié"
    USER_ROLE_CHANGED = "user_role_changed", "Fonction modifiée"
    USER_DEACTIVATED = "user_deactivated", "Utilisateur désactivé"
    USER_REACTIVATED = "user_reactivated", "Utilisateur réactivé"
    USER_DELETED = "user_deleted", "Utilisateur supprimé"
    TEAM_CREATED = "team_created", "Équipe créée"
    TEAM_RENAMED = "team_renamed", "Équipe renommée"
    TEAM_ARCHIVED = "team_archived", "Équipe archivée"
    COACH_ASSIGNED = "coach_assigned", "Coach affecté"
    COACH_REMOVED = "coach_removed", "Coach retiré"
    EVALUATION_CREATED = "evaluation_created", "Évaluation créée"
    EVALUATION_RENAMED = "evaluation_renamed", "Évaluation renommée"
    EVALUATION_DELETED = "evaluation_deleted", "Évaluation supprimée"
    QUESTION_CREATED = "question_created", "Question créée"
    QUESTION_UPDATED = "question_updated", "Question modifiée"
    QUESTION_DELETED = "question_deleted", "Question supprimée"
    EVALUATION_SCHEDULED = "evaluation_scheduled", "Évaluation planifiée"
    EVALUATION_SCHEDULE_UPDATED = "evaluation_schedule_updated", "Planification modifiée"
    EVALUATION_SCHEDULE_DELETED = "evaluation_schedule_deleted", "Planification supprimée"


class LogLevel(models.TextChoices):
    INFO = "INFO", "Info"
    WARNING = "WARNING", "Avertissement"
    ERROR = "ERROR", "Erreur"


class LogSource(models.TextChoices):
    TEAMS = "teams", "Équipes"
    ASSESSMENTS = "assessments", "Évaluations"
    PLANNING = "planning", "Planification"
    NOTIFICATIONS = "notifications", "Notifications"
    IDENTITIES = "identities", "Identités"
    ORGANIZATIONS = "organizations", "Organisations"
    SYSTEM = "system", "Système"


class JournalEntryFields(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    organization = models.ForeignKey(
        "identities.Organization",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    organization_name = models.CharField(max_length=255, blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    actor_name = models.CharField(max_length=150, blank=True)
    team = models.ForeignKey(
        "teams.Team",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    team_name = models.CharField(max_length=255, blank=True)

    class Meta:
        abstract = True


class ActivityEntry(JournalEntryFields):
    action = models.CharField(max_length=40, choices=ActivityAction.choices)
    description = models.CharField(max_length=255)

    class Meta:
        ordering = ("-created_at", "-pk")


class LogEntry(JournalEntryFields):
    level = models.CharField(max_length=7, choices=LogLevel.choices)
    source = models.CharField(max_length=40, choices=LogSource.choices)
    operation = models.CharField(max_length=255, blank=True, default="")
    category = models.CharField(max_length=100, blank=True, default="")
    message = models.CharField(max_length=500)
    correlation_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)

    class Meta:
        ordering = ("-created_at", "-pk")
        constraints = [
            models.CheckConstraint(
                condition=models.Q(level__in=LogLevel.values),
                name="journals_log_level_valid",
            )
        ]
