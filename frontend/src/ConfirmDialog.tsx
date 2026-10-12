import { ErrorNotice } from "./ErrorNotice";
import { useState } from "react";
import { Modal } from "./Modal";

type Props = {
  error?: string | null;
  name: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDialog({ error, name, onCancel, onConfirm }: Props) {
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
      backdropClassName="dialog-backdrop"
      labelledBy="confirm-title"
      closeOnBackdrop
      describedBy="ConfirmDialog-description"
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="dialog">
        <h2 id="confirm-title">Désactiver l’utilisateur ?</h2>
        <ErrorNotice error={error} />
        <p id="ConfirmDialog-description">
          Le compte de {name} ne pourra plus agir. Son identité et son
          historique seront conservés.
        </p>
        <div className="dialog-actions">
          <button className="secondary" disabled={saving} onClick={onCancel}>
            Annuler
          </button>
          <button
            className="danger"
            disabled={saving}
            onClick={() => void confirm()}
          >
            Confirmer la désactivation
          </button>
        </div>
      </section>
    </Modal>
  );
}
