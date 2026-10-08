import { useId, useState } from "react";
import type { AppreciationMarker, Question } from "./evaluations";
import "./appreciation-markers.css";

type Props = {
  question: Question;
  onSave?: (markers: AppreciationMarker[]) => Promise<void>;
};

export function QuestionAppreciation({ question, onSave }: Props) {
  const id = useId();
  const markers = question.appreciation_markers ?? [];
  const [original, setOriginal] = useState<number | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  function reset() {
    setEditing(false);
    setOriginal(null);
    setLevels([]);
    setText("");
  }
  async function save(next: AppreciationMarker[]) {
    setSaving(true);
    setError("");
    try {
      await onSave!(next.sort((a, b) => a.score - b.score));
      reset();
    } catch {
      setError("L’enregistrement des repères a été refusé.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <details className="question-appreciation">
      <summary>Repères d’appréciation ({markers.length})</summary>
      {error && <p role="alert">{error}</p>}
      {markers.length === 0 && <p>Aucun repère configuré.</p>}
      <ul aria-label={"Repères de " + question.name}>
        {markers.map((marker) => (
          <li key={marker.score}>
            <span>
              <strong>{marker.score} / 10</strong> · {marker.text}
            </span>
            {onSave && (
              <div className="evaluation-actions">
                <button
                  className="secondary"
                  disabled={saving || editing}
                  aria-label={"Modifier le repère " + marker.score}
                  onClick={() => {
                    setOriginal(marker.score);
                    setLevels([marker.score]);
                    setText(marker.text);
                    setEditing(true);
                  }}
                >
                  Modifier
                </button>
                <button
                  className="evaluation-danger"
                  disabled={saving || editing}
                  aria-label={"Supprimer le repère " + marker.score}
                  onClick={() =>
                    void save(markers.filter((m) => m.score !== marker.score))
                  }
                >
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {onSave && !editing && (
        <button
          className="secondary"
          disabled={saving || markers.length === 11}
          onClick={() => {
            reset();
            setEditing(true);
          }}
        >
          Ajouter un repère
        </button>
      )}
      {onSave && editing && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!levels.length || !text.trim()) return;
            void save([
              ...markers.filter((m) => m.score !== original),
              ...levels.map((score) => ({ score, text: text.trim() })),
            ]);
          }}
        >
          <fieldset disabled={saving}>
            <legend>Niveaux de score</legend>
            <div className="marker-levels">
              {Array.from({ length: 11 }, (_, score) => (
                <label key={score}>
                  <input
                    type="checkbox"
                    checked={levels.includes(score)}
                    disabled={markers.some(
                      (m) => m.score === score && score !== original,
                    )}
                    onChange={(event) =>
                      setLevels(
                        event.target.checked
                          ? [...levels, score]
                          : levels.filter((level) => level !== score),
                      )
                    }
                  />
                  {score}
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={id}>Appréciation</label>
          <textarea
            id={id}
            required
            value={text}
            disabled={saving}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="evaluation-actions">
            <button disabled={saving || !levels.length || !text.trim()}>
              Enregistrer les repères
            </button>
            <button
              type="button"
              className="secondary"
              disabled={saving}
              onClick={reset}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </details>
  );
}
