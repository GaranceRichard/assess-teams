import { type FormEvent, useState } from "react";

import type { OrderedName, OrderedNameInput } from "./evaluations";

type Props = {
  kind: "évaluation" | "question";
  value?: OrderedName;
  onCancel: () => void;
  onSubmit: (input: OrderedNameInput) => Promise<void>;
};

export function IndexedNameDialog({ kind, value, onCancel, onSubmit }: Props) {
  const [index, setIndex] = useState(value?.index ?? 1);
  const [name, setName] = useState(value?.name ?? "");
  const [saving, setSaving] = useState(false);
  const definiteKind = kind === "question" ? "la question" : "l’évaluation";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ index, name });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="evaluation-dialog-backdrop">
      <section
        aria-labelledby="indexed-name-title"
        aria-modal="true"
        className="evaluation-dialog"
        role="dialog"
      >
        <h2 id="indexed-name-title">
          {value ? `Modifier l’${kind}` : `Créer une ${kind}`}
        </h2>
        <form onSubmit={submit}>
          <label htmlFor="indexed-name-index">Index de {definiteKind}</label>
          <input
            id="indexed-name-index"
            min="1"
            onChange={(event) => setIndex(Number(event.target.value))}
            required
            type="number"
            value={index}
          />
          <label htmlFor="indexed-name-value">Nom de {definiteKind}</label>
          <input
            autoFocus
            id="indexed-name-value"
            maxLength={255}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <div className="evaluation-dialog-actions">
            <button className="secondary" onClick={onCancel} type="button">
              Annuler
            </button>
            <button
              disabled={saving || index < 1 || !name.trim()}
              type="submit"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
