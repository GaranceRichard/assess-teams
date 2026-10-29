# JOURNAL-002 — Consulter les logs applicatifs

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/06-journaux.md) · [Preuves journaux](../preuves.md#journaux).

## Diagnostic contradictoire

- **Identifiant / parent unique :** JOURNAL-002 / FEAT-040 — Consulter les Logs.
- **Valeur métier recherchée :** Diagnostiquer les événements applicatifs de son périmètre sans exposer de secret.
- **Comportement attendu :** Logs HTTP nettoyés, dix filtres et corrélation ; logs système Superadmin. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Logs HTTP nettoyés, dix filtres et corrélation ; logs système Superadmin.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#journaux) ; Réalisé ; date canonique 2026-09-29. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** MEP-038 contrôle les accès indirects ; aucun collecteur à refaire en MESS.
- **Prérequis déclarés :** **Dépendances / preuves :** `FEAT-004` ; modèle, API `/api/admin/logs/`, UI `/logs`, OpenAPI et tests backend/React/E2E. Le [contrat source](../../../../../docs/backlog/source/06-journaux.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-09-29. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
