import type { MouseEvent } from "react";

type Props = {
  name: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmDialog({ name, onCancel, onConfirm }: Props) {
  function closeBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel();
  }

  return (
    <div className="dialog-backdrop" onMouseDown={closeBackdrop}>
      <section
        aria-labelledby="confirm-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <h2 id="confirm-title">Supprimer l’utilisateur ?</h2>
        <p>Le compte de {name} sera définitivement supprimé.</p>
        <div className="dialog-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="danger" onClick={() => void onConfirm()}>
            Valider la suppression
          </button>
        </div>
      </section>
    </div>
  );
}
