import { useEffect, useState } from "react";

import { EvaluationDeleteDialog } from "./EvaluationDeleteDialog";
import { EvaluationList } from "./EvaluationList";
import {
  createEvaluation,
  createQuestion,
  deleteEvaluation,
  deleteQuestion,
  type Evaluation,
  listEvaluations,
  listQuestions,
  type OrderedName,
  type OrderedNameInput,
  type Question,
  updateEvaluation,
  updateQuestion,
} from "./evaluations";
import { IndexedNameDialog } from "./IndexedNameDialog";
import { QuestionPanel } from "./QuestionPanel";
import "./evaluations.css";

type Kind = "évaluation" | "question";
type EditTarget = { kind: Kind; value?: OrderedName };
type DeleteTarget = { kind: Kind; value: OrderedName };

function ordered<T extends OrderedName>(items: T[]): T[] {
  return [...items].sort(
    (left, right) => left.index - right.index || left.id - right.id,
  );
}

export function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selected =
    evaluations.find((evaluation) => evaluation.id === selectedId) ?? null;

  useEffect(() => {
    listEvaluations()
      .then(setEvaluations)
      .catch(() => setError("Impossible de charger les évaluations."));
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    listQuestions(selectedId)
      .then((loaded) => {
        setQuestions(loaded);
        setError(null);
      })
      .catch(() => setError("Impossible de charger les questions."));
  }, [selectedId]);

  async function save(input: OrderedNameInput) {
    if (!editing) return;
    try {
      if (editing.kind === "évaluation") {
        const saved = editing.value
          ? await updateEvaluation(editing.value.id, input)
          : await createEvaluation(input);
        setEvaluations((current) =>
          ordered(
            editing.value
              ? current.map((item) => (item.id === saved.id ? saved : item))
              : [...current, saved],
          ),
        );
      } else if (selectedId !== null) {
        const saved = editing.value
          ? await updateQuestion(editing.value.id, input)
          : await createQuestion(selectedId, input);
        setQuestions((current) =>
          ordered(
            editing.value
              ? current.map((item) => (item.id === saved.id ? saved : item))
              : [...current, saved],
          ),
        );
      }
      setEditing(null);
      setError(null);
    } catch {
      setError(
        `L’enregistrement de ${editing.kind === "question" ? "la question" : "l’évaluation"} a été refusé.`,
      );
    }
  }

  async function remove() {
    if (!deleting) return;
    try {
      if (deleting.kind === "évaluation") {
        await deleteEvaluation(deleting.value.id);
        setEvaluations((current) =>
          current.filter((item) => item.id !== deleting.value.id),
        );
        if (selectedId === deleting.value.id) {
          setSelectedId(null);
          setQuestions([]);
        }
      } else {
        await deleteQuestion(deleting.value.id);
        setQuestions((current) =>
          current.filter((item) => item.id !== deleting.value.id),
        );
      }
      setDeleting(null);
      setError(null);
    } catch {
      setError(
        `La suppression de ${deleting.kind === "question" ? "la question" : "l’évaluation"} a été refusée.`,
      );
    }
  }

  return (
    <section className="evaluations-page">
      <div className="evaluation-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Modèles d’évaluation</h1>
        </div>
        <button onClick={() => setEditing({ kind: "évaluation" })}>
          Créer une évaluation
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="evaluation-workspace">
        <EvaluationList
          evaluations={evaluations}
          selectedId={selectedId}
          onDelete={(value) => setDeleting({ kind: "évaluation", value })}
          onEdit={(value) => setEditing({ kind: "évaluation", value })}
          onSelect={(value) => setSelectedId(value.id)}
        />
        <QuestionPanel
          evaluation={selected}
          questions={questions}
          onCreate={() => setEditing({ kind: "question" })}
          onDelete={(value) => setDeleting({ kind: "question", value })}
          onEdit={(value) => setEditing({ kind: "question", value })}
        />
      </div>
      {editing && (
        <IndexedNameDialog
          kind={editing.kind}
          value={editing.value}
          onCancel={() => setEditing(null)}
          onSubmit={save}
        />
      )}
      {deleting && (
        <EvaluationDeleteDialog
          kind={deleting.kind}
          value={deleting.value}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}
