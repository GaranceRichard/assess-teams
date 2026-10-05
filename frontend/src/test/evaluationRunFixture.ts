import type { EvaluationRun } from "../evaluationRuns";

export const evaluationRunFixture: EvaluationRun = {
  id: 1,
  schedule_id: 8,
  organization_id: 7,
  organization_name: "North",
  team_name: "Équipe A",
  family_id: 1,
  family_name: "Coopération",
  evaluation_version: 1,
  evaluation_name: "Coopération",
  assigned_to: "coach",
  filled_by: "",
  completed_at: null,
  revised_by: "",
  revised_at: null,
  due_date: "2026-10-05",
  state: "in_progress",
  is_assignee: true,
  can_revise: false,
  questions: [
    { question_id: 11, index: 1, text: "Première question", score: null },
    { question_id: 12, index: 2, text: "Deuxième question", score: null },
  ],
};

export const completedRunFixture: EvaluationRun = {
  ...evaluationRunFixture,
  state: "completed",
  filled_by: "admin",
  completed_at: "2026-10-05T12:00:00Z",
  can_revise: true,
  questions: evaluationRunFixture.questions.map((question) => ({
    ...question,
    score: 5,
  })),
};
