export type ResultVersion = {
  id: number;
  family_id: number;
  family_name: string;
  version: number;
  organization_name: string;
};
export type ResultAxis = {
  question_id: number;
  index: number;
  text: string;
  lineage_id?: string;
};
export type ResultOrganization = { id: number; name: string };
export type ResultFamily = ResultVersion & { organization_id: number };
export type ResultFamilyComparison = ResultComparison & {
  evaluation_id: number;
  version: number;
};
export type ResultObservation = {
  run_id: number;
  team_name: string;
  completed_at: string;
  score: number;
  criterion_text: string;
  evaluation_id: number;
  version: number;
};
export type ResultHistory = {
  lineage_id: string;
  criterion_text: string;
  teams: { team_id: number; team_name: string; points: ResultObservation[] }[];
};
export type ResultTeam = {
  team_id: number;
  team_name: string;
  run_id: number;
  completed_at: string;
  scores: number[];
};
export type ResultComparison = { axes: ResultAxis[]; teams: ResultTeam[] };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/results/${path}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Results request failed");
  return (await response.json()) as T;
}

export const listResultVersions = () => request<ResultVersion[]>("versions/");
export const getResultComparison = (id: number) =>
  request<ResultComparison>(`versions/${id}/`);

export const listResultOrganizations = () =>
  request<ResultOrganization[]>("organizations/");
export const listResultFamilies = (organizationId: number) =>
  request<ResultFamily[]>(`families/?organization_id=${organizationId}`);
export const getFamilyComparison = (familyId: number) =>
  request<ResultFamilyComparison>(`families/${familyId}/`);
export function getCriterionHistory(
  familyId: number,
  lineageId: string,
  teamIds: number[],
) {
  const query = new URLSearchParams();
  teamIds.forEach((id) => query.append("team_ids", String(id)));
  return request<ResultHistory>(
    `families/${familyId}/criteria/${encodeURIComponent(lineageId)}/?${query}`,
  );
}
