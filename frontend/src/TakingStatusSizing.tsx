// Actual status messages reserve their intrinsic maximum without duplicate announcements.
export function TakingStatusSizing() {
  return (
    <span className="taking-status-sizing" aria-hidden="true" inert>
      <span data-text="Choisissez une note de 0 à 10." />
      <span data-text="La note n’a pas été enregistrée. Réessayez avant de continuer." />
      <span data-text="La validation a été refusée. Vos notes restent disponibles ; réessayez." />
    </span>
  );
}
