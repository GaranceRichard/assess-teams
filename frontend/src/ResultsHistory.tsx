import {
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import { completionDate } from "./evaluationRuns";
import { historyData, historyOptions } from "./resultHistoryConfig";
import { seriesStyle } from "./resultRadarConfig";
import { getCriterionHistory } from "./results";
import type { ResultAxis, ResultHistory, ResultTeam } from "./results";
import type { Theme } from "./theme";
import "./results-history.css";

ChartJS.register(LinearScale, LineElement, PointElement, Tooltip);

type Props = {
  familyId: number;
  criterion: ResultAxis;
  teams: ResultTeam[];
  selected: number[];
  theme: Theme;
  onBack: () => void;
};

export function ResultsHistory({
  familyId,
  criterion,
  teams,
  selected,
  theme,
  onBack,
}: Props) {
  const teamIds = [...selected].sort((a, b) => a - b).join(",");
  const [result, setResult] = useState<{
    key: string;
    data: ResultHistory | null;
    error: boolean;
  }>({
    key: "",
    data: null,
    error: false,
  });
  useEffect(() => {
    let current = true;
    const ids = teamIds ? teamIds.split(",").map(Number) : [];
    getCriterionHistory(familyId, criterion.lineage_id!, ids).then(
      (data) => {
        if (current) setResult({ key: teamIds, data, error: false });
      },
      () => {
        if (current) setResult({ key: teamIds, data: null, error: true });
      },
    );
    return () => {
      current = false;
    };
  }, [familyId, criterion.lineage_id, teamIds]);
  // A response for a previous selection is never displayed while the next request loads.
  const loading = result.key !== teamIds || (!result.data && !result.error);
  const history = loading ? null : result.data;
  return (
    <section
      className="results-chart results-history results-responsive-chart"
      aria-label="Évolution temporelle du critère"
    >
      <div className="results-history-heading">
        <button type="button" onClick={onBack}>
          Retour au radar
        </button>
        <h2>Évolution : {criterion.text}</h2>
      </div>
      <p className="results-note">
        Observations historiques compatibles · Scores de 0 à 10 · Continuité par
        lignée explicite
      </p>
      {loading && <p role="status">Chargement de l’historique…</p>}
      {!loading && result.error && (
        <p role="alert">Impossible de charger l’historique de ce critère.</p>
      )}
      {history && (
        <>
          {history.teams.some((team) => team.points.length > 0) && (
            <div className="results-canvas">
              <Line
                data={historyData(history, teams)}
                options={historyOptions(theme)}
                role="img"
                aria-label={`Évolution de ${criterion.text} : ${history.teams.length} équipe(s), scores de 0 à 10`}
              />
            </div>
          )}
          {history.teams.every((team) => team.points.length === 0) && (
            <p>Aucune observation compatible pour les équipes sélectionnées.</p>
          )}
          <ul className="results-legend" aria-label="Légende des équipes">
            {history.teams.map((team) => {
              const index = teams.findIndex(
                (item) => item.team_id === team.team_id,
              );
              return (
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
              );
            })}
          </ul>
          <div
            className="table-wrap results-table-scroll"
            role="region"
            aria-label="Observations historiques"
            tabIndex={0}
          >
            <table>
              <caption>Observations historiques du critère sélectionné</caption>
              <thead>
                <tr>
                  <th scope="col">Équipe</th>
                  <th scope="col">Date de complétion</th>
                  <th scope="col">Score</th>
                  <th scope="col">Version</th>
                  <th scope="col">Critère observé</th>
                </tr>
              </thead>
              <tbody>
                {history.teams.flatMap((team) =>
                  team.points.map((point) => (
                    <tr key={`${team.team_id}:${point.run_id}`}>
                      <th scope="row">{point.team_name}</th>
                      <td>
                        <time dateTime={point.completed_at}>
                          {completionDate(point.completed_at)}
                        </time>
                      </td>
                      <td>{point.score} / 10</td>
                      <td>v{point.version}</td>
                      <td>{point.criterion_text}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
