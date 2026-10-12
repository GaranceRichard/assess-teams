import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { useState } from "react";

import { versionLabel } from "./evaluationVersionLabel";
import type { Evaluation } from "./evaluations";

type Props = {
  error?: string | null;
  action: "validate" | "archive";
  evaluation: Evaluation;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function EvaluationLifecycleDialog({
  error,
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
    <Modal
      backdropClassName="evaluation-dialog-backdrop"
      labelledBy="evaluation-lifecycle-title"
      describedBy="EvaluationLifecycleDialog-description"
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="evaluation-dialog">
        <h2 id="evaluation-lifecycle-title">
          {validating ? "Valider" : "Archiver"} ce modèle ?
        </h2>
        <ErrorNotice error={error} />
        <p id="EvaluationLifecycleDialog-description">
          « {versionLabel(evaluation.family_name, evaluation.version)} »{" "}
          {validating
            ? "et ses questions deviendront définitivement non modifiables. L’ancienne version validée de cette famille sera automatiquement archivée."
            : "restera consultable, mais ne pourra plus être nouvellement planifié."}
        </p>
        <div className="evaluation-dialog-actions">
          <button className="secondary" disabled={saving} onClick={onCancel}>
            Annuler
          </button>
          <button disabled={saving} onClick={() => void confirm()}>
            {saving
              ? "Enregistrement…"
              : `Confirmer ${validating ? "la validation" : "l’archivage"}`}
          </button>
        </div>
      </section>
    </Modal>
  );
}
