import { csrfToken } from "./auth";

export type ScheduleMode = "immediate" | "fixed" | "monthly" | "quarterly";

export const scheduleLabels: Record<ScheduleMode, string> = {
  immediate: "Tout de suite",
  fixed: "À date fixe",
  monthly: "Tous les mois",
  quarterly: "Tous les trimestres",
};

export type EvaluationSchedule = {
  id: number;
  organization_id: number;
  organization_name: string;
  team_id: number;
  team_name: string;
  evaluation_id: number;
  evaluation_name: string;
  family_id: number;
  family_name: string;
  evaluation_version: number;
  assignee_id: number | null;
  assignee_identifier: string | null;
  assignee_role: "Admin" | "Coach" | "Superadmin" | null;
  mode: ScheduleMode;
  first_due_date: string;
};

export type ScheduleInput = {
  organization_id: number;
  team_id: number;
  evaluation_id: number;
  assignee_id: number;
  mode: ScheduleMode;
  first_due_date?: string;
};

async function request<T>(
  init?: RequestInit,
  url = "/api/admin/planning/",
): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
  });
  if (!response.ok) throw new Error("Planning request failed");
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function listSchedules(): Promise<EvaluationSchedule[]> {
  return request();
}

export function createSchedule(
  input: ScheduleInput,
): Promise<EvaluationSchedule> {
  return request({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken(),
    },
    body: JSON.stringify(input),
  });
}

export function updateSchedule(
  id: number,
  input: ScheduleInput,
): Promise<EvaluationSchedule> {
  return request(
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken(),
      },
      body: JSON.stringify(input),
    },
    `/api/admin/planning/${id}/`,
  );
}

export function deleteSchedule(id: number): Promise<void> {
  return request(
    { method: "DELETE", headers: { "X-CSRFToken": csrfToken() } },
    `/api/admin/planning/${id}/`,
  );
}
