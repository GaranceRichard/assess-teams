import type { Team } from "./teams";

type Props = {
  teams: Team[];
  onDelete?: (team: Team) => void;
  onEdit?: (team: Team) => void;
};

export function TeamList({ teams, onDelete, onEdit }: Props) {
  if (teams.length === 0) {
    return (
      <p className="team-empty">
        Aucune équipe active pour cette organisation.
      </p>
    );
  }

  return (
    <ul className="team-list">
      {teams.map((team) => (
        <li key={team.id}>
          <div>
            <strong>{team.name}</strong>
            <span>
              {team.coaches.length > 0
                ? team.coaches
                    .map(
                      (coach) =>
                        `${coach.identifier}${coach.is_active === false ? " · Désactivé" : ""}`,
                    )
                    .join(", ")
                : "Aucun Coach"}
            </span>
          </div>
          {(onEdit || onDelete) && (
            <div className="team-actions">
              {onEdit && (
                <button className="secondary" onClick={() => onEdit(team)}>
                  Modifier
                </button>
              )}
              {onDelete && (
                <button className="team-danger" onClick={() => onDelete(team)}>
                  Supprimer
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
