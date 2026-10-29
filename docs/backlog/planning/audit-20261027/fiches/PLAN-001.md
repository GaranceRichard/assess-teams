# PLAN-001 — Planifier un modèle local pour une équipe

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/03-evaluations.md) · [Preuves planning](../preuves.md#planning).

## Diagnostic contradictoire

- **Identifiant / parent unique :** PLAN-001 / FEAT-017 — Configurer la fréquence et la première échéance.
- **Valeur métier recherchée :** Rendre une échéance et sa responsabilité explicites pour une équipe et un modèle locaux.
- **Comportement attendu :** Planification locale, responsable actif, quatre modes, échéances et replanification ponctuelle. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Planification locale, responsable actif, quatre modes, échéances et replanification ponctuelle.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#planning) ; Réalisé ; date canonique 2026-09-29. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** NOTIF-001/MEP-004 avancent le calendrier à la mise en file ; finalisation ne le pilote pas.
- **Prérequis déclarés :** **Dépendances / priorité / preuves :** `TEAM-001`, `EVAL-001`, `FEAT-004` / P0 / migrations, OpenAPI, tests API, React et E2E. Le [contrat source](../../../../../docs/backlog/source/03-evaluations.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-09-29. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
