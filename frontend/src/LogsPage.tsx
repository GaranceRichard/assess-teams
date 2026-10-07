import { CollectionFrame } from "./CollectionFrame";
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JournalPage<LogEntry> | null>(null);
  const [error, setError] = useState("");
  const options = useLogOptions(draft.organization, actor.is_superuser);

  useEffect(() => {
    let active = true;
    listHttpLogs(filters, page)
      .then((next) => {
        if (active) {
          setLoading(false);
          setData(next);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger les logs.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [filters, page]);

  function apply() {
    setLoading(true);
    setPage(1);
    setFilters({ ...draft, organization: options.selected });
  }
  function clear() {
    setDraft(emptyLogFilters);
    setFilters({ ...emptyLogFilters });
    setLoading(true);
    setPage(1);
  }

  return (
    <section className="journal-page product-page">
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
      <CollectionFrame
        page={page}
        count={data?.count ?? 0}
        loading={loading}
        onChange={(value) => {
          setLoading(true);
          setPage(value);
        }}
      >
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : data ? (
          <>
            <LogEntries entries={data.results} />
          </>
        ) : (
          <p>Chargement…</p>
        )}
      </CollectionFrame>
    </section>
  );
}
