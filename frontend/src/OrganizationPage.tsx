import { type FormEvent, useEffect, useState } from "react";

import { listManagedUsers, type ManagedUser } from "./managedUsers";
import {
  createOrganization,
  listOrganizations,
  type Organization,
} from "./organizations";
import "./organizations.css";

export function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
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
      <div className="organization-list">
        <h2>Organisations existantes</h2>
        {organizations.length === 0 ? (
          <p>Aucune organisation.</p>
        ) : (
          <ul>
            {organizations.map((organization) => (
              <li key={organization.id}>
                <strong>{organization.name}</strong>
                <span>
                  {organization.users.map((user) => user.identifier).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
