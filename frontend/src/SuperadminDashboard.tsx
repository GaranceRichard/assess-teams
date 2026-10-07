import { useEffect, useState } from "react";

import type { SessionUser } from "./auth";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  setManagedUserActivation,
  inviteManagedUser,
  listManagedUsers,
  type ManagedUser,
  type InviteUserInput,
  type UserInput,
  updateManagedUser,
} from "./managedUsers";
import { UserDialog } from "./UserDialog";
import {
  canManageTarget,
  creationRoles,
  editableRoles,
} from "./userManagementPermissions";
import "./admin-users.css";

type Props = { actor: SessionUser };

export function SuperadminDashboard({ actor }: Props) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [editing, setEditing] = useState<ManagedUser | "new" | null>(null);
  const [deactivating, setDeactivating] = useState<ManagedUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const allowedCreationRoles = creationRoles(actor);
  const showsOrganizations = actor.is_superuser || actor.role === "Admin";

  useEffect(() => {
    listManagedUsers()
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."));
  }, []);

  async function save(input: UserInput) {
    try {
      const saved =
        editing === "new"
          ? await inviteManagedUser(input as InviteUserInput)
          : await updateManagedUser((editing as ManagedUser).id, input);
      setUsers((current) =>
        editing === "new"
          ? [...current, saved]
          : current.map((user) => (user.id === saved.id ? saved : user)),
      );
      setEditing(null);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "L’opération a été refusée.",
      );
    }
  }

  async function changeActivation(user: ManagedUser, active: boolean) {
    try {
      const saved = await setManagedUserActivation(user.id, active);
      setUsers((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      setDeactivating(null);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Le changement d’activation a été refusé.",
      );
    }
  }

  return (
    <section className="users-page">
      <div className="users-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Utilisateurs</h1>
        </div>
        {allowedCreationRoles.length > 0 && (
          <button
            aria-label="Ajouter un utilisateur"
            className="add-user"
            onClick={() => setEditing("new")}
          >
            +
          </button>
        )}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Identifiant</th>
              <th>Mail</th>
              <th>Type utilisateur</th>
              {showsOrganizations && <th>Organisations</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.identifier}
                  {user.pending && <span className="pending">En attente</span>}
                </td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                {showsOrganizations && (
                  <td>
                    {user.user_type === "Superadmin"
                      ? "—"
                      : user.organizations.length > 0
                        ? user.organizations.join(", ")
                        : "Aucune organisation"}
                  </td>
                )}
                <td>
                  <div className="row-actions users-actions">
                    <span className="status-badge">
                      {user.is_active ? "Actif" : "Désactivé"}
                    </span>
                    {canManageTarget(actor, user) && (
                      <>
                        <button
                          className="secondary"
                          onClick={() => setEditing(user)}
                        >
                          Modifier
                        </button>
                        <button
                          className="danger-outline"
                          onClick={() =>
                            user.is_active
                              ? setDeactivating(user)
                              : void changeActivation(user, true)
                          }
                        >
                          {user.is_active ? "Désactiver" : "Réactiver"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <UserDialog
          user={editing === "new" ? undefined : editing}
          allowedRoles={
            editing === "new"
              ? allowedCreationRoles
              : editableRoles(actor, editing)
          }
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      )}
      {deactivating && (
        <ConfirmDialog
          name={deactivating.identifier}
          onCancel={() => setDeactivating(null)}
          onConfirm={() => changeActivation(deactivating, false)}
        />
      )}
    </section>
  );
}
