import { CollectionFrame } from "./CollectionFrame";
import { usePagedCollection } from "./usePagedCollection";
import { useState } from "react";

import type { SessionUser } from "./auth";
import {
  type EvaluationRun,
  type EvaluationRunRow,
  getEvaluationRun,
  listEvaluationRuns,
  startEvaluationRun,
} from "./evaluationRuns";
import { EvaluationRunsTable } from "./EvaluationRunsTable";
import { EvaluationTakingDialog } from "./EvaluationTakingDialog";
import "./evaluations.css";
import "./evaluation-taking.css";
import "./admin-users.css";

export function EvaluationTakingPage({ actor }: { actor: SessionUser }) {
  const collection = usePagedCollection<EvaluationRunRow>(listEvaluationRuns);
  const { items: rows, setItems: setRows, loading } = collection;
  const [active, setActive] = useState<{
    run: EvaluationRun;
    revision: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(run: EvaluationRun) {
    setRows((current) => current.map((row) => (row.id === run.id ? run : row)));
  }

  async function open(row: EvaluationRunRow, revision = false) {
    setBusy(true);
    setError(null);
    try {
      const run =
        row.state === "completed"
          ? await getEvaluationRun(row.id)
          : await startEvaluationRun(row.id);
      updateRow(run);
      setActive({ run, revision });
    } catch {
      setError(
        "Impossible d’ouvrir cette évaluation. Vérifiez que le modèle est validé, contient des questions et que l’équipe est active.",
      );
    } finally {
      setBusy(false);
    }
  }

  const pending = rows.filter((row) => row.state !== "completed");
  return (
    <section className="taking-page product-page">
      <p className="eyebrow">Votre espace</p>
      <h1>Évaluations</h1>
      {error && <p role="alert">{error}</p>}
      <CollectionFrame {...collection} onChange={collection.changePage}>
        {collection.failed && (
          <p role="alert">Impossible de charger les évaluations.</p>
        )}
        {loading ? (
          <p role="status">Chargement des évaluations…</p>
        ) : (
          <>
            <h2>
              {actor.role === "Admin"
                ? "Évaluations attendues"
                : "Évaluations à passer"}
            </h2>
            <p>
              {pending.length
                ? `${pending.length} évaluation(s) à compléter sur cette page.`
                : "Aucune évaluation à passer."}
            </p>
            {actor.role === "Admin" && (
              <p>
                Vous pouvez répondre à la place de l’assigné dans votre
                périmètre.
              </p>
            )}
            {rows.length > 0 && (
              <EvaluationRunsTable
                rows={rows}
                busy={busy}
                onOpen={(row, revision) => void open(row, revision)}
              />
            )}
          </>
        )}
      </CollectionFrame>
      {active && (
        <EvaluationTakingDialog
          run={active.run}
          revision={active.revision}
          onClose={(run) => {
            updateRow(run);
            setActive(null);
          }}
        />
      )}
    </section>
  );
}
