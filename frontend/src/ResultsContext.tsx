import type { ReactNode } from "react";

export function ResultsContext({
  children,
  version,
}: {
  children: ReactNode;
  version?: number;
}) {
  return (
    <section className="results-context" aria-label="Contexte des résultats">
      {children}
      {version !== undefined && (
        <p className="results-note">
          <strong>Version radar : v{version}</strong> · Version consultée
        </p>
      )}
    </section>
  );
}
