from django.urls import get_resolver, reverse

from tests.identity_helpers import valid_payload
from tests.isolation_helpers import planning
from tests.taking_helpers import revision_answers

ALL = {"root", "admin", "coach", "viewer"}
ADMINS = {"root", "admin"}
MANAGERS = {"root", "admin", "coach"}

# Role-level access only; object, organization and lifecycle conditions remain mandatory.
ACTIONS = [
    ("session-current", "get patch", ALL),
    ("session-logout", "post", ALL),
    ("session-password", "post", ALL),
    ("dashboard", "get", ALL),
    ("user-create", "post", {"root"}),
    ("managed-user-list", "get", MANAGERS),
    ("managed-user-list", "post", ADMINS),
    ("managed-user-detail", "put delete", MANAGERS),
    ("user-deactivate", "post", MANAGERS),
    ("user-reactivate", "post", MANAGERS),
    ("organization-list", "get", ADMINS),
    ("organization-list", "post", {"root"}),
    ("organization-detail", "get put", ADMINS),
    ("organization-detail", "delete", {"root"}),
    ("organization-members", "put", ADMINS),
    ("team-list", "get post", ADMINS),
    ("team-detail", "put delete", ADMINS),
    ("evaluation-list", "get post", ADMINS),
    ("evaluation-detail", "put delete", ADMINS),
    ("evaluation-new-version", "post", ADMINS),
    ("evaluation-validate", "post", ADMINS),
    ("evaluation-archive", "post", ADMINS),
    ("question-list", "get post", ADMINS),
    ("question-detail", "put delete", ADMINS),
    ("evaluation-schedule-list", "get post", ADMINS),
    ("evaluation-schedule-detail", "put delete", ADMINS),
    ("evaluation-run-list", "get", MANAGERS),
    ("evaluation-run-detail", "get post", MANAGERS),
    ("evaluation-run-score", "put", MANAGERS),
    ("evaluation-run-finalize", "post", MANAGERS),
    ("evaluation-run-revision", "put", ADMINS),
    ("result-organizations", "get", ALL),
    ("result-versions", "get", ALL),
    ("result-comparison", "get", ALL),
    ("result-families", "get", ALL),
    ("result-family-comparison", "get", ALL),
    ("result-criterion-history", "get", ALL),
    ("steering-organizations", "get", ADMINS),
    ("steering", "get", ADMINS),
    ("activity-journal", "get", ADMINS),
    ("logs", "get", ADMINS),
]


def action_request(side, name):
    kwargs = {
        "user_id": side.viewer.pk,
        "organization_id": side.organization.pk,
        "team_id": side.team.pk,
        "evaluation_id": side.draft.pk,
        "question_id": side.question.pk,
        "schedule_id": side.schedule.pk,
        "run_id": side.waiting.pk,
    }
    if name.startswith("evaluation-run-") and name not in {"evaluation-run-list"}:
        if name in {"evaluation-run-revision", "evaluation-run-score", "evaluation-run-finalize"}:
            kwargs["run_id"] = side.run.pk
            kwargs["question_id"] = side.run.questions.first().source_question_id
    # Reverse validates that every declared route is real, with real resource identifiers.
    parameters = get_resolver().reverse_dict[name][0][0][1]
    url = reverse(name, kwargs={key: kwargs[key] for key in parameters})
    payloads = {
        "user-create": valid_payload(),
        "managed-user-list": {
            "identifier": "invited",
            "email": "invited@example.com",
            "role": "Viewer",
        },
        "managed-user-detail": {
            "identifier": "changed",
            "email": "changed@example.com",
            "role": "Viewer",
            "is_active": False,
        },
        "organization-list": {"name": "New", "user_ids": [side.admin.pk]},
        "organization-detail": {"name": "Changed"},
        "organization-members": {"user_ids": [side.admin.pk]},
        "team-list": {"name": "New team", "coach_ids": [side.coach.pk]},
        "team-detail": {"name": "Changed", "coach_ids": []},
        "evaluation-list": {"name": "New", "organization_id": side.organization.pk},
        "evaluation-detail": {"name": "Changed"},
        "question-list": {"name": "New question"},
        "question-detail": {"name": "Changed"},
        "evaluation-schedule-list": planning(side),
        "evaluation-schedule-detail": planning(side),
        "evaluation-run-score": {"score": 5},
        "evaluation-run-revision": revision_answers(side.run),
    }
    return url, payloads.get(name, {})
