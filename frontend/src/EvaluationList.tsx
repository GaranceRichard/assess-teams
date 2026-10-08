import { versionLabel } from "./evaluationVersionLabel";
import type { Evaluation } from "./evaluations";

type Props = {
  evaluations: Evaluation[];
  selectedId: number | null;
  creatingVersion?: number | null;
  onNewVersion?: (evaluation: Evaluation) => Promise<void>;
  onArchive?: (evaluation: Evaluation) => void;
  onDelete?: (evaluation: Evaluation) => void;
  onEdit?: (evaluation: Evaluation) => void;
  onSelect: (evaluation: Evaluation) => void;
  onValidate?: (evaluation: Evaluation) => void;
};

const statusLabels = {
  DRAFT: "Brouillon",
  VALIDATED: "Validée",
  ARCHIVED: "Archivée",
};

export function EvaluationList({
  evaluations,
  selectedId,
  creatingVersion = null,
  onNewVersion,
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
            <span>
              {versionLabel(evaluation.family_name, evaluation.version)}
            </span>
            <span
              className={`evaluation-status ${evaluation.status.toLowerCase()}`}
            >
              {statusLabels[evaluation.status]}
            </span>
            {evaluation.status === "VALIDATED" && (
              <small>Version active pour la planification</small>
            )}
          </button>
          {(onNewVersion || onValidate || onEdit || onDelete || onArchive) && (
            <div className="evaluation-actions">
              {onNewVersion && (
                <button
                  className="secondary"
                  disabled={creatingVersion !== null}
                  onClick={() => void onNewVersion(evaluation)}
                >
                  {creatingVersion === evaluation.id
                    ? "Création…"
                    : "Créer une nouvelle version"}
                </button>
              )}
              {evaluation.status === "DRAFT" && (
                <>
                  {onValidate && (
                    <button onClick={() => onValidate(evaluation)}>
                      Valider
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="secondary"
                      onClick={() => onEdit(evaluation)}
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="evaluation-danger"
                      onClick={() => onDelete(evaluation)}
                    >
                      Supprimer
                    </button>
                  )}
                </>
              )}
              {evaluation.status === "VALIDATED" && onArchive && (
                <button
                  className="secondary"
                  onClick={() => onArchive(evaluation)}
                >
                  Archiver
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
