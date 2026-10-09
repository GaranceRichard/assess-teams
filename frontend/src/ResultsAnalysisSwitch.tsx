import "./results-analysis-switch.css";

export function ResultsAnalysisSwitch({
  id,
  panelId,
  temporal,
  onChange,
}: {
  id: string;
  panelId: string;
  temporal: boolean;
  onChange: (temporal: boolean) => void;
}) {
  return (
    <div className="results-view-selector results-analysis-selector">
      <span id={id + "-label"}>Analyse</span>
      <div className="results-analysis-control" data-temporal={temporal}>
        <span id={id + "-radar"} className="results-analysis-radar">
          Radar
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-labelledby={id + "-label"}
          aria-describedby={id + (temporal ? "-temporal" : "-radar")}
          aria-checked={temporal}
          aria-controls={panelId}
          className="results-analysis-switch"
          onClick={() => onChange(!temporal)}
        >
          <span aria-hidden="true" className="results-analysis-thumb" />
        </button>
        <span id={id + "-temporal"} className="results-analysis-temporal">
          Dans le temps
        </span>
      </div>
    </div>
  );
}
