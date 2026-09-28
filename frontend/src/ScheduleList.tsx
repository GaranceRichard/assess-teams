import { type EvaluationSchedule, scheduleLabels } from "./planning";

type Props = {
  schedules: EvaluationSchedule[];
  onDelete: (schedule: EvaluationSchedule) => void;
  onEdit: (schedule: EvaluationSchedule) => void;
};

export function ScheduleList({ schedules, onDelete, onEdit }: Props) {
  if (schedules.length === 0) {
    return <p className="planning-empty">Aucune évaluation planifiée.</p>;
  }

  return (
    <ul className="schedule-list">
      {schedules.map((schedule) => (
        <li key={schedule.id}>
          <div>
            <span>{schedule.organization_name}</span>
            <strong>{schedule.team_name}</strong>
            <span>{schedule.evaluation_name}</span>
            <span>
              Responsable : {schedule.assignee_identifier ?? "Non attribué"}
              {schedule.assignee_role ? ` — ${schedule.assignee_role}` : ""}
            </span>
          </div>
          <div className="schedule-cadence">
            <strong>{scheduleLabels[schedule.mode]}</strong>
            <span>Première date : {schedule.first_due_date}</span>
            <div className="schedule-actions">
              <button className="secondary" onClick={() => onEdit(schedule)}>
                Modifier
              </button>
              <button
                className="schedule-danger"
                onClick={() => onDelete(schedule)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
