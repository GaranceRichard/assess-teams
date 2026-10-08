import type { EvaluationRun } from "../evaluationRuns";
import { copy, state } from "./store";
import { user } from "./fixtures";
export { completionDate, runStateLabels } from "../evaluationRuns";
function runFor(id: number) {
  const run = state.runs.find((r) => r.id === id);
  if (!run) throw new Error("Passation inconnue.");
  return run;
}
export const listEvaluationRuns = async () => copy(state.runs);
export const getEvaluationRun = async (id: number) => copy(runFor(id));
export const startEvaluationRun = async (id: number) => {
  const run = runFor(id);
  if (run.state === "completed") throw new Error("Passation déjà complétée.");
  run.state = "in_progress";
  return copy(run);
};
export const saveEvaluationScore = async (
  id: number,
  questionId: number,
  score: number,
) => {
  const run = runFor(id);
  const question = run.questions.find((q) => q.question_id === questionId);
  if (
    run.state !== "in_progress" ||
    !question ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 10
  )
    throw new Error("Réponse invalide.");
  question.score = score;
};
export const finalizeEvaluationRun = async (
  id: number,
): Promise<EvaluationRun> => {
  const run = runFor(id);
  if (
    run.state !== "in_progress" ||
    run.questions.some((q) => q.score === null)
  )
    throw new Error("Toutes les questions doivent être renseignées.");
  run.state = "completed";
  run.completed_at = new Date().toISOString();
  run.filled_by = user.username;
  return copy(run);
};
export const reviseEvaluationRun = async () => {
  throw new Error("Révision non simulée dans cette démo.");
};
