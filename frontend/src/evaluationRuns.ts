import { pageQuery, type CollectionPage } from "./collectionPage";
import { csrfToken } from "./auth";

export type RunState = "not_started" | "in_progress" | "completed";
export type EvaluationRunRow = {
  id: number;
  schedule_id: number;
  organization_id: number;
  organization_name: string;
  team_name: string;
  evaluation_name: string;
  family_id: number;
  family_name: string;
  evaluation_version: number;
  assigned_to: string;
  assignee_active?: boolean | null;
  requires_reassignment?: boolean;
  filled_by: string;
  completed_at: string | null;
  revised_by: string;
  revised_at: string | null;
  due_date: string;
  state: RunState;
  is_assignee: boolean;
  can_revise: boolean;
};
export type RunQuestion = {
  question_id: number;
  index: number;
  text: string;
  score: number | null;
};
export type EvaluationRun = EvaluationRunRow & { questions: RunQuestion[] };

async function request<T>(
  path = "",
  method = "GET",
  input?: object,
): Promise<T> {
  const response = await fetch(`/api/evaluations/${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(method === "GET" ? {} : { "X-CSRFToken": csrfToken() }),
    },
    body: input ? JSON.stringify(input) : undefined,
  });
  if (!response.ok) throw new Error("Evaluation run request failed");
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export function listEvaluationRuns(): Promise<EvaluationRunRow[]>;
export function listEvaluationRuns(
  page: number,
): Promise<CollectionPage<EvaluationRunRow>>;
export function listEvaluationRuns(page?: number) {
  return request<EvaluationRunRow[] | CollectionPage<EvaluationRunRow>>(
    page === undefined ? "" : pageQuery(page),
  );
}
export const getEvaluationRun = (id: number) =>
  request<EvaluationRun>(`${id}/`);
export const startEvaluationRun = (id: number) =>
  request<EvaluationRun>(`${id}/`, "POST");
export const saveEvaluationScore = (
  id: number,
  questionId: number,
  score: number,
) => request<void>(`${id}/responses/${questionId}/`, "PUT", { score });
export const finalizeEvaluationRun = (id: number) =>
  request<EvaluationRun>(`${id}/finalize/`, "POST");
export const reviseEvaluationRun = (id: number, questions: RunQuestion[]) =>
  request<EvaluationRun>(`${id}/revision/`, "PUT", {
    answers: questions.map(({ question_id, score }) => ({
      question_id,
      score,
    })),
  });

export function completionDate(date: string | null): string {
  return date ? new Date(date).toLocaleString("fr-CA") : "—";
}

export const runStateLabels: Record<RunState, string> = {
  not_started: "À passer",
  in_progress: "En cours",
  completed: "Complétée",
};
