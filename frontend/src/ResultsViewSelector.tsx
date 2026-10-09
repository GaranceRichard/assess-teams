export function ResultsViewSelector({
  id,
  panelId,
  label,
  options,
  selected,
  onSelect,
}: {
  id: string;
  panelId: string;
  label: string;
  options: [string, string];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="results-view-selector">
      <span id={id + "-label"}>{label}</span>
      <div
        role="tablist"
        aria-labelledby={id + "-label"}
        className="results-tabs"
      >
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            role="tab"
            className="results-tab"
            id={id + "-tab-" + index}
            aria-selected={selected === index}
            aria-controls={panelId}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => {
              const next = {
                ArrowRight: 1 - index,
                ArrowLeft: 1 - index,
                Home: 0,
                End: 1,
              }[event.key];
              if (next === undefined) return;
              event.preventDefault();
              onSelect(next);
              document.getElementById(id + "-tab-" + next)?.focus();
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
