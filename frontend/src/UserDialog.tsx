import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { type FormEvent, useState } from "react";

import type { UserRole } from "./auth";
import type { ManagedUser, UserInput } from "./managedUsers";

type Props = {
  error?: string | null;
  user?: ManagedUser;
  allowedRoles: UserRole[];
  onCancel: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
};

export function UserDialog({
  error,
  user,
  allowedRoles,
  onCancel,
  onSubmit,
}: Props) {
  const [identifier, setIdentifier] = useState(user?.identifier ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const initialRole =
    user && user.user_type !== "Superadmin" ? user.user_type : allowedRoles[0];
  const [role, setRole] = useState<UserRole | undefined>(initialRole);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const roleInput = allowedRoles.length > 0 ? { role } : {};
    try {
      await onSubmit({ identifier, email, ...roleInput });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      backdropClassName="dialog-backdrop"
      labelledBy="user-dialog-title"
      closeOnBackdrop
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="dialog">
        <h2 id="user-dialog-title">
          {user ? "Modifier l’utilisateur" : "Ajouter un utilisateur"}
        </h2>
        <ErrorNotice error={error} />
        <form onSubmit={submit}>
          <label htmlFor="managed-identifier">Identifiant</label>
          <input
            id="managed-identifier"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
          <label htmlFor="managed-email">Adresse mail</label>
          <input
            id="managed-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {allowedRoles.length > 0 && (
            <>
              <label htmlFor="managed-role">Type utilisateur</label>
              <select
                id="managed-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                {allowedRoles.map((allowedRole) => (
                  <option key={allowedRole}>{allowedRole}</option>
                ))}
              </select>
            </>
          )}
          <div className="dialog-actions">
            <button
              className="secondary"
              type="button"
              disabled={saving}
              onClick={onCancel}
            >
              Annuler
            </button>
            <button disabled={saving} type="submit">
              Valider
            </button>
          </div>
        </form>
      </section>
    </Modal>
  );
}
