import type { Team } from "./teams";

type Props = {
  team: Team;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function TeamDeleteDialog({ team, onCancel, onConfirm }: Props) {
  return (
    <div className="team-dialog-backdrop">
      <section
        aria-labelledby="team-delete-title"
        aria-modal="true"
        className="team-dialog"
        role="dialog"
      >
        <h2 id="team-delete-title">Supprimer l’équipe ?</h2>
        <p>{team.name} sera retirée des équipes actives.</p>
        <div className="team-dialog-actions">
          <button className="secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="team-danger" onClick={() => void onConfirm()}>
            Valider la suppression
          </button>
        </div>
      </section>
    </div>
  );
}
