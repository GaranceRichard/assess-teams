import { type FormEvent, useState } from "react";

import type { Organization } from "./organizations";

type Props = {
  organization: Organization;
  onCancel: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function OrganizationRenameDialog({
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
    <div className="organization-dialog-backdrop">
      <div
        aria-labelledby="organization-rename-title"
        className="organization-dialog"
        role="dialog"
      >
        <h2 id="organization-rename-title">Renommer l’organisation</h2>
        <form className="organization-rename-form" onSubmit={submit}>
          <label htmlFor="organization-new-name">Nom</label>
          <input
            autoFocus
            id="organization-new-name"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <div className="organization-dialog-actions">
            <button className="secondary" onClick={onCancel} type="button">
              Annuler
            </button>
            <button disabled={saving || !name.trim()} type="submit">
              {saving ? "Enregistrement…" : "Enregistrer le nom"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
