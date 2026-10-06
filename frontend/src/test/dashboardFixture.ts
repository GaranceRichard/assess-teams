import type { DashboardData } from "../dashboard";

export const dashboardFixture: DashboardData = {
  profile: {
    id: 1,
    username: "member",
    first_name: "Léa",
    last_name: "Martin",
    role: "Admin",
    is_superuser: false,
    organization_name: "North",
    team_names: [],
    interface_palette: "blue",
  },
  activity_scope: "accessible_results",
  pending_assignments: 2,
  recent_activity: [
    {
      run_id: 4,
      type: "revised",
      organization_id: 1,
      organization_name: "North",
      team_name: "Équipe A",
      model_name: "Coopération",
      version: 2,
      occurred_at: "2026-10-06T10:00:00Z",
      author_name: "admin",
    },
    {
      run_id: 4,
      type: "completed",
      organization_id: 1,
      organization_name: "North",
      team_name: "Équipe A",
      model_name: "Coopération",
      version: 2,
      occurred_at: "2026-10-05T09:00:00Z",
      author_name: "coach",
    },
  ],
};
