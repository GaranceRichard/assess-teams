import { QuestionGuides } from "./QuestionGuides";
import type { ScoreGuide } from "./scoreGuides";
import { versionLabel } from "./evaluationVersionLabel";
import type { Evaluation, Question } from "./evaluations";

type Props = {
  evaluation: Evaluation | null;
  questions: Question[];
  onSaveGuides?: (question: Question, guides: ScoreGuide[]) => Promise<void>;
  onCreate: () => void;
  onDelete: (question: Question) => void;
  onEdit: (question: Question) => void;
};

export function QuestionPanel({
  evaluation,
  questions,
  onCreate,
  onDelete,
  onEdit,
  onSaveGuides,
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
            <li key={question.id}>
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
              <QuestionGuides
                question={question}
                editable={evaluation.status === "DRAFT"}
                onSave={onSaveGuides}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
