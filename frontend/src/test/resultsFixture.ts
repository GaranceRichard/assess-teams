import type { SessionUser } from "../auth";

import type {
  ResultComparison,
  ResultVersion,
  ResultFamily,
  ResultHistory,
} from "../results";

export const resultVersions: ResultVersion[] = [
  {
    id: 1,
    family_id: 4,
    family_name: "Maturité",
    version: 1,
    organization_name: "North",
  },
  {
    id: 2,
    family_id: 4,
    family_name: "Maturité",
    version: 2,
    organization_name: "North",
  },
];
export const resultComparison: ResultComparison = {
  axes: [
    {
      question_id: 1,
      lineage_id: "00000000-0000-4000-8000-000000000001",
      index: 1,
      text: "Collaboration",
    },
    {
      question_id: 2,
      lineage_id: "00000000-0000-4000-8000-000000000002",
      index: 2,
      text: "Critère très long qui doit rester intégralement accessible dans le tableau",
    },
    {
      question_id: 3,
      lineage_id: "00000000-0000-4000-8000-000000000003",
      index: 3,
      text: "Amélioration",
    },
  ],
  teams: [
    {
      team_id: 10,
      team_name: "Alpha",
      run_id: 101,
      completed_at: "2026-10-02T12:00:00Z",
      scores: [0, 10, 7],
    },
    {
      team_id: 20,
      team_name: "Beta",
      run_id: 102,
      completed_at: "2026-10-03T12:00:00Z",
      scores: [10, 0, 5],
    },
  ],
};

export const resultActor: SessionUser = {
  username: "admin",
  role: "Admin",
  is_superuser: false,
  organization_name: "North",
  team_names: [],
  interface_palette: "green",
};
export const resultOrganizations = [
  { id: 1, name: "North" },
  { id: 2, name: "South" },
];
export const resultFamilies: ResultFamily[] = [
  { ...resultVersions[1], organization_id: 1 },
  {
    ...resultVersions[0],
    family_id: 5,
    family_name: "Autre modèle",
    organization_id: 1,
  },
];
export const resultFamilyComparison = {
  ...resultComparison,
  evaluation_id: 2,
  version: 2,
};
export const resultHistory: ResultHistory = {
  lineage_id: resultComparison.axes[0].lineage_id!,
  criterion_text: "Collaboration",
  teams: resultComparison.teams.map((team) => ({
    team_id: team.team_id,
    team_name: team.team_name,
    points: [
      {
        run_id: team.run_id - 10,
        team_name: team.team_name,
        completed_at: "2026-09-01T12:00:00Z",
        score: 2,
        criterion_text: "Ancienne collaboration",
        evaluation_id: 1,
        version: 1,
      },
      {
        run_id: team.run_id,
        team_name: team.team_name,
        completed_at: team.completed_at,
        score: team.scores[0],
        criterion_text: "Collaboration",
        evaluation_id: 2,
        version: 2,
      },
    ],
  })),
};
