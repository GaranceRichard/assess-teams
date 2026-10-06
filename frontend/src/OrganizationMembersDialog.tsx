import { useState } from "react";

import type { ManagedUser } from "./managedUsers";
import type { Organization } from "./organizations";

type Props = {
  organization: Organization;
  users: ManagedUser[];
  unavailableUserIds: Set<number>;
  canManageAdmins: boolean;
  onCancel: () => void;
  onSubmit: (userIds: number[]) => Promise<void>;
};

export function OrganizationMembersDialog({
  organization,
  users,
  unavailableUserIds,
  canManageAdmins,
  onCancel,
  onSubmit,
}: Props) {
  const [userIds, setUserIds] = useState(
    organization.users.map((user) => user.id),
  );
  const [saving, setSaving] = useState(false);

  function toggleUser(id: number) {
    setUserIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  }

  async function save() {
    setSaving(true);
    try {
      await onSubmit(userIds);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="organization-dialog-backdrop">
      <div
        aria-labelledby="organization-members-title"
        className="organization-dialog"
        role="dialog"
      >
        <h2 id="organization-members-title">Membres de {organization.name}</h2>
        <p>Conservez au moins un Admin actif.</p>
        <div className="organization-users">
          {users
            .filter(
              (user) =>
                user.is_active ||
                organization.users.some((member) => member.id === user.id),
            )
            .map((user) => {
              const selected = userIds.includes(user.id);
              const unavailable = unavailableUserIds.has(user.id) && !selected;
              const protectedAdmin =
                user.user_type === "Admin" && !canManageAdmins;
              return (
                <label key={user.id}>
                  <input
                    checked={selected}
                    disabled={
                      unavailable ||
                      protectedAdmin ||
                      (!user.is_active && !selected)
                    }
                    onChange={() => toggleUser(user.id)}
                    type="checkbox"
                  />
                  <span>{user.identifier}</span>
                  <small>
                    {user.user_type}
                    {!user.is_active ? " · Désactivé" : ""}
                    {unavailable ? " · déjà affecté" : ""}
                    {protectedAdmin ? " · protégé" : ""}
                  </small>
                </label>
              );
            })}
        </div>
        <div className="organization-dialog-actions">
          <button className="secondary" onClick={onCancel} type="button">
            Annuler
          </button>
          <button
            disabled={saving || userIds.length === 0}
            onClick={save}
            type="button"
          >
            {saving ? "Enregistrement…" : "Enregistrer les membres"}
          </button>
        </div>
      </div>
    </div>
  );
}
