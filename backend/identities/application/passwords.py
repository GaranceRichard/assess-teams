from urllib.parse import urlsplit

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import transaction
from django.db.models import F
from django.utils.encoding import force_bytes, force_str
from django.utils.http import base36_to_int, urlsafe_base64_decode, urlsafe_base64_encode

from identities.models import User

INVALID_LINK = "Ce lien est invalide ou expiré. Demandez un nouveau lien."


class RecoveryTokenGenerator(PasswordResetTokenGenerator):
    key_salt = "identities.password-recovery"

    def check_token(self, user, token):
        if not super().check_token(user, token):
            return False
        timestamp = base36_to_int(token.split("-")[0])
        age = self._num_seconds(self._now()) - timestamp
        return age <= settings.PASSWORD_RECOVERY_TIMEOUT


recovery_tokens = RecoveryTokenGenerator()


def public_password_url(user: User) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    parts = urlsplit(base)
    if (
        parts.scheme not in {"http", "https"}
        or not parts.netloc
        or parts.username
        or parts.password
        or parts.query
        or parts.fragment
        or (settings.ENVIRONMENT == "production" and parts.scheme != "https")
    ):
        raise ImproperlyConfigured("L'URL publique du produit est invalide.")
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return f"{base}/password/reset#{uid}/{recovery_tokens.make_token(user)}"


def locked_password_user(user_id):
    # SQLite ignores select_for_update: take its writer lock before reading the password.
    User.objects.filter(pk=user_id).update(last_login=F("last_login"))
    return User.objects.select_for_update().filter(pk=user_id).first()


def validate_new_password(user: User, password: str, confirmation: str) -> None:
    if password != confirmation:
        raise ValidationError({"password_confirmation": "Les mots de passe ne correspondent pas."})
    if user.has_usable_password() and user.check_password(password):
        raise ValidationError({"password": "Choisissez un mot de passe différent de l'actuel."})
    try:
        validate_password(password, user)
    except ValidationError as exc:
        raise ValidationError({"password": exc.messages}) from None


@transaction.atomic
def reset_password(uid: str, token: str, password: str, confirmation: str) -> None:
    try:
        user_id = int(force_str(urlsafe_base64_decode(uid)))
    except (ValueError, TypeError, OverflowError, UnicodeError):
        raise ValidationError({"detail": INVALID_LINK}) from None
    user = locked_password_user(user_id) if 0 < user_id < 2**63 else None
    if (
        not user
        or not user.is_active
        or not user.has_usable_password()
        or not recovery_tokens.check_token(user, token)
    ):
        raise ValidationError({"detail": INVALID_LINK})
    validate_new_password(user, password, confirmation)
    user.set_password(password)
    user.save(update_fields=["password"])


@transaction.atomic
def change_password(user_id: int, current: str, password: str, confirmation: str) -> User:
    user = locked_password_user(user_id)
    if not user or not user.is_active or not user.check_password(current):
        raise ValidationError({"current_password": "Le mot de passe actuel est incorrect."})
    validate_new_password(user, password, confirmation)
    user.set_password(password)
    user.save(update_fields=["password"])
    return user
