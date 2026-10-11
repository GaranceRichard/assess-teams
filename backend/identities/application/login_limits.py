import math
import unicodedata
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.utils.crypto import salted_hmac

from identities.password_models import PasswordRateLimit


@transaction.atomic
def authenticate_limited(request, username: str, password: str, origin: str):
    """Serialize verification and failure accounting across workers, including SQLite."""
    values = {
        "account": unicodedata.normalize("NFKC", username).casefold(),
        "origin": origin,
    }
    # Include the scope in the digest to keep account and origin buckets independent.
    keys = {
        scope: salted_hmac(
            "identities.login-limits", f"{scope}:{value}", algorithm="sha256"
        ).hexdigest()
        for scope, value in values.items()
    }
    PasswordRateLimit.objects.filter(key__in=keys.values()).update(count=F("count"))
    now = timezone.now()
    PasswordRateLimit.objects.filter(expires_at__lte=now).delete()
    existing = {
        bucket.key: bucket
        for bucket in PasswordRateLimit.objects.select_for_update()
        .filter(key__in=keys.values())
        .order_by("key")
    }
    limits = {"account": settings.LOGIN_ACCOUNT_LIMIT, "origin": settings.LOGIN_ORIGIN_LIMIT}
    wait = restriction_wait(
        {scope: existing[key] for scope, key in keys.items() if key in existing}, limits, now
    )
    if wait:
        return None, wait
    buckets = {}
    for scope in sorted(keys):
        buckets[scope], _ = PasswordRateLimit.objects.select_for_update().get_or_create(
            key=keys[scope],
            defaults={"expires_at": now + timedelta(seconds=settings.LOGIN_LIMIT_SECONDS)},
        )
    wait = restriction_wait(buckets, limits, now)
    if wait:
        return None, wait
    user = authenticate(request, username=username, password=password)
    if user is not None:
        buckets["account"].delete()
        if not buckets["origin"].count:
            buckets["origin"].delete()
        return user, 0
    for bucket in buckets.values():
        bucket.count += 1
        bucket.save(update_fields=["count"])
    return None, restriction_wait(buckets, limits, timezone.now())


def restriction_wait(buckets, limits, now):
    return max(
        (
            max(1, math.ceil((bucket.expires_at - now).total_seconds()))
            for scope, bucket in buckets.items()
            if bucket.count >= limits[scope]
        ),
        default=0,
    )
