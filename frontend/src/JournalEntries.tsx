import { formatDate, formatTime } from "./dateTime";
import type { JournalEntry } from "./journals";

type Props<T extends JournalEntry> = {
  entries: T[];
  actionFor: (entry: T) => string;
};

function dayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function JournalEntries<T extends JournalEntry>({
  entries,
  actionFor,
}: Props<T>) {
  if (entries.length === 0) {
    return (
      <p className="journal-empty">Aucune entrée ne correspond aux filtres.</p>
    );
  }
  const groups = entries.reduce<T[][]>((days, entry) => {
    const last = days.at(-1);
    if (!last || dayKey(last[0].created_at) !== dayKey(entry.created_at)) {
      days.push([entry]);
    } else {
      last.push(entry);
    }
    return days;
  }, []);

  return (
    <div className="journal-days">
      {groups.map((day) => (
        <section key={dayKey(day[0].created_at)} className="journal-day">
          <h2>{formatDate(day[0].created_at)}</h2>
          <ol>
            {day.map((entry) => (
              <li key={entry.id}>
                <div className="journal-line">
                  <time dateTime={entry.created_at}>
                    {formatTime(entry.created_at)}
                  </time>{" "}
                  <span>{entry.organization_name || "SYSTÈME"}</span>
                  <span>{entry.actor_name || "—"}</span>
                  <span>{entry.team_name || "—"}</span>
                  <strong>{actionFor(entry)}</strong>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
