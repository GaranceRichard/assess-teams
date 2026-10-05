import type { Evaluation } from "./evaluations";

type Props = {
  evaluations: Evaluation[];
  selectedId: number | null;
  onArchive: (evaluation: Evaluation) => void;
  onDelete: (evaluation: Evaluation) => void;
  onEdit: (evaluation: Evaluation) => void;
  onSelect: (evaluation: Evaluation) => void;
  onValidate: (evaluation: Evaluation) => void;
};

const statusLabels = {
  DRAFT: "Brouillon",
  VALIDATED: "Validée",
  ARCHIVED: "Archivée",
};

export function EvaluationList({
  evaluations,
  selectedId,
  onArchive,
  onDelete,
  onEdit,
  onSelect,
  onValidate,
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
            <strong>{evaluation.name}</strong>
            <span
              className={`evaluation-status ${evaluation.status.toLowerCase()}`}
            >
              {statusLabels[evaluation.status]}
            </span>
          </button>
          <div className="evaluation-actions">
            {evaluation.status === "DRAFT" && (
              <>
                <button onClick={() => onValidate(evaluation)}>Valider</button>
                <button
                  className="secondary"
                  onClick={() => onEdit(evaluation)}
                >
                  Modifier
                </button>
                <button
                  className="evaluation-danger"
                  onClick={() => onDelete(evaluation)}
                >
                  Supprimer
                </button>
              </>
            )}
            {evaluation.status === "VALIDATED" && (
              <button
                className="secondary"
                onClick={() => onArchive(evaluation)}
              >
                Archiver
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
