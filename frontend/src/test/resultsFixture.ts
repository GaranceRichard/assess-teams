import type { ResultComparison, ResultVersion } from "../results";

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
    { question_id: 1, index: 1, text: "Collaboration" },
    {
      question_id: 2,
      index: 2,
      text: "Critère très long qui doit rester intégralement accessible dans le tableau",
    },
    { question_id: 3, index: 3, text: "Amélioration" },
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
