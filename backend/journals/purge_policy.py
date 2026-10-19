"""Closed operational scope: no dates, durations or queryset supplied by callers."""

import re
from datetime import UTC, datetime, timedelta

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import connection

from config.journal_retention import validate_journal_retention


class PurgeRefused(Exception):
    """Only static codes may cross the command boundary."""


def retention_days():
    try:
        validate_journal_retention(settings.JOURNAL_RETENTION)
    except ImproperlyConfigured:
        raise PurgeRefused("invalid_policy") from None
    days = settings.JOURNAL_RETENTION["technical"]
    if days is None:
        raise PurgeRefused("retention_keep")
    return days


def expiry(reference, days):
    try:
        return reference - timedelta(days=days)
    except OverflowError:
        return datetime.min.replace(tzinfo=UTC)


def bounded_integer(value, maximum):
    if not re.fullmatch(r"[1-9][0-9]{0,5}", str(value)):
        raise PurgeRefused("invalid_bound")
    number = int(value)
    if number > maximum:
        raise PurgeRefused("invalid_bound")
    return number


def validate_authorization(authorization):
    if not isinstance(authorization, str) or not re.fullmatch(
        r"[A-Z]{2,16}-[1-9][0-9]{0,11}", authorization
    ):
        raise PurgeRefused("authorization_required")


def check_integrity():
    if connection.vendor != "sqlite":
        raise PurgeRefused("unsupported_database")
    with connection.cursor() as cursor:
        cursor.execute("PRAGMA quick_check(1)")
        if cursor.fetchone() != ("ok",):
            raise PurgeRefused("integrity_failed")
        cursor.execute("PRAGMA foreign_key_check")
        if cursor.fetchone() is not None:
            raise PurgeRefused("integrity_failed")
