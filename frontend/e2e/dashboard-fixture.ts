import {
  assignOrganization,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

export function seedDashboardContext() {
  for (const role of ["Admin", "Coach", "Viewer"] as const)
    seedIdentity(`dashboard-${role.toLowerCase()}-e2e`, role);
  assignOrganization(
    ["dashboard-admin-e2e", "dashboard-coach-e2e", "dashboard-viewer-e2e"],
    "Dashboard E2E",
  );
  runDjangoShell([
    "from django.utils import timezone",
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation, EvaluationSchedule, Question",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "from assessments.application.taking import start_evaluation, save_evaluation_score, complete_evaluation, revise_evaluation",
    "org = Organization.objects.get(name='Dashboard E2E')",
    "org.users.update(interface_palette='green')",
    "coach = User.objects.get(username='dashboard-coach-e2e')",
    "admin = User.objects.get(username='dashboard-admin-e2e')",
    "admin.first_name = 'Léa'",
    "admin.last_name = 'Martin'",
    "admin.save()",
    "team = Team.objects.create(organization=org, name='Équipe Dashboard')",
    "team.coaches.add(coach)",
    "model = Evaluation.objects.create(organization=org, name='Modèle Dashboard', index=1, status='VALIDATED')",
    "question = Question.objects.create(evaluation=model, name='Critère', index=1)",
    "schedule = EvaluationSchedule.objects.create(team=team, evaluation=model, assignee=coach, mode='monthly', first_due_date=timezone.localdate())",
    "run = ensure_expected_evaluation(schedule)",
    "start_evaluation(run, coach)",
    "save_evaluation_score(run, coach, question.pk, 5)",
    "complete_evaluation(run, coach)",
    "revise_evaluation(run, admin, [{'question_id': question.pk, 'score': 7}])",
    "from datetime import timedelta",
    "ensure_expected_evaluation(schedule, timezone.localdate() + timedelta(days=30))",
  ]);
}
