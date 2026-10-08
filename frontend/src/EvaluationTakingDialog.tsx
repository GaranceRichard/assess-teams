import { AppreciationScale } from "./AppreciationScale";
import { referenceLabel } from "./evaluationVersionLabel";
import { useEffect, useRef } from "react";

import type { EvaluationRun } from "./evaluationRuns";
import { useEvaluationTaking } from "./useEvaluationTaking";

type Props = {
  run: EvaluationRun;
  revision: boolean;
  onClose: (run: EvaluationRun) => void;
};

export function EvaluationTakingDialog({ run, revision, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const {
    current,
    position,
    setPosition,
    saving,
    submitting,
    advancing,
    unsaved,
    error,
    question,
    readonly,
    complete,
    selectScore,
    next,
    submit,
  } = useEvaluationTaking(run, revision, onClose);

  const proposedScore = question?.score ?? 5;
  const appreciation = question?.appreciation_markers?.find(
    (marker) => marker.score === proposedScore,
  )?.text;

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="evaluation-dialog taking-dialog"
      aria-labelledby="taking-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving && !unsaved) onClose(current);
      }}
    >
      <h2 id="taking-title">
        {revision ? "Réviser" : readonly ? "Consulter" : "Passer"} l’évaluation
      </h2>
      <p>
        {referenceLabel(current)} · {current.team_name}
      </p>
      <p>Assigné à {current.assigned_to}</p>
      {revision && <p>La révision sera enregistrée à sa validation.</p>}
      {error && <p role="alert">{error}</p>}
      {question && (
        <>
          <p className="question-position" aria-live="polite">
            Question {position + 1} / {current.questions.length}
          </p>
          <h3 id="question-text">{question.text}</h3>
          <label htmlFor="evaluation-score">Note de la question</label>
          <input
            id="evaluation-score"
            type="range"
            min={0}
            max={10}
            step={1}
            value={question.score ?? 5}
            disabled={readonly || submitting || advancing}
            aria-describedby="question-text score-status"
            aria-valuetext={`${proposedScore} sur 10${appreciation ? " : " + appreciation : ""}`}
            onChange={(event) => void selectScore(Number(event.target.value))}
          />
          <AppreciationScale
            key={question.question_id}
            markers={question.appreciation_markers ?? []}
            score={question.score}
            disabled={readonly || submitting || advancing}
            onSelect={(score) => void selectScore(score)}
          />
          <output htmlFor="evaluation-score" aria-live="polite">
            Note sélectionnée : {question.score ?? 5} / 10
          </output>
          <p id="score-status" role="status">
            {saving
              ? "Enregistrement…"
              : unsaved
                ? "Note non sauvegardée"
                : question.score === null
                  ? "Choisissez une note ou confirmez la note proposée."
                  : revision
                    ? "Note à valider"
                    : "Note enregistrée"}
          </p>
          {!readonly && !revision && (
            <button
              className="secondary"
              disabled={saving}
              onClick={() => void selectScore(question.score ?? 5)}
            >
              {unsaved ? "Réessayer la sauvegarde" : "Enregistrer la note"}
            </button>
          )}
          <div className="evaluation-dialog-actions">
            <button
              className="secondary"
              disabled={saving || unsaved || position === 0}
              onClick={() => setPosition(position - 1)}
            >
              Précédent
            </button>
            {position < current.questions.length - 1 ? (
              <button disabled={saving} onClick={() => void next()}>
                Suivant
              </button>
            ) : (
              !readonly && (
                <button
                  disabled={saving || unsaved || !complete}
                  onClick={() => void submit()}
                >
                  {revision ? "Valider la révision" : "Valider l’évaluation"}
                </button>
              )
            )}
          </div>
        </>
      )}
      <button
        className="secondary taking-close"
        disabled={saving || unsaved}
        onClick={() => onClose(current)}
      >
        {revision ? "Annuler la révision" : "Fermer"}
      </button>
    </dialog>
  );
}
