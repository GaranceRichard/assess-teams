# AUTH-002 — Récupérer son accès après oubli du mot de passe

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/01b-passwords.md) · [Preuves auth](../preuves.md#auth).

## Diagnostic contradictoire

- **Identifiant / parent unique :** AUTH-002 / FEAT-001 — Accéder de manière authentifiée au produit.
- **Valeur métier recherchée :** Récupérer son accès sans intervention d’Admin ni révélation de l’existence d’un compte.
- **Comportement attendu :** Récupération non énumérante, token 1 h, changement unique et invalidation des sessions. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Récupération non énumérante, token 1 h, changement unique et invalidation des sessions.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#auth) ; Réalisé ; date canonique 2026-10-08. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** La file de récupération préexiste à MEP-004 ; SMTP cible reste MEP-034.
- **Prérequis déclarés :** **Dépendances / priorité :** `AUTH-001` / P0. Le [contrat source](../../../../../docs/backlog/source/01b-passwords.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-10-08. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
