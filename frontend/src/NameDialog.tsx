import { type FormEvent, useState } from "react";

import type { NameInput, NamedEntity } from "./evaluations";

type Props = {
  kind: "évaluation" | "question";
  value?: NamedEntity;
  onCancel: () => void;
  onSubmit: (input: NameInput) => Promise<void>;
};

export function NameDialog({ kind, value, onCancel, onSubmit }: Props) {
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
    <div className="evaluation-dialog-backdrop">
      <section
        aria-labelledby="name-dialog-title"
        aria-modal="true"
        className="evaluation-dialog"
        role="dialog"
      >
        <h2 id="name-dialog-title">
          {value ? `Modifier l’${kind}` : `Créer une ${kind}`}
        </h2>
        <form onSubmit={submit}>
          <label htmlFor="entity-name">Nom de {definiteKind}</label>
          <input
            autoFocus
            id="entity-name"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <div className="evaluation-dialog-actions">
            <button className="secondary" onClick={onCancel} type="button">
              Annuler
            </button>
            <button disabled={saving || !name.trim()} type="submit">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
