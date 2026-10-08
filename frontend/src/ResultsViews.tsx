import { useId, useState } from "react";

import { ResultsDetails } from "./ResultsDetails";
import { ResultsHistory } from "./ResultsHistory";
import { ResultsRadar } from "./ResultsRadar";
import type { ResultAxis, ResultComparison } from "./results";
import type { Theme } from "./theme";

const tabs = ["Radar", "Résultats détaillés"];

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
  const [tab, setTab] = useState(0);
  const [criterion, setCriterion] = useState<ResultAxis | null>(null);
  function backToRadar() {
    setCriterion(null);
    setTab(0);
  }
  return (
    <div className="results-views">
      <div
        role="tablist"
        aria-label="Vues des résultats"
        className="results-tabs"
      >
        {tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            className="results-tab"
            id={id + "-tab-" + index}
            aria-selected={tab === index}
            aria-controls={id + "-panel"}
            tabIndex={tab === index ? 0 : -1}
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              const next = {
                ArrowRight: 1 - index,
                ArrowLeft: 1 - index,
                Home: 0,
                End: 1,
              }[event.key];
              if (next === undefined) return;
              event.preventDefault();
              setTab(next);
              document.getElementById(id + "-tab-" + next)?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={id + "-panel"}
        aria-labelledby={id + "-tab-" + tab}
        tabIndex={0}
        className="results-tab-panel"
      >
        {tab === 1 ? (
          <ResultsDetails
            {...comparison}
            selected={selected}
            onCriterion={(axis) => {
              setCriterion(axis);
              setTab(0);
            }}
          />
        ) : criterion ? (
          <ResultsHistory
            key={criterion.lineage_id}
            familyId={familyId}
            criterion={criterion}
            teams={comparison.teams}
            selected={selected}
            theme={theme}
            onBack={backToRadar}
          />
        ) : (
          <ResultsRadar
            {...comparison}
            selected={selected}
            theme={theme}
            onCriterion={setCriterion}
          />
        )}
      </div>
    </div>
  );
}
