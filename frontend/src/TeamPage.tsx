import { CollectionFrame } from "./CollectionFrame";
import { usePagedCollection } from "./usePagedCollection";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { SessionUser } from "./auth";
import { listOrganizations, type Organization } from "./organizations";
import { TeamDeleteDialog } from "./TeamDeleteDialog";
import { TeamDialog } from "./TeamDialog";
import { TeamList } from "./TeamList";
import {
  createTeam,
  deleteTeam,
  listTeams,
  type Team,
  type TeamInput,
  updateTeam,
} from "./teams";
import "./teams.css";

type Props = { actor: SessionUser };

export function TeamPage({ actor }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const loadTeams = useCallback(
    (page: number) => listTeams(organizationId!, false, page),
    [organizationId],
  );
  const collection = usePagedCollection<Team>(
    loadTeams,
    String(organizationId),
    organizationId !== null,
  );
  const { items: teams, setItems: setTeams } = collection;
  const [editing, setEditing] = useState<Team | "new" | null>(null);
  const [deleting, setDeleting] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accessibleOrganizations = useMemo(
    () =>
      actor.is_superuser
        ? organizations
        : organizations.filter((organization) =>
            organization.users.some(
              (member) => member.identifier === actor.username,
            ),
          ),
    [actor.is_superuser, actor.username, organizations],
  );
  const organization = accessibleOrganizations.find(
    (candidate) => candidate.id === organizationId,
  );
  const coaches =
    organization?.users.filter(
      (member) =>
        member.user_type === "Coach" &&
        (member.is_active !== false ||
          (editing &&
            editing !== "new" &&
            editing.coaches.some((coach) => coach.id === member.id))),
    ) ?? [];

  useEffect(() => {
    listOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Impossible de charger les organisations."));
  }, []);

  async function save(input: TeamInput) {
    if (!organizationId) return;
    try {
      const saved =
        editing === "new"
          ? await createTeam(organizationId, input)
          : await updateTeam((editing as Team).id, input);
      setTeams((current) =>
        editing === "new"
          ? [...current, saved]
          : current.map((team) => (team.id === saved.id ? saved : team)),
      );
      setEditing(null);
      setError(null);
    } catch {
      setError("L’enregistrement de l’équipe a été refusé.");
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await deleteTeam(deleting.id);
      setTeams((current) => current.filter((team) => team.id !== deleting.id));
      setDeleting(null);
      setError(null);
    } catch {
      setError("La suppression de l’équipe a été refusée.");
    }
  }

  return (
    <section className="teams-page product-page">
      <div className="teams-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Équipes</h1>
        </div>
        {organization && (
          <button onClick={() => setEditing("new")}>Créer une équipe</button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <label className="organization-selector" htmlFor="team-organization">
        Organisation
        <select
          id="team-organization"
          onChange={(event) => {
            setTeams([]);
            setOrganizationId(
              event.target.value ? Number(event.target.value) : null,
            );
          }}
          value={organizationId ?? ""}
        >
          <option value="">Choisir une organisation</option>
          {accessibleOrganizations.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </label>
      {organization ? (
        <CollectionFrame {...collection} onChange={collection.changePage}>
          {collection.failed && (
            <p role="alert">Impossible de charger les équipes.</p>
          )}
          <TeamList teams={teams} onDelete={setDeleting} onEdit={setEditing} />
        </CollectionFrame>
      ) : (
        <p className="team-empty">Sélectionnez une organisation.</p>
      )}
      {editing && organization && (
        <TeamDialog
          coaches={coaches}
          onCancel={() => setEditing(null)}
          onSubmit={save}
          team={editing === "new" ? undefined : editing}
        />
      )}
      {deleting && (
        <TeamDeleteDialog
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
          team={deleting}
        />
      )}
    </section>
  );
}
