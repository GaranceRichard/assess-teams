import { formatDateTime } from "./dateTime";
import type { DashboardActivity as Activity } from "./dashboard";

export function DashboardActivity({
  events,
  global,
}: {
  events: Activity[];
  global: boolean;
}) {
  if (events.length === 0)
    return <p>Aucune activité récente dans votre périmètre.</p>;
  return (
    <ol className="dashboard-activity" aria-label="Dernières activités">
      {events.map((event) => (
        <li key={`${event.run_id}-${event.type}`}>
          <div>
            <strong>
              {event.type === "completed"
                ? "Évaluation terminée"
                : "Évaluation révisée"}
            </strong>
            <time dateTime={event.occurred_at}>
              {formatDateTime(event.occurred_at)}
            </time>
          </div>
          {global && <p>Organisation : {event.organization_name}</p>}
          <p>
            {event.team_name} · {event.model_name} · v{event.version}
          </p>
          {event.author_name && <p>Par {event.author_name}</p>}
        </li>
      ))}
    </ol>
  );
}
