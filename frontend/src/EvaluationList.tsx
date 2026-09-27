import type { Evaluation } from "./evaluations";

type Props = {
  evaluations: Evaluation[];
  selectedId: number | null;
  onDelete: (evaluation: Evaluation) => void;
  onEdit: (evaluation: Evaluation) => void;
  onSelect: (evaluation: Evaluation) => void;
};

export function EvaluationList({
  evaluations,
  selectedId,
  onDelete,
  onEdit,
  onSelect,
}: Props) {
  if (evaluations.length === 0) {
    return <p className="evaluation-empty">Aucune évaluation.</p>;
  }
  return (
    <ul className="evaluation-list" aria-label="Évaluations">
      {evaluations.map((evaluation) => (
        <li
          className={selectedId === evaluation.id ? "selected" : ""}
          key={evaluation.id}
        >
          <button
            className="evaluation-select"
            onClick={() => onSelect(evaluation)}
          >
            <span>{evaluation.index}</span>
            <strong>{evaluation.name}</strong>
          </button>
          <div className="evaluation-actions">
            <button className="secondary" onClick={() => onEdit(evaluation)}>
              Modifier
            </button>
            <button
              className="evaluation-danger"
              onClick={() => onDelete(evaluation)}
            >
              Supprimer
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
