export const evaluation = {
  id: 2,
  family_id: 2,
  family_name: "Maturité",
  version: 1,
  name: "Maturité",
  organization_id: 1,
  status: "VALIDATED",
};
export const team = {
  id: 3,
  name: "Alpha",
  organization_id: 1,
  organization_name: "North",
  is_active: true,
  coaches: [],
};
export const existing = {
  id: 4,
  organization_id: 1,
  organization_name: "North",
  team_id: 3,
  team_name: "Alpha",
  evaluation_id: 2,
  family_id: 1,
  family_name: "Maturité",
  evaluation_version: 1,
  evaluation_name: "Maturité",
  assignee_id: 9,
  assignee_identifier: "coach",
  assignee_role: "Coach" as const,
  mode: "quarterly" as const,
  first_due_date: "2026-10-05",
};
