import type { Evaluation } from "./evaluations";
import { versionLabel } from "./evaluationVersionLabel";

export function PlanningEvaluationOption({
  evaluation,
}: {
  evaluation: Evaluation;
}) {
  return (
    <option disabled={evaluation.status !== "VALIDATED"} value={evaluation.id}>
      {versionLabel(evaluation.family_name, evaluation.version)}
      {evaluation.status === "ARCHIVED" ? " — Archivé (historique)" : ""}
    </option>
  );
}
