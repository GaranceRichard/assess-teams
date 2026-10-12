import uuid

from django.db import models
from django.utils import timezone


class DeliveryState(models.TextChoices):
    PENDING = "pending", "En attente"
    SENDING = "sending", "En cours"
    RETRY = "retry", "Reprise prévue"
    SENT = "sent", "Acceptée par SMTP"
    FAILED = "failed", "Échec"
    UNKNOWN = "unknown", "Remise incertaine"
    CANCELLED = "cancelled", "Annulée"


class EmailNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_key = models.CharField(max_length=255, unique=True)
    recipient = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    invitation = models.BooleanField(default=False)
    schedule_notification = models.BooleanField(default=False)
    schedule = models.ForeignKey(
        "assessments.EvaluationSchedule", null=True, on_delete=models.SET_NULL
    )
    user = models.ForeignKey("identities.User", null=True, on_delete=models.SET_NULL)
    organization = models.ForeignKey(
        "identities.Organization", null=True, on_delete=models.SET_NULL
    )
    team = models.ForeignKey("teams.Team", null=True, on_delete=models.SET_NULL)
    evaluation = models.ForeignKey("assessments.Evaluation", null=True, on_delete=models.SET_NULL)
    state = models.CharField(max_length=16, choices=DeliveryState, default=DeliveryState.PENDING)
    attempts = models.PositiveIntegerField(default=0)
    next_attempt_at = models.DateTimeField(default=timezone.now, db_index=True)
    claimed_at = models.DateTimeField(null=True)
    claim = models.UUIDField(null=True)
    created_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True)
    error_code = models.CharField(max_length=40, blank=True)

    class Meta:
        indexes = [models.Index(fields=["state", "next_attempt_at"])]
