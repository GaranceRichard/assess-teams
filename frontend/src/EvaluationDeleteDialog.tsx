import { ErrorNotice } from "./ErrorNotice";
import { useState } from "react";
import { Modal } from "./Modal";
import type { NamedEntity } from "./evaluations";

type Props = {
  error?: string | null;
  kind: "évaluation" | "question";
  value: NamedEntity;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function EvaluationDeleteDialog({
  error,
  kind,
  value,
  onCancel,
  onConfirm,
}: Props) {
  const [saving, setSaving] = useState(false);

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
      labelledBy="evaluation-delete-title"
      describedBy="EvaluationDeleteDialog-description"
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="evaluation-dialog">
        <h2 id="evaluation-delete-title">Supprimer cette {kind} ?</h2>
        <ErrorNotice error={error} />
        <p id="EvaluationDeleteDialog-description">
          « {value.name} » sera définitivement supprimée
          {kind === "évaluation" ? " avec toutes ses questions" : ""}.
        </p>
        <div className="evaluation-dialog-actions">
          <button className="secondary" disabled={saving} onClick={onCancel}>
            Annuler
          </button>
          <button
            className="evaluation-danger"
            disabled={saving}
            onClick={() => void confirm()}
          >
            Confirmer la suppression
          </button>
        </div>
      </section>
    </Modal>
  );
}
