import { type EvaluationSchedule, scheduleLabels } from "./planning";

type Props = { schedules: EvaluationSchedule[] };

export function ScheduleList({ schedules }: Props) {
  if (schedules.length === 0) {
    return <p className="planning-empty">Aucune évaluation planifiée.</p>;
  }

  return (
    <ul className="schedule-list">
      {schedules.map((schedule) => (
        <li key={schedule.id}>
          <div>
            <strong>{schedule.team_name}</strong>
            <span>{schedule.evaluation_name}</span>
          </div>
          <div className="schedule-cadence">
            <strong>{scheduleLabels[schedule.mode]}</strong>
            <span>Première date : {schedule.first_due_date}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
