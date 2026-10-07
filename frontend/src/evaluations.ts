import { pageQuery, type CollectionPage } from "./collectionPage";
import { csrfToken } from "./auth";

export type NamedEntity = { id: number; name: string };
export type EvaluationStatus = "DRAFT" | "VALIDATED" | "ARCHIVED";
export type Evaluation = NamedEntity & {
  organization_id: number;
  family_id: number;
  family_name: string;
  version: number;
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

export function listEvaluations(): Promise<Evaluation[]>;
export function listEvaluations(
  page: number,
  organizationId?: number | null,
): Promise<CollectionPage<Evaluation>>;
export function listEvaluations(
  page?: number,
  organizationId?: number | null,
): Promise<Evaluation[] | CollectionPage<Evaluation>> {
  if (page !== undefined) {
    return request(`/api/admin/evaluations/${pageQuery(page, organizationId)}`);
  }
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

export function createEvaluationVersion(id: number): Promise<Evaluation> {
  return request(
    `/api/admin/evaluations/${id}/versions/`,
    writeOptions("POST"),
  );
}

export function mergeEvaluation(
  current: Evaluation[],
  saved: Evaluation,
): Evaluation[] {
  const updated = current.map((item) => {
    if (item.id === saved.id) return saved;
    if (
      saved.status === "VALIDATED" &&
      item.family_id === saved.family_id &&
      item.status === "VALIDATED"
    ) {
      return { ...item, status: "ARCHIVED" as const };
    }
    return item;
  });
  return current.some((item) => item.id === saved.id)
    ? updated
    : [...updated, saved];
}
