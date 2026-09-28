import type { SessionUser } from "./auth";
import { JournalPage } from "./JournalPage";
import { listErrorEntries, type ErrorEntry } from "./journals";

function ErrorDetails({ entry }: { entry: ErrorEntry }) {
  return (
    <details className="error-details">
      <summary>Détails</summary>
      <dl>
        <dt>Catégorie</dt>
        <dd>{entry.category}</dd>
        <dt>Message</dt>
        <dd>{entry.message}</dd>
        <dt>Corrélation</dt>
        <dd>{entry.correlation_id}</dd>
      </dl>
    </details>
  );
}

export function ErrorJournalPage({ actor }: { actor: SessionUser }) {
  return (
    <JournalPage
      title="Journal des erreurs"
      eyebrow="Opérations en échec"
      intro="Erreurs fonctionnelles et applicatives nettoyées, sans données sensibles."
      isSuperadmin={actor.is_superuser}
      load={listErrorEntries}
      actionFor={(entry) => entry.operation}
      detailsFor={(entry) => <ErrorDetails entry={entry} />}
    />
  );
}
