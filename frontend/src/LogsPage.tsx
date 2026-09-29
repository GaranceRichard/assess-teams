import type { SessionUser } from "./auth";
import { JournalPage } from "./JournalPage";
import { LogEntries } from "./LogEntries";
import { listLogEntries } from "./journals";
import "./logs.css";

export function LogsPage({ actor }: { actor: SessionUser }) {
  return (
    <JournalPage
      title="Logs"
      eyebrow="Exploitation et diagnostic"
      intro="Événements applicatifs nettoyés. Les détails techniques restent dans les logs serveur."
      isSuperadmin={actor.is_superuser}
      load={listLogEntries}
      actionFor={(entry) => entry.message}
      renderEntries={(entries) => <LogEntries entries={entries} />}
      showLogFilters
    />
  );
}
