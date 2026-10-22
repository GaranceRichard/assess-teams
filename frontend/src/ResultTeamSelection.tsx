import { completionDate } from "./evaluationRuns";
import type { ResultTeam } from "./results";

export function ResultTeamSelection({
  teams,
  selected,
  onToggle,
}: {
  teams: ResultTeam[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <fieldset className="results-teams">
      <legend>Équipes disponibles</legend>
      {teams.map((team) => (
        <label key={team.team_id}>
          <input
            type="checkbox"
            checked={selected.includes(team.team_id)}
            onChange={() => onToggle(team.team_id)}
          />
          <span>
            <strong>{team.team_name}</strong>
            <small>
              Complétée le{" "}
              <time dateTime={team.completed_at}>
                {completionDate(team.completed_at)}
              </time>
            </small>
            <small>Passation n°{team.run_id}</small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
