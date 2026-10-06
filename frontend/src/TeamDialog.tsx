import { type FormEvent, useState } from "react";

import type { OrganizationMember } from "./organizations";
import type { Team, TeamInput } from "./teams";

type Props = {
  coaches: OrganizationMember[];
  team?: Team;
  onCancel: () => void;
  onSubmit: (input: TeamInput) => Promise<void>;
};

export function TeamDialog({ coaches, team, onCancel, onSubmit }: Props) {
  const [name, setName] = useState(team?.name ?? "");
  const [coachIds, setCoachIds] = useState(
    team?.coaches.map((coach) => coach.id) ?? [],
  );
  const [saving, setSaving] = useState(false);

  function toggleCoach(id: number) {
    setCoachIds((current) =>
      current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, coach_ids: coachIds });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="team-dialog-backdrop">
      <section
        aria-labelledby="team-dialog-title"
        aria-modal="true"
        className="team-dialog"
        role="dialog"
      >
        <h2 id="team-dialog-title">
          {team ? "Modifier l’équipe" : "Créer une équipe"}
        </h2>
        <form onSubmit={submit}>
          <label htmlFor="team-name">Nom de l’équipe</label>
          <input
            autoFocus
            id="team-name"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <fieldset>
            <legend>Coachs</legend>
            {coaches.length === 0 ? (
              <p>Aucun Coach actif dans cette organisation.</p>
            ) : (
              <div className="team-coaches">
                {coaches.map((coach) => (
                  <label key={coach.id}>
                    <input
                      checked={coachIds.includes(coach.id)}
                      disabled={
                        coach.is_active === false &&
                        !coachIds.includes(coach.id)
                      }
                      onChange={() => toggleCoach(coach.id)}
                      type="checkbox"
                    />
                    {coach.identifier}
                    {coach.is_active === false ? " · Désactivé" : ""}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <div className="team-dialog-actions">
            <button className="secondary" onClick={onCancel} type="button">
              Annuler
            </button>
            <button disabled={saving || !name.trim()} type="submit">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
