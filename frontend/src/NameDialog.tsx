import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { type FormEvent, useState } from "react";

import type { NameInput, NamedEntity } from "./evaluations";

type Props = {
  error?: string | null;
  kind: "évaluation" | "question";
  value?: NamedEntity;
  onCancel: () => void;
  onSubmit: (input: NameInput) => Promise<void>;
};

export function NameDialog({ error, kind, value, onCancel, onSubmit }: Props) {
  const [name, setName] = useState(value?.name ?? "");
  const [saving, setSaving] = useState(false);
  const definiteKind = kind === "question" ? "la question" : "l’évaluation";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      backdropClassName="evaluation-dialog-backdrop"
      labelledBy="name-dialog-title"
      onClose={onCancel}
      dismissible={!saving}
    >
      <section className="evaluation-dialog">
        <h2 id="name-dialog-title">
          {value ? `Modifier ${definiteKind}` : `Créer une ${kind}`}
        </h2>
        <ErrorNotice error={error} />
        <form onSubmit={submit}>
          <label htmlFor="entity-name">Nom de {definiteKind}</label>
          <input
            id="entity-name"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <div className="evaluation-dialog-actions">
            <button
              className="secondary"
              disabled={saving}
              onClick={onCancel}
              type="button"
            >
              Annuler
            </button>
            <button disabled={saving || !name.trim()} type="submit">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </Modal>
  );
}
