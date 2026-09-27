import { csrfToken } from "./auth";

export type OrderedName = { id: number; index: number; name: string };
export type Evaluation = OrderedName;
export type Question = OrderedName;
export type OrderedNameInput = { index: number; name: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  if (!response.ok) throw new Error("Evaluation request failed");
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function writeOptions(method: string, input?: OrderedNameInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: input ? JSON.stringify(input) : undefined,
  };
}

export function listEvaluations(): Promise<Evaluation[]> {
  return request("/api/admin/evaluations/");
}

export function createEvaluation(input: OrderedNameInput): Promise<Evaluation> {
  return request("/api/admin/evaluations/", writeOptions("POST", input));
}

export function updateEvaluation(
  id: number,
  input: OrderedNameInput,
): Promise<Evaluation> {
  return request(`/api/admin/evaluations/${id}/`, writeOptions("PUT", input));
}

export function deleteEvaluation(id: number): Promise<void> {
  return request(`/api/admin/evaluations/${id}/`, writeOptions("DELETE"));
}

export function listQuestions(evaluationId: number): Promise<Question[]> {
  return request(`/api/admin/evaluations/${evaluationId}/questions/`);
}

export function createQuestion(
  evaluationId: number,
  input: OrderedNameInput,
): Promise<Question> {
  return request(
    `/api/admin/evaluations/${evaluationId}/questions/`,
    writeOptions("POST", input),
  );
}

export function updateQuestion(
  id: number,
  input: OrderedNameInput,
): Promise<Question> {
  return request(`/api/admin/questions/${id}/`, writeOptions("PUT", input));
}

export function deleteQuestion(id: number): Promise<void> {
  return request(`/api/admin/questions/${id}/`, writeOptions("DELETE"));
}
