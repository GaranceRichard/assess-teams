import type { DashboardData } from "../dashboard";
import { dates, model, organization, teams, user } from "./fixtures";
import { state } from "./store";
export const getDashboard = async (): Promise<DashboardData> => ({
  profile: {
    ...user,
    interface_palette: state.palette,
    first_name: "Camille",
    last_name: "(profil fictif)",
  },
  activity_scope: "accessible_results",
  pending_assignments: state.runs.filter((r) => r.state !== "completed").length,
  recent_activity: teams.map((team) => {
    const run = state.runs.find(
      (r) => r.id === team.id && r.state === "completed",
    );
    return {
      run_id: run ? run.id : 100 + team.id * 10 + 2,
      type: "completed",
      organization_id: 1,
      organization_name: organization.name,
      team_name: team.name,
      model_name: model.name,
      version: 1,
      occurred_at: run ? run.completed_at! : dates[2],
      author_name: run
        ? "Vous · passation de cette session"
        : "Coach fictif · simulation",
    };
  }),
});
