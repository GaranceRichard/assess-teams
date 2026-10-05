import type { JournalEntry } from "./journals";

type Props<T extends JournalEntry> = {
  entries: T[];
  actionFor: (entry: T) => string;
};

function dayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "long" }).format(
    new Date(value),
  );
}

function timeLabel(value: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
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
          <h2>{dayLabel(day[0].created_at)}</h2>
          <ol>
            {day.map((entry) => (
              <li key={entry.id}>
                <div className="journal-line">
                  <time dateTime={entry.created_at}>
                    {timeLabel(entry.created_at)}
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
