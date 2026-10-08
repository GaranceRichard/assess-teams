import type { ResultHistory, ResultFamilyComparison } from "../results";
import {
  criteria,
  dates,
  model,
  organization,
  scores,
  teams,
} from "./fixtures";
import { state } from "./store";
export const axes = criteria.map((q) => ({
  question_id: q.id,
  index: q.index,
  text: q.name,
  lineage_id: String(q.id),
}));
export function comparison(): ResultFamilyComparison {
  return {
    evaluation_id: 1,
    version: 1,
    axes,
    teams: teams.map((team, index) => {
      const run = state.runs.find(
        (r) => r.id === team.id && r.state === "completed",
      );
      return {
        team_id: team.id,
        team_name: team.name + (run ? " · votre passation" : " · simulation"),
        run_id: run ? run.id : 100 + team.id * 10 + 2,
        completed_at: run ? run.completed_at! : dates[2],
        scores: run ? run.questions.map((q) => q.score!) : scores[index],
      };
    }),
  };
}
export const listResultOrganizations = async () => [organization];
export const listResultFamilies = async () => [
  { ...model, organization_name: organization.name },
];
export const getFamilyComparison = async () => comparison();
export const getCriterionHistory = async (
  familyId: number,
  lineageId: string,
  teamIds: number[],
): Promise<ResultHistory> => {
  const index = criteria.findIndex((q) => String(q.id) === lineageId);
  if (
    familyId !== 1 ||
    index < 0 ||
    teamIds.some((id) => !teams.some((t) => t.id === id))
  )
    throw new Error("Critère ou équipe inaccessible.");
  return {
    lineage_id: lineageId,
    criterion_text: criteria[index].name,
    teams: teams
      .filter((t) => teamIds.includes(t.id))
      .map((team) => {
        const teamIndex = teams.findIndex((t) => t.id === team.id);
        const points = dates.map((date, i) => ({
          run_id: 100 + team.id * 10 + i,
          team_name: team.name + " · simulation",
          completed_at: date,
          score: Math.max(0, scores[teamIndex][index] - (2 - i)),
          criterion_text: criteria[index].name,
          evaluation_id: 1,
          version: 1,
        }));
        const run = state.runs.find(
          (r) => r.id === team.id && r.state === "completed",
        );
        if (run)
          points.push({
            run_id: run.id,
            team_name: team.name + " · votre passation",
            completed_at: run.completed_at!,
            score: run.questions[index].score!,
            criterion_text: criteria[index].name,
            evaluation_id: 1,
            version: 1,
          });
        return { team_id: team.id, team_name: team.name, points };
      }),
  };
};

export const listResultVersions = listResultFamilies;
export const getResultComparison = getFamilyComparison;
