import type { EvaluationRun } from "../evaluationRuns";
import { copy, state } from "./store";
import { user } from "./fixtures";
export { completionDate, runStateLabels } from "../evaluationRuns";
function runFor(id: number) {
  const run = state.runs.find((r) => r.id === id);
  if (!run) throw new Error("Passation inconnue.");
  return run;
}
export const listEvaluationRuns = async () =>
  copy(state.runs).sort((a, b) => {
    const group =
      Number(a.state === "completed") - Number(b.state === "completed");
    if (group) return group;
    if (a.state !== "completed") return a.id - b.id;
    if (a.completed_at === null)
      return b.completed_at === null ? a.id - b.id : 1;
    if (b.completed_at === null) return -1;
    return (
      Date.parse(b.completed_at) - Date.parse(a.completed_at) || a.id - b.id
    );
  });
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
