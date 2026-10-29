# EVAL-002 — Sécuriser le cycle de vie des modèles locaux

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/03a-evaluation-lifecycle.md) · [Preuves modeles](../preuves.md#modeles).

## Diagnostic contradictoire

- **Identifiant / parent unique :** EVAL-002 / FEAT-013 — Publier ou retirer un modèle.
- **Valeur métier recherchée :** Empêcher qu’un référentiel utilisé soit modifié ou choisi à nouveau après retrait.
- **Comportement attendu :** Validation DRAFT→VALIDATED, immutabilité puis archivage ; planification uniquement validée. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Validation DRAFT→VALIDATED, immutabilité puis archivage ; planification uniquement validée.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#modeles) ; Réalisé ; date canonique 2026-10-05. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** FEAT-013 plus large : impact des retraits sur engagements futurs distinct.
- **Prérequis déclarés :** **Dépendances / priorité :** `EVAL-001`, `PLAN-001`, `FEAT-004` / P0. Le [contrat source](../../../../../docs/backlog/source/03a-evaluation-lifecycle.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-10-05. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
