import { useEffect, useState } from "react";

import { listManagedUsers, type ManagedUser } from "./managedUsers";
import { OrganizationCreateForm } from "./OrganizationCreateForm";
import { OrganizationDeleteDialog } from "./OrganizationDeleteDialog";
import { OrganizationList } from "./OrganizationList";
import { OrganizationMembersDialog } from "./OrganizationMembersDialog";
import { unavailableSingleOrganizationUserIds } from "./organizationMemberships";
import { OrganizationRenameDialog } from "./OrganizationRenameDialog";
import {
  createOrganization,
  deleteOrganization,
  listOrganizations,
  renameOrganization,
  type Organization,
  type OrganizationInput,
  updateOrganizationMembers,
} from "./organizations";
import "./organizations.css";

type Props = { isSuperadmin?: boolean };

export function OrganizationPage({ isSuperadmin = false }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
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

  async function create(input: OrganizationInput): Promise<boolean> {
    try {
      const organization = await createOrganization(input);
      setOrganizations((current) => [...current, organization]);
      setError(null);
      return true;
    } catch {
      setError("La création de l’organisation a été refusée.");
      return false;
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
      <OrganizationCreateForm
        onSubmit={create}
        unavailableUserIds={unavailableSingleOrganizationUserIds(organizations)}
        users={users}
      />
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
          unavailableUserIds={unavailableSingleOrganizationUserIds(
            organizations,
            editingMembers.id,
          )}
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
