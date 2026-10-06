import type { SteeringProjection } from "../steering";

export const steeringFixture: SteeringProjection = {
  organization: { id: 1, name: "North" },
  as_of_date: "2026-10-06",
  summary: {
    active_teams: 3,
    teams_with_results: 2,
    teams_without_results: 1,
    overdue_evaluations: 2,
    last_completed_at: "2026-10-02T12:00:00Z",
  },
  teams: [
    {
      team_id: 10,
      team_name: "Alpha",
      coaches: [
        { id: 3, name: "Coach A" },
        { id: 4, name: "Coach B" },
      ],
      last_result: {
        run_id: 101,
        evaluation_id: 2,
        family_id: 4,
        model_name: "Maturité",
        version: 2,
        completed_at: "2026-10-02T12:00:00Z",
      },
      next_due_date: "2026-10-01",
      status: "overdue",
    },
    {
      team_id: 30,
      team_name: "Gamma",
      coaches: [],
      last_result: null,
      next_due_date: null,
      status: "never_evaluated",
    },
    {
      team_id: 20,
      team_name: "Beta",
      coaches: [],
      last_result: {
        run_id: 102,
        evaluation_id: 2,
        family_id: 4,
        model_name: "Maturité",
        version: 2,
        completed_at: "2026-10-01T12:00:00Z",
      },
      next_due_date: "2026-10-06",
      status: "up_to_date",
    },
  ],
};
