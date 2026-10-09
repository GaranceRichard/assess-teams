import type { EvaluationRun } from "./evaluationRuns";
import { referenceLabel } from "./evaluationVersionLabel";

type Props = { run: EvaluationRun; revision: boolean; readonly: boolean };

// Intrinsic, inaccessible sizing copies keep navigation stable across questions.
// Generated text avoids duplicate readable content or interactive controls.
export function TakingContentSizing({ run, revision, readonly }: Props) {
  return (
    <div className="taking-sizing" aria-hidden="true" inert>
      {run.questions.flatMap((question) =>
        [undefined, ...(question.appreciation_markers ?? [])].map(
          (marker, index) => (
            <div
              className="taking-size-copy"
              key={`${question.question_id}-${index}`}
            >
              <p data-text={`${referenceLabel(run)} · ${run.team_name}`} />
              <p data-text={`Assigné à ${run.assigned_to}`} />
              {revision && (
                <p data-text="La révision sera enregistrée à sa validation." />
              )}
              <p
                className="question-position"
                data-text={`Question ${run.questions.length} / ${run.questions.length}`}
              />
              <h3 className="taking-question-title" data-text={question.text} />
              <span className="taking-label" data-text="Note de la question" />
              <span className="taking-range" />
              <div className="appreciation-scale" />
              {marker?.text.trim() && (
                <p className="taking-size-description">
                  <strong data-text="Repère pour 10 / 10 :" />
                  <span data-text={` ${marker.text}`} />
                </p>
              )}
              <span
                className="taking-output"
                data-text="Note sélectionnée : 10 / 10"
              />
              <p
                className="taking-status"
                data-text="Choisissez une note ou confirmez la note proposée."
              />
              {!readonly && !revision && (
                <span
                  className="secondary taking-note-action"
                  data-text="Réessayer la sauvegarde"
                />
              )}
            </div>
          ),
        ),
      )}
    </div>
  );
}
