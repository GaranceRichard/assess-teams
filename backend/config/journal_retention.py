"""Installation settings only: no journal selection, mutation or purge."""

import re

from django.core.exceptions import ImproperlyConfigured

RETENTION_VARIABLES = {
    "activity": "JOURNAL_ACTIVITY_RETENTION_DAYS",
    "technical": "JOURNAL_TECHNICAL_RETENTION_DAYS",
}
MAX_RETENTION_DAYS = 999_999_999  # datetime.timedelta's representability limit, not a policy.


def invalid_duration(name):
    raise ImproperlyConfigured(
        f"{name}: utiliser keep (sans échéance) ou un entier de jours entre 1 et "
        f"{MAX_RETENTION_DAYS}, sans espaces."
    )


def journal_retention_settings(environment):
    """Normalize absent/keep to None; never invent a default retention period."""
    policy = {}
    for kind, name in RETENTION_VARIABLES.items():
        value = environment.get(name, "keep")
        if value == "keep":
            policy[kind] = None
        elif isinstance(value, str) and re.fullmatch(r"[1-9][0-9]{0,8}", value):
            policy[kind] = int(value)
        else:
            invalid_duration(name)
    validate_journal_retention(policy)
    return policy


def validate_journal_retention(policy):
    """Also check effective Django settings, including overrides, in every mode."""
    if not isinstance(policy, dict) or policy.keys() != RETENTION_VARIABLES.keys():
        raise ImproperlyConfigured(
            "JOURNAL_RETENTION: fournir exactement activity et technical, "
            "sans dérogation de périmètre ni autorisation de suppression."
        )
    for kind, value in policy.items():
        if value is not None and (type(value) is not int or not 1 <= value <= MAX_RETENTION_DAYS):
            invalid_duration(RETENTION_VARIABLES[kind])
    if policy["activity"] is not None:
        raise ImproperlyConfigured(
            "JOURNAL_ACTIVITY_RETENTION_DAYS: conserver keep ; aucune politique "
            "autorisant la suppression des preuves métier n'est définie dans le référentiel."
        )
