import { versionLabel } from "./evaluationVersionLabel";
import { QuestionAppreciation } from "./QuestionAppreciation";
import type { AppreciationMarker, Evaluation, Question } from "./evaluations";

type Props = {
  evaluation: Evaluation | null;
  questions: Question[];
  onCreate: () => void;
  onDelete: (question: Question) => void;
  onEdit: (question: Question) => void;
  onSaveMarkers?: (
    question: Question,
    markers: AppreciationMarker[],
  ) => Promise<void>;
};

export function QuestionPanel({
  evaluation,
  questions,
  onCreate,
  onDelete,
  onEdit,
  onSaveMarkers,
}: Props) {
  if (!evaluation) {
    return (
      <section className="question-panel evaluation-empty">
        Sélectionnez une évaluation.
      </section>
    );
  }
  return (
    <section className="question-panel">
      <div className="evaluation-heading">
        <div>
          <p className="eyebrow">Questions</p>
          <h2>{versionLabel(evaluation.family_name, evaluation.version)}</h2>
        </div>
        {evaluation.status === "DRAFT" ? (
          <button onClick={onCreate}>Ajouter une question</button>
        ) : (
          <span className="evaluation-readonly">Lecture seule</span>
        )}
      </div>
      {questions.length === 0 ? (
        <p className="evaluation-empty">
          Aucune question dans cette évaluation.
        </p>
      ) : (
        <ul className="question-list" aria-label="Questions">
          {questions.map((question) => (
            <li key={question.id} className="question-item">
              <div className="question-row">
                <span>{question.index}</span>
                <strong>{question.name}</strong>
                {evaluation.status === "DRAFT" && (
                  <div className="evaluation-actions">
                    <button
                      className="secondary"
                      onClick={() => onEdit(question)}
                    >
                      Modifier
                    </button>
                    <button
                      className="evaluation-danger"
                      onClick={() => onDelete(question)}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              <QuestionAppreciation
                question={question}
                onSave={
                  evaluation.status === "DRAFT" && onSaveMarkers
                    ? (markers) => onSaveMarkers(question, markers)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
