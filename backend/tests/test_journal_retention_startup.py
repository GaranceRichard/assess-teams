import pytest
from django.apps import apps
from django.core.exceptions import ImproperlyConfigured

from config.journal_retention import journal_retention_settings
from journals.models import ActivityAction, ActivityEntry, LogEntry, LogLevel, LogSource
from tests.startup_helpers import production_environment, startup

pytestmark = [pytest.mark.functional, pytest.mark.integration]


@pytest.mark.parametrize("mode", ["development", "production"])
def test_real_startup_loads_the_normalized_contract(mode):
    result = startup(
        production_environment(
            DJANGO_SETTINGS_MODULE=f"config.settings_{mode}",
            JOURNAL_TECHNICAL_RETENTION_DAYS="37",
            JOURNAL_ACTIVITY_RETENTION_DAYS="keep",
        ),
        "import django; django.setup(); from django.conf import settings; "
        "assert settings.JOURNAL_RETENTION == {'activity': None, 'technical': 37}",
    )
    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize("mode", ["development", "production"])
@pytest.mark.parametrize(
    "configuration,diagnostic",
    [
        ({"JOURNAL_TECHNICAL_RETENTION_DAYS": "0"}, "utiliser keep"),
        ({"JOURNAL_TECHNICAL_RETENTION_DAYS": "private-invalid-input"}, "utiliser keep"),
        ({"JOURNAL_ACTIVITY_RETENTION_DAYS": "37"}, "preuves métier"),
    ],
)
def test_real_startup_refuses_invalid_or_unauthorized_policy(mode, configuration, diagnostic):
    result = startup(
        production_environment(DJANGO_SETTINGS_MODULE=f"config.settings_{mode}", **configuration)
    )
    assert result.returncode != 0
    assert diagnostic in result.stderr
    assert "private-invalid-input" not in result.stderr + result.stdout


@pytest.mark.parametrize("mode", ["development", "production"])
@pytest.mark.parametrize("activity,technical", [(37, None), (None, True)])
def test_effective_overrides_are_refused_before_serving(mode, activity, technical):
    result = startup(
        production_environment(DJANGO_SETTINGS_MODULE=f"config.settings_{mode}"),
        "from django.conf import settings; "
        f"settings.JOURNAL_RETENTION = {{'activity': {activity!r}, 'technical': {technical!r}}}; "
        "import django; django.setup()",
    )
    assert result.returncode != 0
    assert "RETENTION_DAYS" in result.stderr


@pytest.mark.django_db
def test_configuration_and_refusals_preserve_existing_entries(settings, django_assert_num_queries):
    activity = ActivityEntry.objects.create(
        action=ActivityAction.EVALUATION_COMPLETED,
        description="Preuve synthétique",
        organization_name="Organisation supprimée",
    )
    technical = LogEntry.objects.create(
        level=LogLevel.ERROR, source=LogSource.SYSTEM, message="Trace synthétique"
    )
    # Even old entries without a surviving organization remain intact.
    ActivityEntry.objects.filter(pk=activity.pk).update(created_at="2000-01-01T00:00:00Z")
    LogEntry.objects.filter(pk=technical.pk).update(created_at="2000-01-01T00:00:00Z")
    before = (list(ActivityEntry.objects.values()), list(LogEntry.objects.values()))
    with django_assert_num_queries(0):
        settings.JOURNAL_RETENTION = journal_retention_settings(
            {"JOURNAL_TECHNICAL_RETENTION_DAYS": "1"}
        )
        apps.get_app_config("config").ready()
        for policy in ({"activity": 1, "technical": 1}, {"activity": None, "technical": 0}):
            settings.JOURNAL_RETENTION = policy
            with pytest.raises(ImproperlyConfigured):
                apps.get_app_config("config").ready()
    assert (list(ActivityEntry.objects.values()), list(LogEntry.objects.values())) == before
