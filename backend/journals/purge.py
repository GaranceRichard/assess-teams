"""Each batch and its receipt commit together; killing a worker loses no cursor."""

from django.db import transaction
from django.db.models import F, Max
from django.utils import timezone

from journals.models import LogEntry
from journals.purge_models import JournalPurgeRun
from journals.purge_policy import (
    PurgeRefused,
    bounded_integer,
    check_integrity,
    expiry,
    retention_days,
    validate_authorization,
)


def start_run(*, simulation=True, authorization="", max_rows=1000, batch_size=100):
    days = retention_days()
    max_rows = bounded_integer(max_rows, 100000)
    batch_size = bounded_integer(batch_size, 1000)
    if not simulation:
        validate_authorization(authorization)
    check_integrity()
    reference = timezone.now()
    return JournalPurgeRun.objects.create(
        reference_at=reference,
        cutoff=expiry(reference, days),
        retention_days=days,
        upper_pk=LogEntry.objects.aggregate(value=Max("pk"))["value"] or 0,
        max_rows=max_rows,
        batch_size=batch_size,
        simulation=simulation,
        authorization=authorization if not simulation else "",
    )


def validate_run(run):
    if retention_days() != run.retention_days:
        raise PurgeRefused("policy_changed")
    if timezone.now() < run.reference_at:
        raise PurgeRefused("clock_reversed")
    bounded_integer(run.max_rows, 100000)
    bounded_integer(run.batch_size, 1000)
    if not run.simulation:
        validate_authorization(run.authorization)
    valid = (
        run.cutoff == expiry(run.reference_at, run.retention_days)
        and 0 <= run.cursor <= run.upper_pk
        and 0 <= run.matched_count <= run.max_rows
        and run.deleted_count == (0 if run.simulation else run.matched_count)
        and run.status in {"paused", "completed"}
    )
    if not valid:
        raise PurgeRefused("invalid_checkpoint")
    # A future relation must be reviewed explicitly, never silently cascaded.
    if any(
        field.is_relation and field.auto_created and not field.concrete
        for field in LogEntry._meta.get_fields(include_hidden=True)
    ):
        raise PurgeRefused("unsafe_relations")


@transaction.atomic
def advance_run(run_id):
    # Acquire SQLite's writer lock before reading the checkpoint. Concurrent resumes
    # serialize or fail closed with SQLITE_BUSY; no external effects are retried.
    if not JournalPurgeRun.objects.filter(pk=run_id).update(batches=F("batches")):
        raise PurgeRefused("unknown_run")
    run = JournalPurgeRun.objects.get(pk=run_id)
    validate_run(run)
    if run.status == "completed":
        return run
    remaining = run.max_rows - run.matched_count
    candidates = LogEntry.objects.filter(
        pk__gt=run.cursor, pk__lte=run.upper_pk, created_at__lt=run.cutoff
    ).order_by("pk")
    ids = list(candidates.values_list("pk", flat=True)[: min(run.batch_size, remaining)])
    if ids:
        if not run.simulation:
            count, details = candidates.filter(pk__in=ids).delete()
            if count != len(ids) or details != {LogEntry._meta.label: len(ids)}:
                raise PurgeRefused("deletion_mismatch")
            run.deleted_count += count
        run.cursor = ids[-1]
        run.matched_count += len(ids)
        run.batches += 1
    if run.matched_count == run.max_rows:
        run.status, run.outcome = "completed", "limit_reached"
    elif not ids:
        run.status, run.outcome = "completed", "window_exhausted"
    else:
        run.outcome = "batch_committed"
    if run.status == "completed":
        check_integrity()
    run.save()
    return run
