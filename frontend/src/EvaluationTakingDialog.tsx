import { useLayoutEffect, useRef } from "react";
import { TakingContentSizing } from "./TakingContentSizing";
import { TakingStatusSizing } from "./TakingStatusSizing";
import { EvaluationScoreInput } from "./EvaluationScoreInput";
import { referenceLabel } from "./evaluationVersionLabel";
import { useModalFocus } from "./useModalFocus";

import type { EvaluationRun } from "./evaluationRuns";
import { useEvaluationTaking } from "./useEvaluationTaking";

type Props = {
  returnFocus?: HTMLElement;
  run: EvaluationRun;
  revision: boolean;
  onClose: (run: EvaluationRun) => void;
};

export function EvaluationTakingDialog({
  returnFocus,
  run,
  revision,
  onClose,
}: Props) {
  const dialog = useModalFocus("taking-title", "title", returnFocus);
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
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const previousQuestion = useRef(question?.question_id);

  useLayoutEffect(() => {
    if (previousQuestion.current !== question?.question_id) {
      previousQuestion.current = question?.question_id;
      questionTitle.current?.focus();
    }
  }, [question?.question_id]);

  return (
    <dialog
      ref={dialog}
      className="evaluation-dialog taking-dialog"
      aria-labelledby="taking-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving && !unsaved) onClose(current);
      }}
    >
      <h2 id="taking-title">
        {revision ? "Réviser" : readonly ? "Consulter" : "Passer"} l’évaluation
      </h2>
      <div className="taking-body">
        <TakingContentSizing
          run={run}
          revision={revision}
          readonly={readonly}
        />
        <div className="taking-content" key={question?.question_id}>
          <p>
            {referenceLabel(current)} · {current.team_name}
          </p>
          <p>Assigné à {current.assigned_to}</p>
          {revision && <p>La révision sera enregistrée à sa validation.</p>}
          {question && (
            <>
              <p className="question-position" aria-live="polite">
                Question {position + 1} / {current.questions.length}
              </p>
              <h3
                ref={questionTitle}
                id="question-text"
                className="taking-question-title"
                tabIndex={-1}
              >
                {question.text}
              </h3>
              <EvaluationScoreInput
                question={question}
                disabled={readonly || submitting || advancing}
                onSelect={(score) => void selectScore(score)}
              />
              <p
                id="score-status"
                className="taking-status"
                role={error ? "alert" : "status"}
              >
                <TakingStatusSizing />
                <span>
                  {error ??
                    (saving
                      ? "Enregistrement…"
                      : unsaved
                        ? "Note non sauvegardée"
                        : question.score === null
                          ? "Choisissez une note de 0 à 10."
                          : revision
                            ? "Note à valider"
                            : "Note enregistrée")}
                </span>
              </p>
              {!readonly && !revision && (
                <button
                  className="secondary taking-note-action"
                  disabled={saving || question.score === null}
                  onClick={() => {
                    if (question.score !== null)
                      void selectScore(question.score);
                  }}
                >
                  {unsaved ? "Réessayer la sauvegarde" : "Enregistrer la note"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="taking-footer">
        {question && (
          <div
            className="evaluation-dialog-actions"
            data-size-label={
              readonly
                ? "Suivant"
                : revision
                  ? "Valider la révision"
                  : "Valider l’évaluation"
            }
          >
            <button
              className="secondary"
              disabled={saving || unsaved || position === 0}
              onClick={() => setPosition(position - 1)}
            >
              Précédent
            </button>
            {position < current.questions.length - 1 ? (
              <button
                disabled={saving || (!readonly && question.score === null)}
                onClick={() => void next()}
              >
                <span>Suivant</span>
              </button>
            ) : (
              !readonly && (
                <button
                  disabled={saving || unsaved || !complete}
                  onClick={() => void submit()}
                >
                  <span>
                    {revision ? "Valider la révision" : "Valider l’évaluation"}
                  </span>
                </button>
              )
            )}
          </div>
        )}
        <button
          className="secondary taking-close"
          disabled={saving || unsaved}
          onClick={() => onClose(current)}
        >
          {revision ? "Annuler la révision" : "Fermer"}
        </button>
      </footer>
    </dialog>
  );
}
