import { useEffect, useState, type ReactNode } from "react";

import { JournalEntries } from "./JournalEntries";
import { JournalFilters } from "./JournalFilters";
import type {
  JournalEntry,
  JournalFilters as FilterValues,
  JournalPage as PageData,
} from "./journals";
import { listOrganizations, type Organization } from "./organizations";
import "./journals.css";

const emptyFilters: FilterValues = {
  date: "",
  organizationId: "",
  player: "",
  team: "",
  level: "",
  source: "",
};

type Props<T extends JournalEntry> = {
  title: string;
  eyebrow: string;
  intro: string;
  isSuperadmin: boolean;
  load: (filters: FilterValues, page: number) => Promise<PageData<T>>;
  actionFor: (entry: T) => string;
  detailsFor?: (entry: T) => ReactNode;
  renderEntries?: (entries: T[]) => ReactNode;
  showLogFilters?: boolean;
};

export function JournalPage<T extends JournalEntry>({
  title,
  eyebrow,
  intro,
  isSuperadmin,
  load,
  actionFor,
  detailsFor,
  renderEntries,
  showLogFilters = false,
}: Props<T>) {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageData<T> | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSuperadmin) {
      void listOrganizations()
        .then(setOrganizations)
        .catch(() => setOrganizations([]));
    }
  }, [isSuperadmin]);

  useEffect(() => {
    load(filters, page)
      .then((nextData) => {
        setData(nextData);
        setError("");
      })
      .catch(() => setError("Impossible de charger le journal."));
  }, [filters, load, page]);

  function applyFilters() {
    setPage(1);
    setFilters(draft);
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  }

  return (
    <section className="journal-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="journal-intro">{intro}</p>
      <JournalFilters
        value={draft}
        organizations={organizations}
        showOrganizations={isSuperadmin}
        showLogFilters={showLogFilters}
        onChange={setDraft}
        onApply={applyFilters}
        onClear={clearFilters}
      />
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : data ? (
        <>
          {renderEntries ? (
            renderEntries(data.results)
          ) : (
            <JournalEntries
              entries={data.results}
              actionFor={actionFor}
              detailsFor={detailsFor}
            />
          )}
          <nav
            className="journal-pagination"
            aria-label="Pagination du journal"
          >
            <button
              className="secondary"
              disabled={!data.previous}
              onClick={() => setPage((current) => current - 1)}
            >
              Précédent
            </button>
            <span>
              Page {page} · {data.count} entrée{data.count > 1 ? "s" : ""}
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
