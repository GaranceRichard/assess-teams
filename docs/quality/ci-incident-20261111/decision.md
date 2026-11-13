# Décision approuvée le 12 novembre 2026

Le GO utilisateur approuve le diagnostic et autorise uniquement la correction de l’orchestration
SQLite, avec événements observables, assertions conservées et aucun timeout augmenté.
La proposition initiale d’utiliser 5000 ms dans le scénario positif n’est **pas retenue**.
Tous les pairs conservent `busy_timeout=100` ; le produit reste à 5000 ms.

## Traitement retenu

| Cause | Correction / action | Fichiers impactés | Non-régression | Risque | Validation requise |
| --- | --- | --- | --- | --- | --- |
| Infrastructure APT/DNS du 11 | Prendre en compte la qualification verte du 12 ; aucun rerun ancien indispensable ni changement CI | Dossier incident seulement | Deux installations et parcours du run `43254284873` réussis | Le composant DNS précis reste inconnu ; récidive possible | Métadonnées, 16 jobs et artefact du SHA `2fedab80…` vérifiés |
| Course de l’orchestration positive | Suspendre le concurrent avant son écriture native ; le reprendre après observation du 201 du détenteur, donc après commit | README préalablement ; `sqlite_contention_cases.py`, `sqlite_contention_process.py` et helper de non-régression ; matrice opérationnelle | Un parent adversarial exige l’événement de suspension puis le commit avant de libérer chaque pair ; rouge sur l’ancien protocole, vert sur le nouveau, en development/production | Le passage de relais ne mesure plus une attente native réussie sous verrou ; cette limite doit être explicite | Tests ciblés, répétitions bornées, backend complet et coverage via plan d’impact, CI exacte |
| Refus et atomicité | Aucun changement du produit ni du protocole négatif | Assertions et réglages existants conservés | `apis_timeout`, rollback/upgrade/replay/intégrité et configuration dans les deux modes | Saturation ou disque lent peuvent encore faire échouer les gardes bornées ; ne pas les masquer | Suite backend obligatoire |
| Cause SQLite historique inconnue | Conserver « Indéterminé » | Rapport seulement | Distinguer toutes les observations expérimentales du run historique | Un succès ultérieur n’explique pas le 11 | Ne revendiquer aucune correction applicative |

## Limites de publication

Aucun skip, xfail, retry masquant, hausse de timeout, changement de seuil/couverture,
modification de workflow, réouverture de PBI ou évolution MESS n’est autorisé.
La nouvelle campagne exhaustive du 12 évite une relance historique inutile.
Après ciblés : plan d’impact obligatoire, `npm run publish`, pre-push bloquant, CI du SHA exact,
fast-forward sûr du principal et nettoyage du seul chantier terminé.
La qualification exhaustive de `2fedab80…` et la CI sélective du correctif restent deux preuves distinctes.
