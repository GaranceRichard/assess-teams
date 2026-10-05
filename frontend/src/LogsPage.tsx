import { useEffect, useState } from "react";

import type { SessionUser } from "./auth";
import { LogEntries } from "./LogEntries";
import { LogFilters } from "./LogFilters";
import type { JournalPage, LogEntry } from "./journals";
import { emptyLogFilters, listHttpLogs } from "./logsApi";
import { useLogOptions } from "./useLogOptions";
import "./journals.css";
import "./logs.css";

export function LogsPage({ actor }: { actor: SessionUser }) {
  const [draft, setDraft] = useState(emptyLogFilters);
  const [filters, setFilters] = useState(emptyLogFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<JournalPage<LogEntry> | null>(null);
  const [error, setError] = useState("");
  const options = useLogOptions(draft.organization, actor.is_superuser);

  useEffect(() => {
    let active = true;
    listHttpLogs(filters, page)
      .then((next) => {
        if (active) {
          setData(next);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Impossible de charger les logs.");
      });
    return () => {
      active = false;
    };
  }, [filters, page]);

  function apply() {
    setPage(1);
    setFilters({ ...draft, organization: options.selected });
  }
  function clear() {
    setDraft(emptyLogFilters);
    setFilters(emptyLogFilters);
    setPage(1);
  }

  return (
    <section className="journal-page">
      <p className="eyebrow">Exploitation et diagnostic</p>
      <h1>Logs</h1>
      <p className="journal-intro">
        Journal technique HTTP. Les détails d’erreur restent dans les logs
        serveur.
      </p>
      <LogFilters
        value={draft}
        options={options}
        isSuperadmin={actor.is_superuser}
        onChange={setDraft}
        onApply={apply}
        onClear={clear}
      />
      {options.error && (
        <p className="form-error" role="alert">
          {options.error}
        </p>
      )}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : data ? (
        <>
          <LogEntries entries={data.results} />
          <nav className="journal-pagination" aria-label="Pagination des logs">
            <button
              className="secondary"
              disabled={!data.previous}
              onClick={() => setPage((current) => current - 1)}
            >
              Précédent
            </button>
            <span>
              Page {page} · {data.count} entrées
            </span>
            <button
              className="secondary"
              disabled={!data.next}
              onClick={() => setPage((current) => current + 1)}
            >
              Suivant
            </button>
          </nav>
        </>
      ) : (
        <p>Chargement…</p>
      )}
    </section>
  );
}
