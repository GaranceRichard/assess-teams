from urllib.parse import quote

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from identities.models import User
from notifications.queue import enqueue_email


def invitation_url(user: User) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return f"{settings.FRONTEND_URL}/invitation/{quote(uid)}/{quote(token)}"


def send_invitation(user: User) -> None:
    enqueue_email(
        invitation=True,
        subject="Votre invitation Assess teams",
        body=f"Bonjour {user.username},\n\nChoisissez votre mot de passe : {{invitation_url}}",
        recipient=user.email,
        user=user,
        organization=user.organizations.first(),
    )


def send_update_notice(user: User, previous_email: str) -> None:
    changed = previous_email.casefold() != user.email.casefold()
    pending_message = (
        "\n\nChoisissez votre mot de passe : {invitation_url}"
        if user.is_active and not user.has_usable_password()
        else ""
    )
    if changed:
        enqueue_email(
            subject="Modification de votre compte Assess teams",
            body="L'adresse e-mail de votre compte Assess teams a été modifiée.",
            recipient=previous_email,
            user=user,
            organization=user.organizations.first(),
        )
    enqueue_email(
        invitation=bool(pending_message),
        subject="Modification de votre compte Assess teams",
        body=f"Bonjour {user.username},\n\nLes informations de votre compte ont été modifiées."
        f"{pending_message}",
        recipient=user.email,
        user=user,
        organization=user.organizations.first(),
    )


def send_activation_notice(user: User) -> None:
    if not user.email:
        return
    activation = "actif" if user.is_active else "désactivé"
    enqueue_email(
        subject="Activation de votre compte Assess teams",
        body=f"Bonjour {user.username},\n\nVotre compte est {activation}.",
        recipient=user.email,
        user=user,
        organization=user.organizations.first(),
    )


def invitation_is_valid(user: User, token: str) -> bool:
    return (
        user.is_active
        and not user.has_usable_password()
        and default_token_generator.check_token(user, token)
    )
