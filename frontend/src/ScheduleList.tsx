import { referenceLabel } from "./evaluationVersionLabel";
import type { EvaluationSchedule } from "./planning";

type Props = {
  schedules: EvaluationSchedule[];
  onOpen: (schedule: EvaluationSchedule) => void;
};

function scheduleLabel(schedule: EvaluationSchedule): string {
  return [
    schedule.organization_name,
    referenceLabel(schedule),
    schedule.team_name,
    schedule.assignee_identifier ?? "Non attribué",
  ].join(" - ");
}

export function ScheduleList({ schedules, onOpen }: Props) {
  if (schedules.length === 0) {
    return <p className="planning-empty">Aucune évaluation planifiée.</p>;
  }

  return (
    <ul className="schedule-list">
      {schedules.map((schedule) => (
        <li key={schedule.id}>
          <button
            className="schedule-row"
            onClick={() => onOpen(schedule)}
            type="button"
          >
            {scheduleLabel(schedule)}
          </button>
        </li>
      ))}
    </ul>
  );
}
