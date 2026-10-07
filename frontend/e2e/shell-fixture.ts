import {
  assignOrganization,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

export function seedShellContext() {
  seedIdentity("shell-admin-e2e", "Admin");
  seedIdentity("shell-coach-e2e", "Coach");
  assignOrganization(
    ["shell-admin-e2e", "shell-coach-e2e"],
    "Shell viewport E2E",
  );
  runDjangoShell([
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation, EvaluationSchedule, Question",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "from assessments.application.taking import start_evaluation, save_evaluation_score, complete_evaluation",
    "from django.utils import timezone",
    "from journals.models import ActivityAction",
    "from journals.services import record_activity",
    "org = Organization.objects.get(name='Shell viewport E2E')",
    "admin = User.objects.get(username='shell-admin-e2e')",
    "coach = User.objects.get(username='shell-coach-e2e')",
    "members = [User.objects.get_or_create(username=f'shell-member-{i:02}', defaults={'role': 'Viewer', 'email': f'shell-member-{i}@example.com'})[0] for i in range(30)]",
    "org.users.add(*members)",
    "teams = [Team.objects.create(organization=org, name=f'Viewport team {i:02}') for i in range(25)]",
    "[team.coaches.add(coach) for team in teams]",
    "models = [Evaluation.objects.create(organization=org, name=f'Viewport model {i:02}', index=i+1, status='VALIDATED') for i in range(25)]",
    "[Question.objects.create(evaluation=model, index=1, name='Coopération accessible') for model in models]",
    "schedules = [EvaluationSchedule.objects.create(team=team, evaluation=model, assignee=coach, mode='immediate', first_due_date=timezone.localdate()) for team, model in zip(teams, models)]",
    "runs = [ensure_expected_evaluation(schedule) for schedule in schedules]",
    "run = start_evaluation(runs[0], admin)",
    "[save_evaluation_score(run, admin, question.source_question_id, 7) for question in run.questions.all()]",
    "complete_evaluation(run, admin)",
    "[record_activity(actor=admin, organization=org, action=ActivityAction.TEAM_CREATED, description=f'Création visible {i}') for i in range(25)]",
  ]);
}
