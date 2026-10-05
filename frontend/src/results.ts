export type ResultVersion = {
  id: number;
  family_id: number;
  family_name: string;
  version: number;
  organization_name: string;
};
export type ResultAxis = { question_id: number; index: number; text: string };
export type ResultTeam = {
  team_id: number;
  team_name: string;
  run_id: number;
  completed_at: string;
  scores: number[];
};
export type ResultComparison = { axes: ResultAxis[]; teams: ResultTeam[] };

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/results/versions/${path}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Results request failed");
  return (await response.json()) as T;
}

export const listResultVersions = () => request<ResultVersion[]>("");
export const getResultComparison = (id: number) =>
  request<ResultComparison>(`${id}/`);
