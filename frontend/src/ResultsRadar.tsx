import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";

import { radarData, radarOptions, seriesStyle } from "./resultRadarConfig";
import type { ResultAxis, ResultComparison } from "./results";
import type { Theme } from "./theme";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type Props = ResultComparison & {
  selected: number[];
  theme: Theme;
  onCriterion?: (axis: ResultAxis) => void;
};

export function ResultsRadar({
  axes,
  teams,
  selected,
  theme,
  onCriterion,
}: Props) {
  const visible = teams.filter((team) => selected.includes(team.team_id));
  return (
    <section
      className="results-chart results-radar results-responsive-chart"
      aria-label="Comparaison des équipes"
    >
      <div className="results-canvas">
        <Radar
          data={radarData(axes, teams, selected)}
          options={radarOptions(theme, (index) => {
            const axis = axes[index];
            if (axis?.lineage_id) onCriterion?.(axis);
          })}
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
              </li>
            ),
        )}
      </ul>
    </section>
  );
}
