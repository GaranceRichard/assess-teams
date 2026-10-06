import {
  assignOrganization,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";
import { seedResultsContext } from "./results-fixture";

export function seedSteeringContext() {
  seedResultsContext();
  seedIdentity("steering-coach-e2e", "Coach");
  assignOrganization([], "Steering Other E2E");
  runDjangoShell([
    "from datetime import timedelta",
    "from django.utils import timezone",
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import EvaluationSchedule",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "org = Organization.objects.get(name='Results E2E')",
    "coach = User.objects.get(username='steering-coach-e2e')",
    "org.users.add(coach)",
    "team = Team.objects.get(organization=org, name='Équipe A')",
    "team.coaches.add(coach)",
    "schedule = EvaluationSchedule.objects.get(team=team)",
    "ensure_expected_evaluation(schedule, timezone.localdate() - timedelta(days=1))",
    "never = Team.objects.create(organization=org, name='Jamais évaluée E2E')",
    "Team.objects.create(organization=org, name='Archivée E2E', is_active=False)",
    "Team.objects.create(organization=Organization.objects.get(name='Steering Other E2E'), name='Autre équipe E2E')",
  ]);
}
