import { useId, useState } from "react";

import { ResultsDetails } from "./ResultsDetails";
import { ResultsHistory } from "./ResultsHistory";
import { ResultsRadar } from "./ResultsRadar";
import { ResultsViewSelector } from "./ResultsViewSelector";
import type { ResultAxis, ResultComparison } from "./results";
import type { Theme } from "./theme";

export function ResultsViews({
  comparison,
  familyId,
  selected,
  theme,
}: {
  comparison: ResultComparison;
  familyId: number;
  selected: number[];
  theme: Theme;
}) {
  const id = useId();
  const [analysis, setAnalysis] = useState("radar");
  const [restitution, setRestitution] = useState(0);
  const [criterion, setCriterion] = useState<ResultAxis | null>(null);
  function openCriterion(axis: ResultAxis) {
    setCriterion(axis);
    setAnalysis("temporal");
    setRestitution(0);
    document.getElementById(id + "-analysis")?.focus();
  }
  return (
    <div className="results-views">
      <div className="results-view-selectors">
        <label className="results-view-selector results-model results-analysis-selector">
          <span id={id + "-analysis-label"}>Analyse</span>
          <select
            id={id + "-analysis"}
            aria-labelledby={id + "-analysis-label"}
            aria-controls={id + "-panel"}
            value={analysis}
            onChange={(event) => setAnalysis(event.target.value)}
          >
            <option value="radar">Radar</option>
            <option value="temporal">Dans le temps</option>
          </select>
        </label>
        <ResultsViewSelector
          id={id + "-restitution"}
          panelId={id + "-panel"}
          label="Restitution"
          options={["Graphique", "Données détaillées"]}
          selected={restitution}
          onSelect={setRestitution}
        />
      </div>
      {analysis === "temporal" && (
        <label className="results-model results-history-criterion">
          <span id={id + "-criterion-label"}>Critère</span>
          <select
            aria-labelledby={id + "-criterion-label"}
            value={criterion?.question_id ?? ""}
            onChange={(event) =>
              setCriterion(
                comparison.axes.find(
                  (axis) => axis.question_id === Number(event.target.value),
                ) ?? null,
              )
            }
          >
            <option value="">Sélectionner un critère</option>
            {comparison.axes.map((axis) => (
              <option
                key={axis.question_id}
                value={axis.question_id}
                disabled={!axis.lineage_id}
              >
                {axis.index}. {axis.text}
              </option>
            ))}
          </select>
        </label>
      )}
      <div
        role="tabpanel"
        id={id + "-panel"}
        aria-label={`${analysis === "radar" ? "Radar" : "Dans le temps"} ${restitution === 0 ? "Graphique" : "Données détaillées"}`}
        tabIndex={0}
        className="results-tab-panel"
      >
        {analysis === "temporal" ? (
          criterion ? (
            <ResultsHistory
              key={criterion.lineage_id}
              familyId={familyId}
              criterion={criterion}
              teams={comparison.teams}
              selected={selected}
              theme={theme}
              detailed={restitution === 1}
            />
          ) : (
            <p>Sélectionnez un critère pour consulter son évolution.</p>
          )
        ) : restitution === 1 ? (
          <ResultsDetails
            {...comparison}
            selected={selected}
            onCriterion={openCriterion}
          />
        ) : (
          <ResultsRadar
            {...comparison}
            selected={selected}
            theme={theme}
            onCriterion={openCriterion}
          />
        )}
      </div>
    </div>
  );
}
