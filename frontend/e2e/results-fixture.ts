import {
  assignOrganization,
  runDjangoShell,
  seedIdentity,
} from "./identity-fixture";

export function seedResultsContext() {
  seedIdentity("results-admin-e2e", "Admin");
  assignOrganization(["results-admin-e2e"], "Results E2E");
  runDjangoShell([
    "from datetime import datetime, timedelta, timezone as tz",
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation, EvaluationSchedule, Question",
    "from assessments.application.expected_evaluations import ensure_expected_evaluation",
    "from assessments.application.taking import start_evaluation, save_evaluation_score, complete_evaluation",
    "organization = Organization.objects.get(name='Results E2E')",
    "actor = User.objects.get(username='results-admin-e2e')",
    "evaluation = Evaluation.objects.create(organization=organization, name='Radar E2E', index=1, status='VALIDATED')",
    "[Question.objects.create(evaluation=evaluation, index=i, name=name) for i, name in [(3, 'Amélioration'), (1, 'Collaboration'), (2, 'Livraison')]]",
    "teams = [Team.objects.create(organization=organization, name=name) for name in ['Équipe A', 'Équipe B']]",
    "schedules = [EvaluationSchedule.objects.create(team=team, evaluation=evaluation, assignee=actor, mode='monthly', first_due_date='2026-08-01') for team in teams]",
    "runs = [ensure_expected_evaluation(schedule) for schedule in schedules]",
    "old = ensure_expected_evaluation(schedules[0], datetime(2026, 9, 1).date())",
    "[start_evaluation(run, actor) for run in runs + [old]]",
    "[save_evaluation_score(run, actor, q.source_question_id, score) for run, values in [(runs[0], [0, 10, 7]), (runs[1], [8, 3, 5]), (old, [2, 2, 2])] for q, score in zip(run.questions.all(), values)]",
    "[complete_evaluation(run, actor) for run in runs + [old]]",
    "runs[0].completed_at = datetime(2026, 10, 2, 12, tzinfo=tz.utc)",
    "runs[0].save(update_fields=['completed_at'])",
    "runs[1].completed_at = datetime(2026, 10, 3, 12, tzinfo=tz.utc)",
    "runs[1].save(update_fields=['completed_at'])",
    "old.completed_at = datetime(2026, 9, 1, 12, tzinfo=tz.utc)",
    "old.save(update_fields=['completed_at'])",
    "evaluation.status = 'ARCHIVED'",
    "evaluation.save()",
  ]);
}
