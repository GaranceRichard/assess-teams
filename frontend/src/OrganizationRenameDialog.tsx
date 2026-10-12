import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { type FormEvent, useState } from "react";

import type { Organization } from "./organizations";

type Props = {
  error?: string | null;
  organization: Organization;
  onCancel: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function OrganizationRenameDialog({
  error,
  organization,
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(organization.name);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(name);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      backdropClassName="organization-dialog-backdrop"
      labelledBy="organization-rename-title"
      onClose={onCancel}
      dismissible={!saving}
    >
      <div className="organization-dialog">
        <h2 id="organization-rename-title">Renommer l’organisation</h2>
        <ErrorNotice error={error} />
        <form className="organization-rename-form" onSubmit={submit}>
          <label htmlFor="organization-new-name">Nom</label>
          <input
            id="organization-new-name"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <div className="organization-dialog-actions">
            <button
              className="secondary"
              disabled={saving}
              onClick={onCancel}
              type="button"
            >
              Annuler
            </button>
            <button disabled={saving || !name.trim()} type="submit">
              {saving ? "Enregistrement…" : "Enregistrer le nom"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
