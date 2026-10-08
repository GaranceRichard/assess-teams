import type { SteeringProjection } from "../steering";
import { comparison } from "./results";
import { model, organization, teams } from "./fixtures";
import { state } from "./store";
export { steeringResultsPath } from "../steering";
export const listSteeringOrganizations = async () => [organization];
export const getSteering = async (id: number): Promise<SteeringProjection> => {
  if (id !== 1) throw new Error("Organisation inaccessible.");
  const results = comparison();
  const pending = state.runs.filter((r) => r.state !== "completed");
  return {
    organization,
    as_of_date: "2026-10-08",
    summary: {
      active_teams: teams.length,
      teams_with_results: results.teams.length,
      teams_without_results: 0,
      overdue_evaluations: pending.filter((r) => r.id === 2).length,
      last_completed_at: results.teams
        .map((t) => t.completed_at)
        .sort()
        .at(-1)!,
    },
    teams: [...teams]
      .sort((left, right) => {
        const overdue = (id: number) =>
          Number(id === 2 && pending.some((r) => r.id === id));
        return (
          overdue(right.id) - overdue(left.id) ||
          left.name.localeCompare(right.name)
        );
      })
      .map((team) => {
        const result = results.teams.find((t) => t.team_id === team.id)!;
        const awaiting = pending.some((r) => r.id === team.id);
        return {
          team_id: team.id,
          team_name: result.team_name,
          coaches: [{ id: 2, name: "Alex · Coach fictif" }],
          last_result: {
            run_id: result.run_id,
            evaluation_id: 1,
            family_id: 1,
            model_name: model.name,
            version: 1,
            completed_at: result.completed_at,
          },
          next_due_date: awaiting
            ? team.id === 2
              ? "2026-10-01"
              : "2026-10-08"
            : null,
          status: awaiting && team.id === 2 ? "overdue" : "up_to_date",
        };
      }),
  };
};
