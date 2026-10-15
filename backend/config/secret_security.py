"""Structural guards; secrets must still be generated randomly by the operator."""

from django.core.exceptions import ImproperlyConfigured


def require_secret(value, name, minimum=50):
    forbidden = (
        "django-insecure",
        "development",
        "assessteams-local",
        "changeme",
        "change-me",
        "placeholder",
        "example",
        "test-key",
        "password",
        "replace-me",
    )
    if (
        not isinstance(value, str)
        or len(value) < minimum
        or len(set(value)) < 8
        or any(character.isspace() for character in value)
        or any(marker in value.lower() for marker in forbidden)
        or max(value.count(character) for character in set(value)) > len(value) / 2
        or (value + value).find(value, 1) < len(value)
    ):
        raise ImproperlyConfigured(
            f"{name}: secret externe requis, aléatoire, au moins {minimum} caractères, "
            "8 caractères distincts, sans espaces, répétition ni valeur de développement."
        )
    return value
