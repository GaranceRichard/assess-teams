import { useId, useState } from "react";

import { Modal } from "./Modal";
import "./results-score-guide.css";

export function ResultsScoreGuide() {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="results-score-help"
        aria-haspopup="dialog"
        aria-label="Scores 0–10 : mode d’emploi"
        onClick={() => setOpen(true)}
      >
        <span className="results-score-help-more">Scores </span>0–10
        <span className="results-score-help-more"> : mode d’emploi</span>
      </button>
      {open && (
        <Modal
          backdropClassName="dialog-backdrop"
          labelledBy={id}
          onClose={() => setOpen(false)}
          closeOnBackdrop
        >
          <section className="dialog results-score-guide">
            <div className="results-score-guide-heading">
              <h2 id={id}>Comprendre les résultats</h2>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
            <h3>Notes par critère</h3>
            <p>
              Chaque score est une note enregistrée, entière de 0 à 10 : 0 est
              le minimum, 10 le maximum. Son sens dépend du critère et des
              repères de la version du modèle utilisée. Aucun score global ni
              moyenne n’est calculé ici.
            </p>
            <h3>Zéro et absence</h3>
            <p>
              0/10 est une note réellement mesurée. Dans le tableau historique,
              une cellule vide signifie aucune observation à ce rang pour cette
              équipe, jamais une note zéro. Chaque colonne suit ses propres
              dates : une même ligne ne désigne pas une date commune.
            </p>
            <h3>Quels résultats sont les plus récents ?</h3>
            <p>
              Le radar retient la version au numéro le plus élevé ayant des
              résultats accessibles, puis la dernière passation complétée par
              équipe sur cette version. La date affichée est la date de
              complétion initiale ; une révision des notes ne déplace pas cette
              date. L’échéance et la date de création ne déterminent pas ce
              choix.
            </p>
            <h3>Limites de l’historique</h3>
            <p>
              Seules les observations accessibles d’un même modèle et critère
              explicitement relié entre versions sont réunies. Les critères
              ajoutés ou retirés ne sont pas reconstitués ; les anciennes
              versions sans lien démontré restent séparées. Les textes ou
              repères peuvent changer entre versions : un lien ne garantit pas
              un sens identique des notes. Les segments relient les observations
              disponibles et ne prouvent pas une progression continue entre deux
              dates. Aucune tendance ni valeur intermédiaire n’est calculée.
            </p>
          </section>
        </Modal>
      )}
    </>
  );
}
