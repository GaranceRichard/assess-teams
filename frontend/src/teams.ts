import { csrfToken } from "./auth";

export type TeamCoach = { id: number; identifier: string };

export type Team = {
  id: number;
  name: string;
  organization_id: number;
  is_active: boolean;
  coaches: TeamCoach[];
};

export type TeamInput = { name: string; coach_ids: number[] };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  if (!response.ok) throw new Error("Team request failed");
  return (response.status === 204 ? undefined : await response.json()) as T;
}

function writeOptions(method: string, input?: TeamInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken() },
    body: input ? JSON.stringify(input) : undefined,
  };
}

export function listTeams(organizationId: number): Promise<Team[]> {
  return request(`/api/admin/organizations/${organizationId}/teams/`);
}

export function createTeam(
  organizationId: number,
  input: TeamInput,
): Promise<Team> {
  return request(
    `/api/admin/organizations/${organizationId}/teams/`,
    writeOptions("POST", input),
  );
}

export function updateTeam(id: number, input: TeamInput): Promise<Team> {
  return request(`/api/admin/teams/${id}/`, writeOptions("PUT", input));
}

export function deleteTeam(id: number): Promise<void> {
  return request(`/api/admin/teams/${id}/`, writeOptions("DELETE"));
}
