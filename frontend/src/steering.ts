export type SteeringOrganization = { id: number; name: string };
export type SteeringTeam = {
  team_id: number;
  team_name: string;
  coaches: { id: number; name: string }[];
  last_result: {
    run_id: number;
    evaluation_id: number;
    family_id: number;
    model_name: string;
    version: number;
    completed_at: string;
  } | null;
  next_due_date: string | null;
  status: "overdue" | "never_evaluated" | "up_to_date";
};
export type SteeringProjection = {
  organization: SteeringOrganization;
  as_of_date: string;
  summary: {
    active_teams: number;
    teams_with_results: number;
    teams_without_results: number;
    overdue_evaluations: number;
    last_completed_at: string | null;
  };
  teams: SteeringTeam[];
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`/api/steering/${path}`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Steering request failed");
  return (await response.json()) as T;
}
export const listSteeringOrganizations = () =>
  request<SteeringOrganization[]>("organizations/");
export const getSteering = (id: number) =>
  request<SteeringProjection>(`?organization_id=${id}`);

export function steeringResultsPath(
  organizationId: number,
  team: SteeringTeam,
) {
  const query = new URLSearchParams({
    organization_id: String(organizationId),
    family_id: String(team.last_result!.family_id),
    team_id: String(team.team_id),
  });
  return `/results?${query}`;
}
