import type { LogEntry } from "./journals";

function dateTime(value: string, full = false): string {
  return new Intl.DateTimeFormat("fr-CA", {
    dateStyle: full ? "full" : "short",
    timeStyle: full ? "long" : "medium",
  }).format(new Date(value));
}

function shown(value: string | undefined): string {
  return value || "—";
}

function LogDetails({ entry }: { entry: LogEntry }) {
  return (
    <details className="log-details">
      <summary>Détails</summary>
      <dl>
        <dt>Date/heure complète</dt>
        <dd>{dateTime(entry.created_at, true)}</dd>
        <dt>Niveau</dt>
        <dd>{entry.level}</dd>
        <dt>Source</dt>
        <dd>{entry.source}</dd>
        <dt>Organisation</dt>
        <dd>{shown(entry.organization_name)}</dd>
        <dt>Utilisateur</dt>
        <dd>{shown(entry.actor_name)}</dd>
        <dt>Équipe</dt>
        <dd>{shown(entry.team_name)}</dd>
        <dt>Message</dt>
        <dd>{entry.message}</dd>
        <dt>Opération</dt>
        <dd>{shown(entry.operation)}</dd>
        <dt>Catégorie</dt>
        <dd>{shown(entry.category)}</dd>
        <dt>Correlation ID</dt>
        <dd>{entry.correlation_id}</dd>
      </dl>
    </details>
  );
}

export function LogEntries({ entries }: { entries: LogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="journal-empty">Aucun log ne correspond aux filtres.</p>
    );
  }
  return (
    <div className="log-table-wrap">
      <table className="log-table">
        <thead>
          <tr>
            <th>Date/heure</th>
            <th>Méthode</th>
            <th>Statut</th>
            <th>Niveau</th>
            <th>Source</th>
            <th>Organisation</th>
            <th>Utilisateur</th>
            <th>Équipe</th>
            <th>Évaluation</th>
            <th>Opération/message</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={`log-row log-row--${entry.level.toLowerCase()}`}
            >
              <td>
                <time dateTime={entry.created_at}>
                  {dateTime(entry.created_at)}
                </time>
              </td>
              <td>{shown(entry.method)}</td>
              <td>{entry.status_code ?? "—"}</td>
              <td>
                <strong className="log-level">{entry.level}</strong>
              </td>
              <td>{entry.source}</td>
              <td>{shown(entry.organization_name)}</td>
              <td>{shown(entry.actor_name)}</td>
              <td>{shown(entry.team_name)}</td>
              <td>{shown(entry.evaluation_name)}</td>
              <td>
                <span>{entry.message}</span>
                <p>{shown(entry.operation)}</p>
                <LogDetails entry={entry} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
