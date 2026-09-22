import { type FormEvent, type MouseEvent, useState } from "react";

import type { UserRole } from "./auth";
import type { ManagedUser, UserInput } from "./managedUsers";

type Props = {
  user?: ManagedUser;
  onCancel: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
};

export function UserDialog({ user, onCancel, onSubmit }: Props) {
  const [identifier, setIdentifier] = useState(user?.identifier ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>("Viewer");
  const [saving, setSaving] = useState(false);

  function closeBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit(user ? { identifier, email } : { identifier, email, role });
    setSaving(false);
  }

  return (
    <div className="dialog-backdrop" onMouseDown={closeBackdrop}>
      <section
        aria-labelledby="user-dialog-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <h2 id="user-dialog-title">
          {user ? "Modifier l’utilisateur" : "Ajouter un utilisateur"}
        </h2>
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
          {!user && (
            <>
              <label htmlFor="managed-role">Type utilisateur</label>
              <select
                id="managed-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option>Admin</option>
                <option>Coach</option>
                <option>Viewer</option>
              </select>
            </>
          )}
          <div className="dialog-actions">
            <button className="secondary" type="button" onClick={onCancel}>
              Annuler
            </button>
            <button disabled={saving} type="submit">
              Valider
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
