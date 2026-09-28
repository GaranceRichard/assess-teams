import type { SessionUser } from "./auth";
import { JournalPage } from "./JournalPage";
import { listActivityEntries } from "./journals";

export function ActivityJournalPage({ actor }: { actor: SessionUser }) {
  return (
    <JournalPage
      title="Journal d’activité"
      eyebrow="Actions réussies"
      intro="Qui a fait quoi, dans quelle organisation, sur quelle équipe et quand."
      isSuperadmin={actor.is_superuser}
      load={listActivityEntries}
      actionFor={(entry) => entry.description}
    />
  );
}
