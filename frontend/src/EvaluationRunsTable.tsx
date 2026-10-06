import { referenceLabel } from "./evaluationVersionLabel";
import {
  completionDate,
  type EvaluationRunRow,
  runStateLabels,
} from "./evaluationRuns";

type Props = {
  rows: EvaluationRunRow[];
  onOpen: (row: EvaluationRunRow, revision?: boolean) => void;
  busy: boolean;
};

export function EvaluationRunsTable({ rows, onOpen, busy }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <caption>Tableau des évaluations accessibles</caption>
        <thead>
          <tr>
            {[
              "Modèle",
              "Organisation",
              "Équipe",
              "Assigné à",
              "Rempli par",
              "Date de complétion",
              "État",
              "Actions",
            ].map((label) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{referenceLabel(row)}</td>
              <td>{row.organization_name}</td>
              <td>{row.team_name}</td>
              <td>
                {row.assigned_to}
                {row.assignee_active === false && " · Désactivé"}
                {row.requires_reassignment &&
                  row.state !== "completed" &&
                  " · Réaffectation requise"}
              </td>
              <td>{row.filled_by || "—"}</td>
              <td>{completionDate(row.completed_at)}</td>
              <td>
                {runStateLabels[row.state]}
                {row.revised_at && (
                  <p className="run-revision">
                    Révisé par {row.revised_by} le{" "}
                    {completionDate(row.revised_at)}
                  </p>
                )}
              </td>
              <td>
                <div className="row-actions">
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => onOpen(row)}
                  >
                    {row.state === "completed"
                      ? "Consulter"
                      : row.state === "in_progress"
                        ? "Reprendre l’évaluation"
                        : "Passer l’évaluation"}
                  </button>
                  {row.can_revise && (
                    <button disabled={busy} onClick={() => onOpen(row, true)}>
                      Réviser les notes
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
