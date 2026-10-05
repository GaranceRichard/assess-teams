import { test } from "@playwright/test";

import {
  assignOrganization,
  resetOrganization,
  runDjangoShell,
  seedIdentity,
  seedPlanningContext,
} from "./identity-fixture";

function seedProtectedRun(organizationName: string, username: string) {
  seedIdentity(username, "Coach");
  assignOrganization([username], organizationName);
  seedPlanningContext(
    organizationName,
    "Fixture team",
    "Fixture model",
    username,
  );
  runDjangoShell([
    "from django.utils import timezone",
    "from identities.models import Organization, User",
    "from assessments.models import EvaluationSchedule",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    `organization = Organization.objects.get(name=${JSON.stringify(organizationName)})`,
    `coach = User.objects.get(username=${JSON.stringify(username)})`,
    "schedule = EvaluationSchedule.objects.create(team=organization.teams.get(), evaluation=organization.evaluations.get(), assignee=coach, mode='immediate', first_due_date=timezone.localdate())",
    "ensure_expected_evaluation(schedule)",
  ]);
}

test("organization fixture reset is repeatable with protected runs and isolated to its target", () => {
  const target = "Fixture reset E2E";
  const preserved = "Fixture preserved E2E";
  seedProtectedRun(target, "fixture-reset-coach-e2e");
  seedProtectedRun(preserved, "fixture-preserved-coach-e2e");
  assignOrganization(["fixture-reset-coach-e2e"], target);
  runDjangoShell([
    "from identities.models import Organization",
    "from assessments.models import EvaluationRun",
    `assert Organization.objects.filter(name=${JSON.stringify(target)}).count() == 1`,
    `assert not EvaluationRun.objects.filter(organization__name=${JSON.stringify(target)}).exists()`,
    `assert EvaluationRun.objects.filter(organization__name=${JSON.stringify(preserved)}).count() == 1`,
  ]);
  resetOrganization(target);
  resetOrganization(preserved);
});
