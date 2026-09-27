import type { Team } from "./teams";

type Props = {
  teams: Team[];
  onDelete: (team: Team) => void;
  onEdit: (team: Team) => void;
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
                ? team.coaches.map((coach) => coach.identifier).join(", ")
                : "Aucun Coach"}
            </span>
          </div>
          <div className="team-actions">
            <button className="secondary" onClick={() => onEdit(team)}>
              Modifier
            </button>
            <button className="team-danger" onClick={() => onDelete(team)}>
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
