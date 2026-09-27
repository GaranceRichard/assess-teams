import type { Evaluation, Question } from "./evaluations";

type Props = {
  evaluation: Evaluation | null;
  questions: Question[];
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
          <h2>{evaluation.name}</h2>
        </div>
        <button onClick={onCreate}>Ajouter une question</button>
      </div>
      {questions.length === 0 ? (
        <p className="evaluation-empty">
          Aucune question dans cette évaluation.
        </p>
      ) : (
        <ul className="question-list" aria-label="Questions">
          {questions.map((question) => (
            <li key={question.id}>
              <span>{question.index}</span>
              <strong>{question.name}</strong>
              <div className="evaluation-actions">
                <button className="secondary" onClick={() => onEdit(question)}>
                  Modifier
                </button>
                <button
                  className="evaluation-danger"
                  onClick={() => onDelete(question)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
