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
        <h2 id="confirm-title">Désactiver l’utilisateur ?</h2>
        <p>
          Le compte de {name} ne pourra plus agir. Son identité et son
          historique seront conservés.
        </p>
        <div className="dialog-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="danger" onClick={() => void onConfirm()}>
            Confirmer la désactivation
          </button>
        </div>
      </section>
    </div>
  );
}
