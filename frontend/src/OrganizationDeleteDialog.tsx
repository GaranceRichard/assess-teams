import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { useState } from "react";

import type { Organization } from "./organizations";

type Props = {
  error?: string | null;
  organization: Organization;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function OrganizationDeleteDialog({
  error,
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
    <Modal
      backdropClassName="organization-dialog-backdrop"
      labelledBy="organization-delete-title"
      describedBy="OrganizationDeleteDialog-description"
      onClose={onCancel}
      dismissible={!deleting}
    >
      <div className="organization-dialog">
        <h2 id="organization-delete-title">Supprimer l’organisation ?</h2>
        <ErrorNotice error={error} />
        <p id="OrganizationDeleteDialog-description">
          {organization.name} sera définitivement supprimée. Ses utilisateurs
          conserveront leurs comptes et leurs autres rattachements.
        </p>
        <p>
          La suppression sera refusée si des équipes, des référentiels, des
          planifications, des passations, des observations ou des notifications
          liées existent, quel que soit leur état, même archivé ou non commencé.
        </p>
        <p>
          Le Journal et les Logs conserveront leur provenance et resteront
          consultables par le Superadmin, selon les durées de rétention
          applicables.
        </p>
        <div className="organization-dialog-actions">
          <button
            className="secondary"
            disabled={deleting}
            onClick={onCancel}
            type="button"
          >
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
    </Modal>
  );
}
