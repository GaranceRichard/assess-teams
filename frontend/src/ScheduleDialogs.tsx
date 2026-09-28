import type { Evaluation } from "./evaluations";
import type { OrganizationMember } from "./organizations";
import { PlanningForm } from "./PlanningForm";
import type { EvaluationSchedule, ScheduleInput } from "./planning";
import type { Team } from "./teams";

type EditProps = {
  assignees: OrganizationMember[];
  evaluations: Evaluation[];
  onCancel: () => void;
  onSubmit: (input: ScheduleInput) => Promise<void>;
  schedule: EvaluationSchedule;
  teams: Team[];
};

export function ScheduleEditDialog({
  assignees,
  evaluations,
  onCancel,
  onSubmit,
  schedule,
  teams,
}: EditProps) {
  return (
    <div className="planning-dialog-backdrop">
      <section aria-modal="true" className="planning-dialog" role="dialog">
        <h2>Modifier la planification</h2>
        <PlanningForm
          assignees={assignees}
          evaluations={evaluations}
          onSubmit={onSubmit}
          organizationId={schedule.organization_id}
          schedule={schedule}
          teams={teams}
        />
        <button className="secondary" onClick={onCancel} type="button">
          Annuler
        </button>
      </section>
    </div>
  );
}

type DeleteProps = {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  schedule: EvaluationSchedule;
};

export function ScheduleDeleteDialog({
  onCancel,
  onConfirm,
  schedule,
}: DeleteProps) {
  return (
    <div className="planning-dialog-backdrop">
      <section aria-modal="true" className="planning-dialog" role="dialog">
        <h2>Supprimer la planification ?</h2>
        <p>
          {schedule.evaluation_name} pour {schedule.team_name} sera supprimée.
        </p>
        <div className="schedule-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="schedule-danger" onClick={() => void onConfirm()}>
            Confirmer la suppression
          </button>
        </div>
      </section>
    </div>
  );
}
