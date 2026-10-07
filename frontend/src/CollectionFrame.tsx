import type { ReactNode } from "react";
import { Pagination } from "./Pagination";

type Props = {
  children: ReactNode;
  page: number;
  count: number;
  pageSize?: number;
  loading?: boolean;
  onChange: (page: number) => void;
};

export function CollectionFrame({
  children,
  page,
  count,
  pageSize = 20,
  loading = false,
  onChange,
}: Props) {
  return (
    <div className="collection-frame" aria-busy={loading}>
      <div
        className="collection-scroll"
        tabIndex={0}
        role="region"
        aria-label="Contenu de la collection"
      >
        {children}
      </div>
      {count > pageSize ? (
        <Pagination
          page={page}
          count={count}
          pageSize={pageSize}
          busy={loading}
          onChange={onChange}
        />
      ) : (
        <footer className="pagination">
          {loading
            ? "Lecture en cours…"
            : `${count} élément${count > 1 ? "s" : ""}`}
        </footer>
      )}
    </div>
  );
}
