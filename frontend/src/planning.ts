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
  team_id: number;
  team_name: string;
  evaluation_id: number;
  evaluation_name: string;
  mode: ScheduleMode;
  first_due_date: string;
};

export type ScheduleInput = {
  organization_id: number;
  team_id: number;
  evaluation_id: number;
  mode: ScheduleMode;
  first_due_date?: string;
  coach_id?: number;
};

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch("/api/admin/planning/", {
    credentials: "same-origin",
    ...init,
  });
  if (!response.ok) throw new Error("Planning request failed");
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
