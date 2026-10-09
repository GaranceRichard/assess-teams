from datetime import date, datetime
from zoneinfo import ZoneInfo

import pytest
from django.template import Context, Template
from django.urls import reverse
from django.utils import formats, timezone

from identities.domain.users import Role
from tests.identity_helpers import create_superuser, create_user


def test_shared_french_display_formats_keep_dates_and_times_numeric():
    value = datetime(2026, 10, 9, 9, 5, 47, 123456)
    assert formats.date_format(value) == "09/10/2026"
    assert formats.time_format(value) == "09:05"
    assert formats.date_format(value, "DATETIME_FORMAT") == "09/10/2026 - 09:05"
    assert formats.localize(value) == "09/10/2026 - 09:05"
    assert formats.localize(date(2026, 10, 9)) == "09/10/2026"
    assert value.second == 47 and value.microsecond == 123456


@pytest.mark.parametrize("hour,expected", [(0, "00:00"), (9, "09:00"), (12, "12:00")])
def test_hours_are_padded_and_use_twenty_four_hours(hour, expected):
    assert formats.time_format(datetime(2026, 10, 9, hour, 0, 59)) == expected


@pytest.mark.parametrize(
    "zone,expected",
    [("America/Toronto", "08/10/2026 - 21:05"), ("Asia/Tokyo", "09/10/2026 - 10:05")],
)
def test_template_presentation_preserves_display_zone_and_day_boundary(zone, expected):
    instant = datetime(2026, 10, 9, 1, 5, 47, 123456, tzinfo=ZoneInfo("UTC"))
    with timezone.override(zone):
        assert Template("{{ value }}").render(Context({"value": instant})) == expected
    assert instant.isoformat() == "2026-10-09T01:05:47.123456+00:00"


@pytest.mark.django_db
@pytest.mark.functional
def test_read_only_django_admin_formats_identity_timestamps(client):
    actor = create_superuser()
    actor.date_joined = datetime(2026, 10, 9, 1, 5, 47, 123456, tzinfo=ZoneInfo("UTC"))
    actor.save(update_fields=["date_joined"])
    client.force_login(actor)
    response = client.get(reverse("admin:identities_user_change", args=[actor.pk]))
    assert response.status_code == 200
    assert "08/10/2026 - 21:05" in response.content.decode()
    assert "21:05:47" not in response.content.decode()
    actor.refresh_from_db()
    assert actor.date_joined.microsecond == 123456


@pytest.mark.django_db
@pytest.mark.functional
def test_identity_admin_remains_inaccessible_to_non_staff(client):
    actor = create_user("viewer-date", Role.VIEWER)
    client.force_login(actor)
    response = client.get(reverse("admin:identities_user_change", args=[actor.pk]))
    assert response.status_code == 302
    assert "/admin/login/" in response.url
