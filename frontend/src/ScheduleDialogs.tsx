import { useState } from "react";

import type { Evaluation } from "./evaluations";
import type { OrganizationMember } from "./organizations";
import { PlanningForm } from "./PlanningForm";
import type { EvaluationSchedule, ScheduleInput } from "./planning";
import type { Team } from "./teams";

type Props = {
  assignees: OrganizationMember[];
  evaluations: Evaluation[];
  onCancel: () => void;
  onDelete: () => Promise<void>;
  onSubmit: (input: ScheduleInput) => Promise<void>;
  schedule: EvaluationSchedule;
  teams: Team[];
};

export function ScheduleEditDialog({
  assignees,
  evaluations,
  onCancel,
  onDelete,
  onSubmit,
  schedule,
  teams,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="planning-dialog-backdrop">
      <section
        aria-labelledby="planning-dialog-title"
        aria-modal="true"
        className="planning-dialog"
        role="dialog"
      >
        <h2 id="planning-dialog-title">Modifier la planification</h2>
        <PlanningForm
          assignees={assignees}
          evaluations={evaluations}
          onSubmit={onSubmit}
          organizationId={schedule.organization_id}
          schedule={schedule}
          teams={teams}
        />
        {confirmingDelete && (
          <p role="alert">
            Supprimer définitivement {schedule.evaluation_name} pour{" "}
            {schedule.team_name} ?
          </p>
        )}
        <div className="schedule-actions">
          <button className="secondary" onClick={onCancel} type="button">
            Annuler
          </button>
          {confirmingDelete ? (
            <button
              className="schedule-danger"
              disabled={deleting}
              onClick={() => void remove()}
              type="button"
            >
              {deleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          ) : (
            <button
              className="schedule-danger"
              onClick={() => setConfirmingDelete(true)}
              type="button"
            >
              Supprimer
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
