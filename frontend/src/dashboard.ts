import type { SessionUser } from "./auth";

export type DashboardActivity = {
  run_id: number;
  type: "completed" | "revised";
  organization_id: number;
  organization_name: string;
  team_name: string;
  model_name: string;
  version: number;
  occurred_at: string;
  author_name: string | null;
};

export type DashboardData = {
  profile: SessionUser & { first_name: string; last_name: string };
  activity_scope: "global" | "accessible_results";
  recent_activity: DashboardActivity[];
  pending_assignments: number | null;
};

export async function getDashboard(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard/", {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("Dashboard request failed");
  const data = (await response.json()) as DashboardData;
  if (!Array.isArray(data.recent_activity) || !data.profile)
    throw new Error("Invalid dashboard response");
  return data;
}
