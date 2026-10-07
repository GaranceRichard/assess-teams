type Props = {
  page: number;
  count: number;
  pageSize?: number;
  busy?: boolean;
  label?: string;
  onChange: (page: number) => void;
};

export function Pagination({
  page,
  count,
  pageSize = 20,
  busy = false,
  label = "Pagination",
  onChange,
}: Props) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <nav className="pagination" aria-label={label}>
      <button
        className="secondary"
        disabled={busy || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Précédent
      </button>
      <span aria-live="polite">
        Page {page} / {pages} · {count} éléments
      </span>
      <button
        className="secondary"
        disabled={busy || page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Suivant
      </button>
    </nav>
  );
}
