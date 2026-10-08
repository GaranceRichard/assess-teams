import { completionDate } from "./evaluationRuns";
import type { ResultAxis, ResultComparison } from "./results";

export function ResultsDetails({
  axes,
  teams,
  selected,
  onCriterion,
}: ResultComparison & {
  selected: number[];
  onCriterion: (axis: ResultAxis) => void;
}) {
  const visible = teams.filter((team) => selected.includes(team.team_id));
  return (
    <section className="results-details" aria-label="Scores détaillés">
      {visible.length === 0 && (
        <p>Sélectionnez une ou plusieurs équipes pour les comparer.</p>
      )}
      <div
        className="results-table-scroll"
        role="region"
        aria-label="Tableau des scores"
        tabIndex={0}
      >
        <table>
          <caption>Critères et scores des équipes sélectionnées</caption>
          <thead>
            <tr>
              <th scope="col">Axe / critère</th>
              {visible.map((team) => (
                <th scope="col" key={team.team_id}>
                  {team.team_name}
                  <small>
                    Complétée le{" "}
                    <time dateTime={team.completed_at}>
                      {completionDate(team.completed_at)}
                    </time>
                  </small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axes.map((axis, index) => (
              <tr key={axis.question_id}>
                <th scope="row">
                  <button
                    type="button"
                    className="result-criterion"
                    disabled={!axis.lineage_id}
                    onClick={() => onCriterion(axis)}
                  >
                    {index + 1}. {axis.text}
                  </button>
                </th>
                {visible.map((team) => (
                  <td key={team.team_id}>{team.scores[index]} / 10</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
