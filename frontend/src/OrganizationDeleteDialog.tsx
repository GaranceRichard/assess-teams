import { useState } from "react";

import type { Organization } from "./organizations";

type Props = {
  organization: Organization;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function OrganizationDeleteDialog({
  organization,
  onCancel,
  onConfirm,
}: Props) {
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="organization-dialog-backdrop">
      <div
        aria-labelledby="organization-delete-title"
        className="organization-dialog"
        role="dialog"
      >
        <h2 id="organization-delete-title">Supprimer l’organisation ?</h2>
        <p>
          {organization.name} sera définitivement supprimée. Ses utilisateurs
          conserveront leurs comptes.
        </p>
        <div className="organization-dialog-actions">
          <button className="secondary" onClick={onCancel} type="button">
            Annuler
          </button>
          <button
            className="organization-danger"
            disabled={deleting}
            onClick={confirm}
            type="button"
          >
            {deleting ? "Suppression…" : "Supprimer l’organisation"}
          </button>
        </div>
      </div>
    </div>
  );
}
