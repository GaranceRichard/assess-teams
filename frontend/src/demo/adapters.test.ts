import { beforeEach, describe, expect, it, vi } from "vitest";
import { criteria, model, user } from "./fixtures";
import {
  copy,
  deleteQuestion,
  moveQuestion,
  resetDemo,
  saveQuestion,
  state,
} from "./store";
import * as runs from "./evaluationRuns";
import * as results from "./results";
import * as auth from "./auth";
import { getDashboard } from "./dashboard";
import {
  getSteering,
  listSteeringOrganizations,
  steeringResultsPath,
} from "./steering";
beforeEach(resetDemo);
describe("adaptateur DEMO sans réseau", () => {
  it("charge un profil fictif et change la palette sans compte", async () => {
    const network = vi.spyOn(globalThis, "fetch");
    expect(await auth.getCurrentUser()).toEqual(user);
    expect((await auth.savePalette("violet")).interface_palette).toBe("violet");
    await expect(auth.login()).rejects.toThrow();
    await auth.logout();
    expect(network).not.toHaveBeenCalled();
    network.mockRestore();
  });
  it("édite un brouillon et préserve le modèle validé", () => {
    saveQuestion(null, "  Écoute  ");
    expect(state.questions.at(-1)?.name).toBe("Écoute");
    saveQuestion(state.questions[0], "Objectifs partagés");
    moveQuestion(1, 1);
    expect(state.questions[1].name).toBe("Objectifs partagés");
    expect(state.questions.map((q) => q.index)).toEqual([1, 2, 3, 4, 5, 6]);
    deleteQuestion(1);
    expect(state.questions.map((q) => q.index)).toEqual([1, 2, 3, 4, 5]);
    expect(criteria[0].name).toBe("Clarté des objectifs");
    expect(state.runs[0].questions[0].text).toBe(criteria[0].name);
    expect(() => saveQuestion(null, " ")).toThrow();
    expect(() => saveQuestion(null, "x".repeat(256))).toThrow();
    expect(() => saveQuestion({ id: 99, index: 1, name: "X" }, "X")).toThrow();
    expect(() => deleteQuestion(99)).toThrow();
    expect(() => moveQuestion(99, 1)).toThrow();
    expect(() => moveQuestion(2, -1)).toThrow();
    expect(() => moveQuestion(state.questions.at(-1)!.id, 1)).toThrow();
    expect(() => moveQuestion(3, 2)).toThrow();
    resetDemo();
    expect(state.questions).toEqual(criteria);
    expect(copy(model)).toEqual(model);
  });
  it("refuse les réponses incomplètes, hors bornes et les identifiants inconnus", async () => {
    await expect(runs.getEvaluationRun(99)).rejects.toThrow();
    await expect(runs.saveEvaluationScore(1, 1, 5)).rejects.toThrow();
    await expect(runs.finalizeEvaluationRun(1)).rejects.toThrow();
    await runs.startEvaluationRun(1);
    for (const score of [-1, 11, 1.5, NaN])
      await expect(runs.saveEvaluationScore(1, 1, score)).rejects.toThrow();
    await expect(runs.saveEvaluationScore(1, 99, 5)).rejects.toThrow();
    await expect(runs.finalizeEvaluationRun(1)).rejects.toThrow();
    await expect(runs.reviseEvaluationRun()).rejects.toThrow();
  });
  it("alimente les projections avec les vrais scores de la session et leur provenance", async () => {
    expect(await runs.listEvaluationRuns()).toHaveLength(3);
    await runs.startEvaluationRun(2);
    expect((await runs.getEvaluationRun(2)).state).toBe("in_progress");
    for (const q of criteria)
      await runs.saveEvaluationScore(2, q.id, q.id === 1 ? 0 : 10);
    const completed = await runs.finalizeEvaluationRun(2);
    expect(completed.filled_by).toBe(user.username);
    await expect(runs.startEvaluationRun(2)).rejects.toThrow();
    await expect(runs.saveEvaluationScore(2, 1, 8)).rejects.toThrow();
    const comparison = await results.getFamilyComparison();
    expect(comparison.teams[1].scores).toEqual([0, 10, 10, 10, 10]);
    expect(comparison.teams[1].team_name).toContain("votre passation");
    expect(comparison.teams[0].team_name).toContain("simulation");
    const history = await results.getCriterionHistory(1, "1", [1, 2]);
    expect(history.teams[0].points).toHaveLength(3);
    expect(history.teams[1].points.at(-1)).toMatchObject({
      score: 0,
      team_name: "Boréal · votre passation",
    });
    const dashboard = await getDashboard();
    expect(dashboard.pending_assignments).toBe(2);
    expect(dashboard.recent_activity[1].author_name).toContain("Vous");
    const steering = await getSteering(1);
    expect(steering.summary.overdue_evaluations).toBe(0);
    expect(steering.teams[1].next_due_date).toBeNull();
    expect(steering.teams[1].last_result?.completed_at).toBe(
      completed.completed_at,
    );
    expect(steeringResultsPath(1, steering.teams[1])).toContain("team_id=2");
    resetDemo();
    expect((await getSteering(1)).summary.overdue_evaluations).toBe(1);
    expect((await getDashboard()).recent_activity[0].author_name).toContain(
      "simulation",
    );
    expect((await auth.getCurrentUser()).interface_palette).toBe("green");
  });
  it("expose les références cohérentes et refuse les historiques hors périmètre", async () => {
    expect(await results.listResultOrganizations()).toEqual(
      await listSteeringOrganizations(),
    );
    expect((await results.listResultFamilies())[0].id).toBe(1);
    expect(await results.listResultVersions()).toEqual(
      await results.listResultFamilies(),
    );
    expect(await results.getResultComparison()).toEqual(results.comparison());
    for (const args of [
      [2, "1", [1]],
      [1, "99", [1]],
      [1, "1", [99]],
    ] as const)
      await expect(
        results.getCriterionHistory(args[0], args[1], [...args[2]]),
      ).rejects.toThrow();
    await expect(getSteering(99)).rejects.toThrow();
    expect(
      (await getSteering(1)).teams.find((t) => t.team_id === 2)?.status,
    ).toBe("overdue");
  });
});
