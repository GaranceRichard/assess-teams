import pytest
from django.core.exceptions import ImproperlyConfigured

from config.journal_retention import journal_retention_settings, validate_journal_retention

pytestmark = pytest.mark.functional


@pytest.mark.parametrize("environment", [{}, {"JOURNAL_ACTIVITY_RETENTION_DAYS": "keep"}])
def test_unarbitrated_retention_has_no_expiry(environment):
    assert journal_retention_settings(environment) == {"activity": None, "technical": None}


@pytest.mark.parametrize("days", ["1", "37", "999999999"])
def test_technical_duration_is_independent_from_business_evidence(days):
    assert journal_retention_settings({"JOURNAL_TECHNICAL_RETENTION_DAYS": days}) == {
        "activity": None,
        "technical": int(days),
    }


def test_explicit_keep_is_supported_for_both_types():
    assert journal_retention_settings(
        {"JOURNAL_ACTIVITY_RETENTION_DAYS": "keep", "JOURNAL_TECHNICAL_RETENTION_DAYS": "keep"}
    ) == {"activity": None, "technical": None}


@pytest.mark.parametrize("kind", ["ACTIVITY", "TECHNICAL"])
@pytest.mark.parametrize(
    "value",
    ["", "0", "-1", "1.5", "true", "null", "1e2", " 37", "37 ", "01", "３７", "1000000000"],
)
def test_invalid_durations_are_refused_without_echoing_input(kind, value):
    name = f"JOURNAL_{kind}_RETENTION_DAYS"
    with pytest.raises(ImproperlyConfigured, match=name) as error:
        journal_retention_settings({name: value})
    assert "utiliser keep" in str(error.value)


@pytest.mark.parametrize("days", ["1", "37", "999999999"])
def test_finite_business_duration_requires_an_authorized_policy(days):
    with pytest.raises(ImproperlyConfigured, match="aucune politique"):
        journal_retention_settings({"JOURNAL_ACTIVITY_RETENTION_DAYS": days})


@pytest.mark.parametrize("value", [True, False, 0, -1, 1.5, "37", "keep", [], {}, 1000000000])
def test_effective_settings_cannot_bypass_duration_validation(value):
    with pytest.raises(ImproperlyConfigured, match="JOURNAL_TECHNICAL_RETENTION_DAYS"):
        validate_journal_retention({"activity": None, "technical": value})


@pytest.mark.parametrize(
    "policy",
    [None, [], {}, {"technical": 37}, {"activity": None, "technical": 37, "allow_delete": True}],
)
def test_partial_or_extended_policies_cannot_weaken_the_scope(policy):
    with pytest.raises(ImproperlyConfigured, match="JOURNAL_RETENTION"):
        validate_journal_retention(policy)


def test_effective_business_expiry_cannot_bypass_evidence_protection():
    with pytest.raises(ImproperlyConfigured, match="preuves métier"):
        validate_journal_retention({"activity": 37, "technical": 1})
