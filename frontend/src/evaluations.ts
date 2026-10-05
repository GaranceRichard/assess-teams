import { csrfToken } from "./auth";

export type NamedEntity = { id: number; name: string };
export type EvaluationStatus = "DRAFT" | "VALIDATED" | "ARCHIVED";
export type Evaluation = NamedEntity & {
  organization_id: number;
  status: EvaluationStatus;
};
export type Question = NamedEntity & { index: number };
export type NameInput = { name: string };
export type EvaluationInput = NameInput & { organization_id: number };

export function orderQuestions(items: Question[]): Question[] {
  return [...items].sort(
    (left, right) => left.index - right.index || left.id - right.id,
  );
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  if (!response.ok) throw new Error("Evaluation request failed");
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function writeOptions(
  method: string,
  input?: NameInput | EvaluationInput,
): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: input ? JSON.stringify(input) : undefined,
  };
}

export function listEvaluations(): Promise<Evaluation[]> {
  return request("/api/admin/evaluations/");
}

export function createEvaluation(input: EvaluationInput): Promise<Evaluation> {
  return request("/api/admin/evaluations/", writeOptions("POST", input));
}

export function updateEvaluation(
  id: number,
  input: NameInput,
): Promise<Evaluation> {
  return request(`/api/admin/evaluations/${id}/`, writeOptions("PUT", input));
}

export function deleteEvaluation(id: number): Promise<void> {
  return request(`/api/admin/evaluations/${id}/`, writeOptions("DELETE"));
}

export function validateEvaluation(id: number): Promise<Evaluation> {
  return request(
    `/api/admin/evaluations/${id}/validate/`,
    writeOptions("POST"),
  );
}

export function archiveEvaluation(id: number): Promise<Evaluation> {
  return request(`/api/admin/evaluations/${id}/archive/`, writeOptions("POST"));
}

export function listQuestions(evaluationId: number): Promise<Question[]> {
  return request(`/api/admin/evaluations/${evaluationId}/questions/`);
}

export function createQuestion(
  evaluationId: number,
  input: NameInput,
): Promise<Question> {
  return request(
    `/api/admin/evaluations/${evaluationId}/questions/`,
    writeOptions("POST", input),
  );
}

export function updateQuestion(
  id: number,
  input: NameInput,
): Promise<Question> {
  return request(`/api/admin/questions/${id}/`, writeOptions("PUT", input));
}

export function deleteQuestion(id: number): Promise<void> {
  return request(`/api/admin/questions/${id}/`, writeOptions("DELETE"));
}
