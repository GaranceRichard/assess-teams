import {
  assignOrganization,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

export function seedTakingContext() {
  seedIdentity("taking-coach-e2e", "Coach");
  seedIdentity("taking-admin-e2e", "Admin");
  runDjangoShell([
    "from assessments.models import EvaluationRun",
    "EvaluationRun.objects.filter(organization_name='Taking E2E').delete()",
  ]);
  assignOrganization(["taking-coach-e2e", "taking-admin-e2e"], "Taking E2E");
  runDjangoShell([
    "from django.utils import timezone",
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation, EvaluationSchedule, Question",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "organization = Organization.objects.get(name='Taking E2E')",
    "coach = User.objects.get(username='taking-coach-e2e')",
    "team = Team.objects.create(organization=organization, name='Équipe passation E2E')",
    "team.coaches.add(coach)",
    "evaluation = Evaluation.objects.create(organization=organization, name='Passation E2E', index=1, status='VALIDATED')",
    "Question.objects.create(evaluation=evaluation, name='Deuxième critère E2E', index=2)",
    "Question.objects.create(evaluation=evaluation, name='Premier critère E2E', index=1)",
    "schedule = EvaluationSchedule.objects.create(team=team, evaluation=evaluation, assignee=coach, mode='immediate', first_due_date=timezone.localdate())",
    "ensure_expected_evaluation(schedule)",
    "proxy = Evaluation.objects.create(organization=organization, name='Complétion Admin E2E', index=2, status='VALIDATED')",
    "Question.objects.create(evaluation=proxy, name='Critère Admin E2E', index=1)",
    "proxy_schedule = EvaluationSchedule.objects.create(team=team, evaluation=proxy, assignee=coach, mode='immediate', first_due_date=timezone.localdate())",
    "ensure_expected_evaluation(proxy_schedule)",
  ]);
}
