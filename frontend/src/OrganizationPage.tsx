import { type FormEvent, useEffect, useState } from "react";

import { listManagedUsers, type ManagedUser } from "./managedUsers";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";
import { OrganizationList } from "./OrganizationList";
import { OrganizationMembersDialog } from "./OrganizationMembersDialog";
import { OrganizationRenameDialog } from "./OrganizationRenameDialog";
import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  renameOrganization,
  type Organization,
  updateOrganizationMembers,
} from "./organizations";
import "./organizations.css";

type Props = { isSuperadmin?: boolean };

export function OrganizationPage({ isSuperadmin = false }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingMembers, setEditingMembers] = useState<Organization | null>(
    null,
  );
  const [renaming, setRenaming] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listOrganizations(), listManagedUsers()])
      .then(([loadedOrganizations, loadedUsers]) => {
        setOrganizations(loadedOrganizations);
        setUsers(loadedUsers);
      })
      .catch(() => setError("Impossible de charger les organisations."));
  }, []);

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
      const organization = await createOrganization({
        name,
        user_ids: userIds,
      });
      setOrganizations((current) => [...current, organization]);
      setName("");
      setUserIds([]);
      setError(null);
    } catch {
      setError("La création de l’organisation a été refusée.");
    } finally {
      setSaving(false);
    }
  }

  async function saveMembers(selectedUserIds: number[]) {
    if (!editingMembers) return;
    try {
      const updated = await updateOrganizationMembers(
        editingMembers.id,
        selectedUserIds,
      );
      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === updated.id ? updated : organization,
        ),
      );
      setEditingMembers(null);
      setError(null);
    } catch {
      setError("La modification des membres a été refusée.");
    }
  }

  async function saveName(newName: string) {
    if (!renaming) return;
    try {
      const updated = await renameOrganization(renaming.id, newName);
      setOrganizations((current) =>
        current.map((organization) =>
          organization.id === updated.id ? updated : organization,
        ),
      );
      setRenaming(null);
      setError(null);
    } catch {
      setError("Le renommage de l’organisation a été refusé.");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteOrganization(deleting.id);
      setOrganizations((current) =>
        current.filter((organization) => organization.id !== deleting.id),
      );
      setDeleting(null);
      setError(null);
    } catch {
      setError("La suppression de l’organisation a été refusée.");
    }
  }

  return (
    <section className="organizations-page">
      <div>
        <p className="eyebrow">Administration</p>
        <h1>Organisations</h1>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <form className="organization-form" onSubmit={submit}>
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
            {users.map((user) => (
              <label key={user.id}>
                <input
                  checked={userIds.includes(user.id)}
                  onChange={() => toggleUser(user.id)}
                  type="checkbox"
                />
                <span>{user.identifier}</span>
                <small>{user.user_type}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <button disabled={saving || !name.trim() || userIds.length === 0}>
          {saving ? "Création…" : "Créer l’organisation"}
        </button>
      </form>
      <OrganizationList
        isSuperadmin={isSuperadmin}
        onDelete={setDeleting}
        onEditMembers={setEditingMembers}
        onRename={setRenaming}
        organizations={organizations}
      />
      {editingMembers && (
        <OrganizationMembersDialog
          onCancel={() => setEditingMembers(null)}
          onSubmit={saveMembers}
          organization={editingMembers}
          users={users}
        />
      )}
      {renaming && (
        <OrganizationRenameDialog
          onCancel={() => setRenaming(null)}
          onSubmit={saveName}
          organization={renaming}
        />
      )}
      {deleting && (
        <OrganizationDeleteDialog
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
          organization={deleting}
        />
      )}
    </section>
  );
}
