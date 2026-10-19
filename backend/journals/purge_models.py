"""Operational receipts are separate from the journals they govern."""

import uuid

from django.db import models


class JournalPurgeRun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reference_at = models.DateTimeField()
    cutoff = models.DateTimeField()
    retention_days = models.PositiveIntegerField()
    upper_pk = models.PositiveBigIntegerField(default=0)
    cursor = models.PositiveBigIntegerField(default=0)
    max_rows = models.PositiveIntegerField()
    batch_size = models.PositiveIntegerField()
    matched_count = models.PositiveIntegerField(default=0)
    deleted_count = models.PositiveIntegerField(default=0)
    batches = models.PositiveIntegerField(default=0)
    simulation = models.BooleanField(default=True)
    authorization = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=12, default="paused")
    outcome = models.CharField(max_length=20, default="created")

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(status__in=["paused", "completed"]),
                name="journal_purge_status_valid",
            ),
        ]
