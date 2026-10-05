import { useEffect, useState } from "react";

import { completionDate } from "./evaluationRuns";
import { ResultsRadar } from "./ResultsRadar";
import { getResultComparison, listResultVersions } from "./results";
import type { ResultComparison, ResultVersion } from "./results";
import type { Theme } from "./theme";
import "./results.css";

export function ResultsPage({ theme }: { theme: Theme }) {
  const [versions, setVersions] = useState<ResultVersion[]>([]);
  const [versionId, setVersionId] = useState("");
  const [comparison, setComparison] = useState<ResultComparison | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    listResultVersions().then(
      (data) => {
        if (current) {
          setVersions(data);
          setLoadingVersions(false);
        }
      },
      () => {
        if (current) {
          setError("Impossible de charger les modèles avec résultats.");
          setLoadingVersions(false);
        }
      },
    );
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (!versionId) return;
    let current = true;
    getResultComparison(Number(versionId)).then(
      (data) => {
        if (current) {
          setComparison(data);
          setLoadingComparison(false);
        }
      },
      () => {
        if (current) {
          setError("Impossible de charger les résultats de cette version.");
          setLoadingComparison(false);
        }
      },
    );
    return () => {
      current = false;
    };
  }, [versionId]);

  function selectVersion(value: string) {
    setVersionId(value);
    setComparison(null);
    setSelected([]);
    setError("");
    setLoadingComparison(Boolean(value));
  }

  function toggleTeam(teamId: number) {
    setSelected((previous) =>
      previous.includes(teamId)
        ? previous.filter((id) => id !== teamId)
        : [...previous, teamId],
    );
  }

  const usable =
    comparison && comparison.axes.length > 0 && comparison.teams.length > 0;
  return (
    <section className="results-page">
      <h1>Résultats</h1>
      <label className="results-model">
        Modèle / version
        <select
          value={versionId}
          onChange={(event) => selectVersion(event.target.value)}
          disabled={loadingVersions || versions.length === 0}
        >
          <option value="">Sélectionner un modèle / version</option>
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.family_name} — v{version.version} ·{" "}
              {version.organization_name}
            </option>
          ))}
        </select>
      </label>
      {(loadingVersions || loadingComparison) && (
        <p role="status">Chargement des résultats…</p>
      )}
      {error && <p role="alert">{error}</p>}
      {!loadingVersions && !error && versions.length === 0 && (
        <p>Aucune passation complétée accessible.</p>
      )}
      {!loadingVersions && !versionId && versions.length > 0 && (
        <p>Sélectionnez un modèle et sa version pour comparer les équipes.</p>
      )}
      {comparison && !usable && (
        <p>Aucun résultat exploitable pour cette version.</p>
      )}
      {usable && (
        <div className="results-layout">
          <fieldset className="results-teams">
            <legend>Équipes disponibles</legend>
            {comparison.teams.map((team) => (
              <label key={team.team_id}>
                <input
                  type="checkbox"
                  checked={selected.includes(team.team_id)}
                  onChange={() => toggleTeam(team.team_id)}
                />
                <span>
                  {team.team_name}
                  <small>
                    Complétée le{" "}
                    <time dateTime={team.completed_at}>
                      {completionDate(team.completed_at)}
                    </time>
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <ResultsRadar {...comparison} selected={selected} theme={theme} />
        </div>
      )}
    </section>
  );
}
