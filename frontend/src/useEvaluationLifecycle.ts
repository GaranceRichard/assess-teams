import { useState } from "react";

import {
  archiveEvaluation,
  type Evaluation,
  validateEvaluation,
} from "./evaluations";
import type { LifecycleTarget } from "./EvaluationPageDialogs";

export function useEvaluationLifecycle(
  onSaved: (evaluation: Evaluation) => void,
  onError: (message: string | null) => void,
) {
  const [target, setTarget] = useState<LifecycleTarget | null>(null);

  async function confirm() {
    if (!target) return;
    try {
      const saved =
        target.action === "validate"
          ? await validateEvaluation(target.value.id)
          : await archiveEvaluation(target.value.id);
      onSaved(saved);
      setTarget(null);
      onError(null);
    } catch {
      onError(
        `La ${target.action === "validate" ? "validation" : "mise en archive"} de l’évaluation a été refusée.`,
      );
    }
  }

  return { target, setTarget, confirm };
}
