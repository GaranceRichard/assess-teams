from urllib.parse import quote

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from identities.models import User


def invitation_url(user: User) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/invitation/{quote(uid)}/{quote(token)}"


def send_invitation(user: User) -> None:
    send_mail(
        "Votre invitation Assess teams",
        f"Bonjour {user.username},\n\nChoisissez votre mot de passe : {invitation_url(user)}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )


def send_update_notice(user: User, previous_email: str) -> None:
    changed = previous_email.casefold() != user.email.casefold()
    pending_message = (
        f"\n\nChoisissez votre mot de passe : {invitation_url(user)}"
        if not user.has_usable_password()
        else ""
    )
    if changed:
        send_mail(
            "Modification de votre compte Assess teams",
            "L'adresse e-mail de votre compte Assess teams a été modifiée.",
            settings.DEFAULT_FROM_EMAIL,
            [previous_email],
        )
    send_mail(
        "Modification de votre compte Assess teams",
        f"Bonjour {user.username},\n\nLes informations de votre compte ont été modifiées."
        f"{pending_message}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )


def send_deletion_notice(identifier: str, email: str) -> None:
    send_mail(
        "Suppression de votre compte Assess teams",
        f"Bonjour {identifier},\n\nVotre compte Assess teams a été supprimé.",
        settings.DEFAULT_FROM_EMAIL,
        [email],
    )


def invitation_is_valid(user: User, token: str) -> bool:
    return not user.has_usable_password() and default_token_generator.check_token(user, token)
