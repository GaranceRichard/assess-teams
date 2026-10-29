# USER-004 — Désactiver et réactiver un utilisateur

Proposition analytique du 2026-10-27, base `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
[Retour matrice](../matrice.md) · [Source canonique](../../../../../docs/backlog/source/01-identites.md) · [Preuves identites](../preuves.md#identites).

## Diagnostic contradictoire

- **Identifiant / parent unique :** USER-004 / FEAT-002 — Administrer le cycle de vie d’une identité.
- **Valeur métier recherchée :** Retirer/rendre l’accès sans perdre l’historique ni laisser une organisation sans Admin actif.
- **Comportement attendu :** Désactiver/réactiver sans suppression ; dernier Admin actif et responsabilité à réaffecter protégés. Critères/refus complets : source canonique ci-dessus, conservée.
- **Capacités effectivement présentes :** Désactiver/réactiver sans suppression ; dernier Admin actif et responsabilité à réaffecter protégés.
- **Tests et livraison existants :** [code, tests nommés, contrats et rapports](../preuves.md#identites) ; Réalisé ; date canonique 2026-10-06. Un test présent n’est pas un résultat d’exécution nouveau.
- **Couverture réelle (conclusion, jamais statut) :** Déjà couvert.
- **Écart réel :** Aucun écart démontré dans le périmètre propre du PBI ; les capacités plus larges de la Feature ne sont pas réputées livrées.
- **Recouvrements :** ORG-005 et MEP-040 partagent l’invariant ; aucune nouvelle identité à recréer.
- **Prérequis déclarés :** **Dépendances :** `FEAT-001`, `FEAT-004` ; les détails/noms de `USER-002/003` restent ouverts. Le [contrat source](../../../../../docs/backlog/source/01-identites.md) prévaut ; les graphes de Feature ne constituent pas des blocages supplémentaires implicites.
- **Décision ou arbitrage :** Aucune décision nécessaire pour conserver l’acquis limité ; les extensions restent soumises aux arbitrages de leur Feature.
- **Statut actuel et traitement proposé :** Réalisé ; date canonique 2026-10-06. Conserver statut/date et preuves ; aucune réécriture des critères ni nouvelle implémentation recommandée.

Les six questions de préparation s’appliquent au prochain delta éventuel ; aucun travail voisin n’est créé
pour prolonger artificiellement ce PBI réalisé. Ses critères déjà précis ne sont pas réécrits par l’audit.
