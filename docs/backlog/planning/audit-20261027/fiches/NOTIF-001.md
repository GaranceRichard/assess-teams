# NOTIF-001 — Remettre les notifications de planification par courriel

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/04-suivi-et-pilotage.md) · [Preuves notifications](../preuves.md#notifications).

## Diagnostic contradictoire

- **Identifiant / parent unique :** NOTIF-001 / FEAT-030 — Remettre une notification sans coupler le métier au canal.
- **Valeur métier recherchée :** Informer le responsable des échéances planifiées en séparant le succès métier de la remise.
- **Comportement attendu :** Intention de confirmation/échéance et remise courriel, récurrence calendaire. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Intention de confirmation/échéance et remise courriel, récurrence calendaire.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#notifications) ; Réalisé ; date canonique 2026-09-28. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** MEP-004 a rendu la file durable ; pas de fenêtre de rappel ni canal supplémentaire.
- **Prérequis déclarés :** **Dépendances / priorité :** `PLAN-001` / P1. Le [contrat source](../../../../../docs/backlog/source/04-suivi-et-pilotage.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-09-28. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
