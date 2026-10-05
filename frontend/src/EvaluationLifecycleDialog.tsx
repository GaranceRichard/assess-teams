import { useState } from "react";

import { versionLabel } from "./evaluationVersionLabel";
import type { Evaluation } from "./evaluations";

type Props = {
  action: "validate" | "archive";
  evaluation: Evaluation;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function EvaluationLifecycleDialog({
  action,
  evaluation,
  onCancel,
  onConfirm,
}: Props) {
  const [saving, setSaving] = useState(false);
  const validating = action === "validate";

  async function confirm() {
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="evaluation-dialog-backdrop">
      <section
        aria-labelledby="evaluation-lifecycle-title"
        aria-modal="true"
        className="evaluation-dialog"
        role="dialog"
      >
        <h2 id="evaluation-lifecycle-title">
          {validating ? "Valider" : "Archiver"} ce modèle ?
        </h2>
        <p>
          « {versionLabel(evaluation.family_name, evaluation.version)} »{" "}
          {validating
            ? "et ses questions deviendront définitivement non modifiables. L’ancienne version validée de cette famille sera automatiquement archivée."
            : "restera consultable, mais ne pourra plus être nouvellement planifié."}
        </p>
        <div className="evaluation-dialog-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button disabled={saving} onClick={() => void confirm()}>
            {saving
              ? "Enregistrement…"
              : `Confirmer ${validating ? "la validation" : "l’archivage"}`}
          </button>
        </div>
      </section>
    </div>
  );
}
