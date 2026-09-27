import type { NamedEntity } from "./evaluations";

type Props = {
  kind: "évaluation" | "question";
  value: NamedEntity;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function EvaluationDeleteDialog({
  kind,
  value,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="evaluation-dialog-backdrop">
      <section
        aria-labelledby="evaluation-delete-title"
        aria-modal="true"
        className="evaluation-dialog"
        role="dialog"
      >
        <h2 id="evaluation-delete-title">Supprimer cette {kind} ?</h2>
        <p>
          « {value.name} » sera définitivement supprimée
          {kind === "évaluation" ? " avec toutes ses questions" : ""}.
        </p>
        <div className="evaluation-dialog-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button
            className="evaluation-danger"
            onClick={() => void onConfirm()}
          >
            Confirmer la suppression
          </button>
        </div>
      </section>
    </div>
  );
}
