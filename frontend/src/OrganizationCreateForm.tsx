import { type FormEvent, useState } from "react";

import type { ManagedUser } from "./managedUsers";
import type { OrganizationInput } from "./organizations";

type Props = {
  users: ManagedUser[];
  unavailableUserIds: Set<number>;
  onSubmit: (input: OrganizationInput) => Promise<boolean>;
};

export function OrganizationCreateForm({
  users,
  unavailableUserIds,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleUser(id: number) {
    setUserIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (await onSubmit({ name, user_ids: userIds })) {
        setName("");
        setUserIds([]);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      aria-label="Créer une organisation"
      className="organization-form"
      onSubmit={submit}
    >
      <h2>Créer une organisation</h2>
      <label htmlFor="organization-name">Nom</label>
      <input
        id="organization-name"
        maxLength={255}
        onChange={(event) => setName(event.target.value)}
        required
        value={name}
      />
      <fieldset>
        <legend>Utilisateurs</legend>
        <p>Sélectionnez au moins un utilisateur.</p>
        <div className="organization-users">
          {users.map((user) => {
            const unavailable = unavailableUserIds.has(user.id);
            return (
              <label key={user.id}>
                <input
                  checked={userIds.includes(user.id)}
                  disabled={unavailable}
                  onChange={() => toggleUser(user.id)}
                  type="checkbox"
                />
                <span>{user.identifier}</span>
                <small>
                  {user.user_type}
                  {unavailable ? " · déjà affecté" : ""}
                </small>
              </label>
            );
          })}
        </div>
      </fieldset>
      <button disabled={saving || !name.trim() || userIds.length === 0}>
        {saving ? "Création…" : "Créer l’organisation"}
      </button>
    </form>
  );
}
