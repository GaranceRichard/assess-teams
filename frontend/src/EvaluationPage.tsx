import { useEffect, useState } from "react";

import { EvaluationDeleteDialog } from "./EvaluationDeleteDialog";
import { EvaluationList } from "./EvaluationList";
import { EvaluationOrganizationSelect } from "./EvaluationOrganizationSelect";
import {
  createEvaluation,
  createQuestion,
  deleteEvaluation,
  deleteQuestion,
  type Evaluation,
  listEvaluations,
  listQuestions,
  type NameInput,
  type Question,
  updateEvaluation,
  updateQuestion,
} from "./evaluations";
import { NameDialog } from "./NameDialog";
import { listOrganizations, type Organization } from "./organizations";
import { QuestionPanel } from "./QuestionPanel";
import "./evaluations.css";

type EditTarget =
  | { kind: "évaluation"; value?: Evaluation }
  | { kind: "question"; value?: Question };
type DeleteTarget =
  | { kind: "évaluation"; value: Evaluation }
  | { kind: "question"; value: Question };

function ordered(items: Question[]): Question[] {
  return [...items].sort(
    (left, right) => left.index - right.index || left.id - right.id,
  );
}

export function EvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selected =
    evaluations.find((evaluation) => evaluation.id === selectedId) ?? null;
  const visibleEvaluations = evaluations.filter(
    (evaluation) => evaluation.organization_id === organizationId,
  );

  useEffect(() => {
    Promise.all([listEvaluations(), listOrganizations()])
      .then(([loadedEvaluations, loadedOrganizations]) => {
        setEvaluations(loadedEvaluations);
        setOrganizations(loadedOrganizations);
      })
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

  async function save(input: NameInput) {
    if (!editing) return;
    try {
      if (editing.kind === "évaluation") {
        const saved = editing.value
          ? await updateEvaluation(editing.value.id, input)
          : await createEvaluation({
              ...input,
              organization_id: organizationId!,
            });
        setEvaluations((current) =>
          editing.value
            ? current.map((item) => (item.id === saved.id ? saved : item))
            : [...current, saved],
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
        {organizationId !== null && (
          <button onClick={() => setEditing({ kind: "évaluation" })}>
            Créer une évaluation
          </button>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <EvaluationOrganizationSelect
        organizations={organizations}
        value={organizationId}
        onChange={(value) => {
          setOrganizationId(value);
          setSelectedId(null);
          setQuestions([]);
        }}
      />
      <div className="evaluation-workspace">
        <EvaluationList
          evaluations={visibleEvaluations}
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
        <NameDialog
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
