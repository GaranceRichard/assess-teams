import { useId, useState } from "react";
import type { Question } from "./evaluations";
import { validScoreGuides, type ScoreGuide } from "./scoreGuides";
import "./score-guides.css";

type Props = {
  question: Question;
  editable: boolean;
  onSave?: (question: Question, guides: ScoreGuide[]) => Promise<void>;
};

export function QuestionGuides({ question, editable, onSave }: Props) {
  const id = useId();
  const guides = question.score_guides ?? [];
  const [editing, setEditing] = useState<number | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function persist(next: ScoreGuide[]) {
    if (!onSave) return;
    setBusy(true);
    setError("");
    try {
      await onSave(question, next);
      setEditing(null);
      setLevels([]);
      setText("");
    } catch {
      setError("L’enregistrement des repères a été refusé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="question-guides">
      <summary>Repères d’appréciation ({guides.length})</summary>
      <p>
        Facultatifs : un texte par niveau configuré, sans effet sur la note.
      </p>
      {guides.length === 0 && <p>Aucun repère configuré.</p>}
      <ul aria-label="Repères configurés">
        {guides.map((guide) => (
          <li key={guide.score}>
            <span>
              <strong>{guide.score} / 10</strong> · {guide.text}
            </span>
            {editable && onSave && (
              <div className="evaluation-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  aria-label={`Modifier le repère du niveau ${guide.score}`}
                  onClick={() => {
                    setEditing(guide.score);
                    setLevels([guide.score]);
                    setText(guide.text);
                  }}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="evaluation-danger"
                  disabled={busy}
                  aria-label={`Supprimer le repère du niveau ${guide.score}`}
                  onClick={() =>
                    void persist(guides.filter((g) => g.score !== guide.score))
                  }
                >
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      {editable && onSave && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const next = [
              ...guides.filter((g) => g.score !== editing),
              ...levels.map((score) => ({ score, text: text.trim() })),
            ];
            if (levels.length && validScoreGuides(next)) void persist(next);
          }}
        >
          <fieldset disabled={busy}>
            <legend>
              {editing === null ? "Niveaux à associer" : `Niveau ${editing}`}
            </legend>
            <div className="guide-levels">
              {Array.from({ length: 11 }, (_, score) => (
                <label key={score}>
                  <input
                    type="checkbox"
                    checked={levels.includes(score)}
                    disabled={
                      editing !== null || guides.some((g) => g.score === score)
                    }
                    onChange={(event) =>
                      setLevels((current) =>
                        event.target.checked
                          ? [...current, score]
                          : current.filter((level) => level !== score),
                      )
                    }
                  />
                  {score}
                </label>
              ))}
            </div>
            <label htmlFor={id}>Appréciation</label>
            <textarea
              id={id}
              value={text}
              required
              onChange={(event) => setText(event.target.value)}
            />
            <button disabled={!levels.length || !text.trim()}>
              {editing === null
                ? "Ajouter les repères"
                : "Enregistrer le repère"}
            </button>
            {editing !== null && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditing(null);
                  setLevels([]);
                  setText("");
                }}
              >
                Annuler
              </button>
            )}
          </fieldset>
        </form>
      )}
    </details>
  );
}
