import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

import { completionDate } from "./evaluationRuns";
import { radarData, radarOptions, seriesStyle } from "./resultRadarConfig";
import type { ResultComparison } from "./results";
import type { Theme } from "./theme";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type Props = ResultComparison & { selected: number[]; theme: Theme };

export function ResultsRadar({ axes, teams, selected, theme }: Props) {
  const visible = teams.filter((team) => selected.includes(team.team_id));
  return (
    <section className="results-chart" aria-label="Comparaison des équipes">
      <h2>Dernières passations complétées</h2>
      <p className="results-note">
        Même version · Scores de 0 à 10 · Sans agrégation
      </p>
      <div className="results-canvas">
        <Radar
          data={radarData(axes, teams, selected)}
          options={radarOptions(theme)}
          role="img"
          aria-label={`Radar des résultats : ${visible.length} équipe(s), ${axes.length} axe(s), échelle 0 à 10`}
        />
      </div>
      {visible.length === 0 && (
        <p>Sélectionnez une ou plusieurs équipes pour les comparer.</p>
      )}
      <ul className="results-legend" aria-label="Légende des équipes">
        {teams.map(
          (team, index) =>
            selected.includes(team.team_id) && (
              <li key={team.team_id}>
                <svg width="36" height="16" aria-hidden="true">
                  <line
                    x1="0"
                    y1="8"
                    x2="36"
                    y2="8"
                    stroke={seriesStyle(index).color}
                    strokeWidth="3"
                    strokeDasharray={seriesStyle(index).dash.join(" ")}
                  />
                </svg>
                <strong>
                  {index + 1}. {team.team_name}
                </strong>
                <small>
                  Complétée le{" "}
                  <time dateTime={team.completed_at}>
                    {completionDate(team.completed_at)}
                  </time>
                </small>
              </li>
            ),
        )}
      </ul>
      <div className="table-wrap">
        <table>
          <caption>Critères et scores des équipes sélectionnées</caption>
          <thead>
            <tr>
              <th scope="col">Axe / critère</th>
              {visible.map((team) => (
                <th scope="col" key={team.team_id}>
                  {team.team_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axes.map((axis, index) => (
              <tr key={axis.question_id}>
                <th scope="row">
                  {index + 1}. {axis.text}
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
