import { ErrorNotice } from "./ErrorNotice";
import { useState } from "react";
import { Modal } from "./Modal";
import type { Team } from "./teams";

type Props = {
  error?: string | null;
  team: Team;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function TeamDeleteDialog({ error, team, onCancel, onConfirm }: Props) {
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
      backdropClassName="team-dialog-backdrop"
      labelledBy="team-delete-title"
      describedBy="TeamDeleteDialog-description"
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="team-dialog">
        <h2 id="team-delete-title">Supprimer l’équipe ?</h2>
        <ErrorNotice error={error} />
        <p id="TeamDeleteDialog-description">
          {team.name} sera retirée des équipes actives.
        </p>
        <div className="team-dialog-actions">
          <button className="secondary" disabled={saving} onClick={onCancel}>
            Annuler
          </button>
          <button
            className="team-danger"
            disabled={saving}
            onClick={() => void confirm()}
          >
            Valider la suppression
          </button>
        </div>
      </section>
    </Modal>
  );
}
