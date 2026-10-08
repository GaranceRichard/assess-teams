from django.db import models
from django.utils import timezone


class PasswordRateLimit(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    count = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)


class PasswordResetDelivery(models.Model):
    # Only the submitted address is queued. Tokens are generated at delivery, never stored.
    email = models.EmailField(max_length=254)
    created_at = models.DateTimeField(default=timezone.now)
    next_attempt_at = models.DateTimeField(default=timezone.now, db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)
