# MEP-010 — Preuves de validation

[Diagnostic, corrections et protocole](contention.md) ; paramètres et mesures MEP-039 réutilisés.

## Non-régression avant correction

Sur la base `0520f2d`, les trois scénarios `apis_timeout`, `retry_commit` et `retry_rechecks`
(settings développement) échouent sans les corrections des fonctions et du handler.
Les versions initiales de ces trois fichiers ont été réinstallées temporairement dans le worktree,
puis les corrections restaurées dans un `finally` avant la suite des validations.
La campagne inversée attend exactement trois échecs ; aucune modification conservée par ce contrôle.

## Qualification sur fichier

Onze cas par environnement développement/production, avec processus distincts et fichiers jetables :
API/API, API/worker, workers récupération/échéance, attente résolue, verrou prolongé,
refus au commit, rollback total, reprises épuisées, relecture des préconditions et non-rejeu après SMTP.
La matrice d’invariants et les commandes sont dans le [protocole](contention.md#qualification-reproductible).
Les paramètres de production sont validés avant remplacement local du seul transport réseau.

## Campagne exhaustive initiale du 2026-10-15

`npm run quality:targeted` sélectionne l’exhaustif en raison de l’impact SQLite/transactions.
Les quatre contrôles passent : repository (68 s), backend (682 s), frontend (49 s), E2E (376 s).
Le plan et les métriques du worktree associent ces résultats aux entrées effectives de la base `0520f2d`.

- Backend : 1 061 cas collectés, campagne réussie ; couverture lignes/branches combinée **97,24 %**.
- Nouveau module de contention : couverture combinée **94,37 %**.
- Frontend : suite complète réussie ; lignes 97,30 %, branches 94,78 %, fonctions 96,63 %, instructions 96,42 %.
- E2E : campagnes applicative et démo complètes réussies, avec builds et typecheck existants.
- Ruff lint/format, migrations, contrats/OpenAPI, secrets, limite de 200 lignes et socle qualité conformes.
- Après fin de campagne : un seul `backend/.coverage`, aucun fragment `.coverage.*` tardif.
  Le rapport se lit avec le même `--rcfile=../.coveragerc` que la campagne.

Les tests MEP-003/039/004 sont inclus ; leurs mesures de capacité ne sont pas relancées hors non-régression.
Les preuves locales ont une validité bornée : après la reprise du 2026-10-16, le pré-push doit les
réévaluer et réexécuter les contrôles expirés avant publication. Aucun seuil ni gate n’est contourné.

## Intégration et clôture

Publication applicative du **2026-10-16**, depuis le worktree et la branche dédiés via `npm run publish` :

- SHA intégré : `6ed187e5fc3978431e9926d8a4851f65519f556b` ; source branche de chantier, destination main.
- Pré-push : quatre contrôles frais réussis, sans contournement : dépôt 61 s, backend 769 s,
  frontend 97 s et E2E 422 s. 1 061 tests backend, 393 frontend, 64 E2E applicatifs et 9 démo passent.
- Couvertures inchangées : backend 97,24 % ; quatre métriques frontend toutes supérieures à 90 %.
- Un seul fichier `.coverage` consolidé après cette réexécution, sans fragment auxiliaire tardif.
- [CI indépendante du SHA exact — run 38897236783](https://github.com/GaranceRichard/assess-teams/actions/runs/38897236783) : **success**.
  Trois shards backend, deux shards E2E, fusion stricte de couverture et gate final réussis.
- Checkout principal vérifié propre et avancé exclusivement en fast-forward au SHA intégré.

Le registre MEP-010 est clôturé après ces confirmations, avec date du 2026-10-16 et vues dérivées alignées.
La clôture documentaire suit le même circuit `npm run publish`, avec le plan documentaire seul.
Le succès final de cette publication reste exigé avant nettoyage du seul worktree et de la branche MEP-010.
Aucune qualification cible MESS ni GO n’est déduit de ces campagnes ; MEP-040 demeure ouvert.
