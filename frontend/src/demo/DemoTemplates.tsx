import { EvaluationList } from "../EvaluationList";
import { useState } from "react";
import { QuestionPanel } from "../QuestionPanel";
import { NameDialog } from "../NameDialog";
import { EvaluationDeleteDialog } from "../EvaluationDeleteDialog";
import type { Question } from "../evaluations";
import { criteria, model } from "./fixtures";
import {
  copy,
  deleteQuestion,
  moveQuestion,
  saveQuestion,
  saveMarkers,
  state,
} from "./store";
import "../evaluations.css";
export function DemoTemplates() {
  const [questions, setQuestions] = useState(() => copy(state.questions));
  const [editing, setEditing] = useState<Question | "new" | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [selectedId, setSelectedId] = useState(2);
  const [error, setError] = useState("");
  const draft = { ...model, id: 2, status: "DRAFT" as const, version: 2 };
  function refresh() {
    setQuestions(copy(state.questions));
    setError("");
  }
  return (
    <section className="evaluations-page product-page">
      <h1>Modèles d’évaluation</h1>
      <p>Atelier Horizon · Coopération d’équipe</p>
      <p>
        Explorez le brouillon v2 : ses modifications restent locales. Les
        passations et les résultats utilisent la v1 validée, dont les{" "}
        {criteria.length} critères restent immuables.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="evaluation-workspace page-content">
        <EvaluationList
          evaluations={[model, draft]}
          selectedId={selectedId}
          onSelect={(value) => setSelectedId(value.id)}
        />
        <div className="demo-template-content">
          <QuestionPanel
            evaluation={selectedId === 2 ? draft : model}
            questions={selectedId === 2 ? questions : criteria}
            onCreate={() => setEditing("new")}
            onEdit={setEditing}
            onDelete={setDeleting}
            onSaveMarkers={async (question, markers) => {
              saveMarkers(question.id, markers);
              refresh();
            }}
          />
          {selectedId === 2 && (
            <details>
              <summary>Réordonner le brouillon · simulation locale</summary>
              <ol className="demo-order">
                {questions.map((q, i) => (
                  <li key={q.id}>
                    <span>{q.name}</span>
                    <button
                      className="secondary"
                      disabled={i === 0}
                      aria-label={"Monter " + q.name}
                      onClick={() => {
                        moveQuestion(q.id, -1);
                        refresh();
                      }}
                    >
                      ↑
                    </button>
                    <button
                      className="secondary"
                      disabled={i === questions.length - 1}
                      aria-label={"Descendre " + q.name}
                      onClick={() => {
                        moveQuestion(q.id, 1);
                        refresh();
                      }}
                    >
                      ↓
                    </button>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </div>
      {editing && (
        <NameDialog
          kind="question"
          value={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSubmit={async (input) => {
            try {
              saveQuestion(editing === "new" ? null : editing, input.name);
              refresh();
              setEditing(null);
            } catch {
              setError("Nom requis, 255 caractères maximum.");
            }
          }}
        />
      )}
      {deleting && (
        <EvaluationDeleteDialog
          kind="question"
          value={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            deleteQuestion(deleting.id);
            refresh();
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}
