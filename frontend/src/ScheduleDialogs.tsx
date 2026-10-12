import { ErrorNotice } from "./ErrorNotice";
import { Modal } from "./Modal";
import { useState } from "react";

import type { Evaluation } from "./evaluations";
import type { OrganizationMember } from "./organizations";
import { PlanningForm } from "./PlanningForm";
import type { EvaluationSchedule, ScheduleInput } from "./planning";
import type { Team } from "./teams";

type Props = {
  error?: string | null;
  assignees: OrganizationMember[];
  evaluations: Evaluation[];
  onCancel: () => void;
  onDelete: () => Promise<void>;
  onSubmit: (input: ScheduleInput) => Promise<void>;
  schedule: EvaluationSchedule;
  teams: Team[];
};

export function ScheduleEditDialog({
  error,
  assignees,
  evaluations,
  onCancel,
  onDelete,
  onSubmit,
  schedule,
  teams,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
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
    <Modal
      backdropClassName="planning-dialog-backdrop"
      labelledBy="planning-dialog-title"
      onClose={onCancel}
      dismissible={!(saving || deleting)}
    >
      <section className="planning-dialog">
        <h2 id="planning-dialog-title">Modifier la planification</h2>
        <ErrorNotice error={error} />
        <PlanningForm
          assignees={assignees}
          evaluations={evaluations}
          onSubmit={onSubmit}
          onSavingChange={setSaving}
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
          <button
            className="secondary"
            disabled={saving || deleting}
            onClick={onCancel}
            type="button"
          >
            Annuler
          </button>
          {confirmingDelete ? (
            <button
              className="schedule-danger"
              disabled={saving || deleting}
              onClick={() => void remove()}
              type="button"
            >
              {deleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
          ) : (
            <button
              className="schedule-danger"
              disabled={saving}
              onClick={() => setConfirmingDelete(true)}
              type="button"
            >
              Supprimer
            </button>
          )}
        </div>
      </section>
    </Modal>
  );
}
