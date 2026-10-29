# EVAL-001 — Administrer un modèle local et ses questions ordonnées

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/03-evaluations.md) · [Preuves modeles](../preuves.md#modeles).

## Diagnostic contradictoire

- **Identifiant / parent unique :** EVAL-001 / FEAT-011 — Composer un modèle d’évaluation ordonné.
- **Valeur métier recherchée :** Préparer un questionnaire local administrable dans un ordre stable.
- **Comportement attendu :** CRUD local de brouillons et questions en ordre d’ajout ; scope Admin/Superadmin. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** CRUD local de brouillons et questions en ordre d’ajout ; scope Admin/Superadmin.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#modeles) ; Réalisé ; date canonique 2026-09-28. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** Lifecycle EVAL-002 et versions EVAL-003 ajoutés ensuite ; réordre utilisateur non livré.
- **Prérequis déclarés :** **Dépendances / priorité / preuves :** `FEAT-004` / P0 / migrations Assessments, OpenAPI, tests backend, React et E2E. Le [contrat source](../../../../../docs/backlog/source/03-evaluations.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-09-28. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
