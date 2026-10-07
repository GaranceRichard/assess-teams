import { CollectionFrame } from "./CollectionFrame";
import { useEffect, useState } from "react";

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
};

type Props<T extends JournalEntry> = {
  title: string;
  eyebrow: string;
  intro: string;
  isSuperadmin: boolean;
  load: (filters: FilterValues, page: number) => Promise<PageData<T>>;
  actionFor: (entry: T) => string;
};

export function JournalPage<T extends JournalEntry>({
  title,
  eyebrow,
  intro,
  isSuperadmin,
  load,
  actionFor,
}: Props<T>) {
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
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
    let active = true;
    load(filters, page).then(
      (nextData) => {
        if (active) {
          setData(nextData);
          setError("");
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setError("Impossible de charger le journal.");
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [filters, load, page]);

  function applyFilters() {
    setLoading(true);
    setPage(1);
    setFilters({ ...draft });
  }

  function clearFilters() {
    setDraft(emptyFilters);
    setFilters({ ...emptyFilters });
    setLoading(true);
    setPage(1);
  }

  return (
    <section className="journal-page product-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="journal-intro">{intro}</p>
      <JournalFilters
        value={draft}
        organizations={organizations}
        showOrganizations={isSuperadmin}
        onChange={setDraft}
        onApply={applyFilters}
        onClear={clearFilters}
      />
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
            <JournalEntries entries={data.results} actionFor={actionFor} />
          </>
        ) : (
          <p>Chargement…</p>
        )}
      </CollectionFrame>
    </section>
  );
}
