import { CollectionFrame } from "./CollectionFrame";
import { useEvaluationCatalog } from "./useEvaluationCatalog";
import { useState } from "react";

import { EvaluationList } from "./EvaluationList";
import { EvaluationOrganizationSelect } from "./EvaluationOrganizationSelect";
import {
  type Evaluation,
  createEvaluation,
  createQuestion,
  deleteEvaluation,
  deleteQuestion,
  mergeEvaluation,
  type NameInput,
  orderQuestions,
  updateEvaluation,
  updateQuestion,
} from "./evaluations";
import {
  type DeleteTarget,
  type EditTarget,
  EvaluationPageDialogs,
} from "./EvaluationPageDialogs";
import { QuestionPanel } from "./QuestionPanel";
import { useEvaluationLifecycle } from "./useEvaluationLifecycle";
import "./evaluations.css";

export function EvaluationPage() {
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Evaluation | null>(
    null,
  );
  const selectedId = selectedSnapshot?.id ?? null;
  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { organizations, questions, setQuestions, collection } =
    useEvaluationCatalog(organizationId, selectedId, setError);
  const { items: evaluations, setItems: setEvaluations } = collection;
  const lifecycle = useEvaluationLifecycle((saved) => {
    setEvaluations((current) => mergeEvaluation(current, saved));
    setSelectedSnapshot((current) =>
      current
        ? mergeEvaluation([current], saved).find(
            (item) => item.id === current.id,
          )!
        : null,
    );
  }, setError);
  const selected =
    evaluations.find((evaluation) => evaluation.id === selectedId) ??
    selectedSnapshot;
  const visibleEvaluations = evaluations.filter(
    (evaluation) => evaluation.organization_id === organizationId,
  );

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
          orderQuestions(
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
          setSelectedSnapshot(null);
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
    <section className="evaluations-page product-page">
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
          setSelectedSnapshot(null);
          setQuestions([]);
        }}
      />
      <div className="evaluation-workspace page-content">
        <CollectionFrame {...collection} onChange={collection.changePage}>
          {collection.failed && (
            <p role="alert">Impossible de charger les évaluations.</p>
          )}
          <EvaluationList
            evaluations={visibleEvaluations}
            selectedId={selectedId}
            onNewVersion={lifecycle.createVersion}
            creatingVersion={lifecycle.creatingVersion}
            onArchive={(value) =>
              lifecycle.setTarget({ action: "archive", value })
            }
            onDelete={(value) => setDeleting({ kind: "évaluation", value })}
            onEdit={(value) => setEditing({ kind: "évaluation", value })}
            onSelect={(value) => setSelectedSnapshot(value)}
            onValidate={(value) =>
              lifecycle.setTarget({ action: "validate", value })
            }
          />
        </CollectionFrame>
        <QuestionPanel
          evaluation={selected}
          questions={questions}
          onCreate={() => setEditing({ kind: "question" })}
          onDelete={(value) => setDeleting({ kind: "question", value })}
          onEdit={(value) => setEditing({ kind: "question", value })}
        />
      </div>
      <EvaluationPageDialogs
        deleting={deleting}
        editing={editing}
        lifecycle={lifecycle.target}
        onCloseDelete={() => setDeleting(null)}
        onCloseEdit={() => setEditing(null)}
        onCloseLifecycle={() => lifecycle.setTarget(null)}
        onDelete={remove}
        onSave={save}
        onTransition={lifecycle.confirm}
      />
    </section>
  );
}
