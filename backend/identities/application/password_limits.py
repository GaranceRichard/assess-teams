from datetime import timedelta

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.utils.crypto import salted_hmac

from identities.password_models import PasswordRateLimit


@transaction.atomic
def allow_password_attempt(scope: str, value: str, limit: int, seconds: int) -> bool:
    key = salted_hmac(
        "identities.password-limits", f"{scope}:{value}", algorithm="sha256"
    ).hexdigest()
    now = timezone.now()
    # Acquire SQLite's writer lock even when this bucket does not yet exist.
    PasswordRateLimit.objects.filter(key=key).update(count=F("count"))
    PasswordRateLimit.objects.filter(expires_at__lte=now).delete()
    bucket, _ = PasswordRateLimit.objects.select_for_update().get_or_create(
        key=key, defaults={"expires_at": now + timedelta(seconds=seconds)}
    )
    if bucket.count >= limit:
        return False
    bucket.count += 1
    bucket.save(update_fields=["count"])
    return True
