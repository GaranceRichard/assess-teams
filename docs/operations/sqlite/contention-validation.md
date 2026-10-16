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

La publication utilise `npm run publish` et attend la CI du SHA applicatif exact.
Le registre canonique reste ouvert jusqu’à cette confirmation ; sa clôture et les vues dérivées seront
publiées ensuite avec le lien CI. Aucune qualification cible MESS ni GO n’est déduit de ces campagnes.
