import type { SessionUser } from "../auth";
import type { EvaluationRun } from "../evaluationRuns";
import type { Question, Evaluation } from "../evaluations";

export const organization = { id: 1, name: "Atelier Horizon" };
export const user: SessionUser = {
  id: 1,
  username: "Camille · profil fictif",
  role: "Admin",
  is_superuser: false,
  organization_name: organization.name,
  team_names: ["Aurore", "Boréal", "Canopée"],
  interface_palette: "green",
};
export const teams = [
  {
    id: 1,
    name: "Aurore",
    context: "Produit · 7 personnes · clarifier les priorités communes.",
  },
  {
    id: 2,
    name: "Boréal",
    context: "Services · 6 personnes · renforcer l’entraide au quotidien.",
  },
  {
    id: 3,
    name: "Canopée",
    context: "Plateforme · 5 personnes · accompagner une équipe en croissance.",
  },
];
export const model: Evaluation = {
  id: 1,
  name: "Coopération d’équipe",
  family_id: 1,
  family_name: "Coopération d’équipe",
  organization_id: 1,
  version: 1,
  status: "VALIDATED",
};
export const criteria: Question[] = [
  {
    id: 1,
    index: 1,
    name: "Clarté des objectifs",
    appreciation_markers: [
      { score: 0, text: "Les objectifs communs restent à définir." },
      {
        score: 5,
        text: "Les objectifs sont connus, leur compréhension reste à partager.",
      },
      {
        score: 8,
        text: "L’équipe partage des objectifs clairs et les ajuste ensemble.",
      },
      {
        score: 10,
        text: "Chaque membre relie ses décisions aux objectifs partagés.",
      },
    ],
  },
  {
    id: 2,
    index: 2,
    name: "Communication",
    appreciation_markers: [
      {
        score: 3,
        text: "Les échanges sont ponctuels et les informations dispersées.",
      },
      {
        score: 7,
        text: "Les échanges réguliers rendent les informations accessibles.",
      },
    ],
  },
  { id: 3, index: 3, name: "Entraide" },
  { id: 4, index: 4, name: "Autonomie" },
  { id: 5, index: 5, name: "Apprentissage collectif" },
];
export const dates = [
  "2026-04-08T14:00:00Z",
  "2026-07-08T14:00:00Z",
  "2026-10-01T14:00:00Z",
];
export const scores = [
  [5, 6, 6, 5, 4],
  [7, 5, 8, 6, 7],
  [6, 7, 5, 8, 6],
];
export function initialRuns(): EvaluationRun[] {
  return teams.map((team) => ({
    id: team.id,
    schedule_id: team.id,
    organization_id: 1,
    organization_name: organization.name,
    team_name: team.name,
    evaluation_name: model.name,
    family_id: 1,
    family_name: model.name,
    evaluation_version: 1,
    assigned_to: user.username,
    filled_by: "",
    completed_at: null,
    revised_by: "",
    revised_at: null,
    due_date: team.id === 2 ? "2026-10-01" : "2026-10-08",
    state: "not_started",
    is_assignee: true,
    can_revise: false,
    questions: criteria.map((q) => ({
      question_id: q.id,
      index: q.index,
      text: q.name,
      score: null,
      appreciation_markers: structuredClone(q.appreciation_markers ?? []),
    })),
  }));
}
