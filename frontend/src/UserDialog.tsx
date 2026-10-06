import { type FormEvent, type MouseEvent, useState } from "react";

import type { UserRole } from "./auth";
import type { ManagedUser, UserInput } from "./managedUsers";

type Props = {
  user?: ManagedUser;
  allowedRoles: UserRole[];
  onCancel: () => void;
  onSubmit: (input: UserInput) => Promise<void>;
};

export function UserDialog({ user, allowedRoles, onCancel, onSubmit }: Props) {
  const [identifier, setIdentifier] = useState(user?.identifier ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const initialRole =
    user && user.user_type !== "Superadmin" ? user.user_type : allowedRoles[0];
  const [role, setRole] = useState<UserRole | undefined>(initialRole);
  const [saving, setSaving] = useState(false);

  function closeBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const roleInput = allowedRoles.length > 0 ? { role } : {};
    await onSubmit({ identifier, email, ...roleInput });
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
