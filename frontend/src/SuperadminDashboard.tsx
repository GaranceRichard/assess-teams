import { useEffect, useState } from "react";

import { ConfirmDialog } from "./ConfirmDialog";
import {
  deleteManagedUser,
  inviteManagedUser,
  listManagedUsers,
  type ManagedUser,
  type UserInput,
  updateManagedUser,
} from "./managedUsers";
import { UserDialog } from "./UserDialog";
import "./admin-users.css";

export function SuperadminDashboard() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [editing, setEditing] = useState<ManagedUser | "new" | null>(null);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listManagedUsers()
      .then(setUsers)
      .catch(() => setError("Impossible de charger les utilisateurs."));
  }, []);

  async function save(input: UserInput) {
    try {
      const saved =
        editing === "new"
          ? await inviteManagedUser(input as Required<UserInput>)
          : await updateManagedUser((editing as ManagedUser).id, input);
      setUsers((current) =>
        editing === "new"
          ? [...current, saved]
          : current.map((user) => (user.id === saved.id ? saved : user)),
      );
      setEditing(null);
      setError(null);
    } catch {
      setError("L’opération a été refusée. Vérifiez les informations saisies.");
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await deleteManagedUser(deleting.id);
      setUsers((current) => current.filter((user) => user.id !== deleting.id));
      setDeleting(null);
      setError(null);
    } catch {
      setError("La suppression a été refusée.");
    }
  }

  return (
    <section className="users-page">
      <div className="users-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Utilisateurs</h1>
        </div>
        <button
          aria-label="Ajouter un utilisateur"
          className="add-user"
          onClick={() => setEditing("new")}
        >
          +
        </button>
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
              <th>Nom</th>
              <th>Mail</th>
              <th>Type utilisateur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.name || "—"}
                  {user.pending && <span className="pending">En attente</span>}
                </td>
                <td>{user.email}</td>
                <td>{user.user_type}</td>
                <td className="row-actions">
                  <button
                    className="secondary"
                    onClick={() => setEditing(user)}
                  >
                    Modifier
                  </button>
                  <button
                    className="danger-outline"
                    onClick={() => setDeleting(user)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <UserDialog
          user={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      )}
      {deleting && (
        <ConfirmDialog
          name={deleting.name || deleting.email}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}
