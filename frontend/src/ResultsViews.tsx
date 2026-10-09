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
  const [analysis, setAnalysis] = useState(0);
  const [restitution, setRestitution] = useState(0);
  const [criterion, setCriterion] = useState<ResultAxis | null>(null);
  function openCriterion(axis: ResultAxis) {
    setCriterion(axis);
    setAnalysis(1);
    setRestitution(0);
    document.getElementById(id + "-analysis-tab-1")?.focus();
  }
  return (
    <div className="results-views">
      <div className="results-view-selectors">
        <ResultsViewSelector
          id={id + "-analysis"}
          panelId={id + "-panel"}
          label="Analyse"
          options={["Radar", "Dans le temps"]}
          selected={analysis}
          onSelect={setAnalysis}
        />
        <ResultsViewSelector
          id={id + "-restitution"}
          panelId={id + "-panel"}
          label="Restitution"
          options={["Graphique", "Données détaillées"]}
          selected={restitution}
          onSelect={setRestitution}
        />
      </div>
      {analysis === 1 && (
        <label className="results-model results-history-criterion">
          Critère
          <select
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
        aria-labelledby={`${id}-analysis-tab-${analysis} ${id}-restitution-tab-${restitution}`}
        tabIndex={0}
        className="results-tab-panel"
      >
        {analysis === 1 ? (
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
