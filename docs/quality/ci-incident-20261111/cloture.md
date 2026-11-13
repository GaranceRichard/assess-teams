# Clôture de l’intervention limitée — 13 novembre 2026

## Diagnostic

- Playwright du 11 : incident d’infrastructure pendant la résolution APT ; aucun parcours exécuté.
- La qualification exhaustive du 12 sur `2fedab80…` est verte et son artefact exact a été vérifié.
  Ce succès établit une campagne ultérieure réussie, pas une correction de la panne DNS.
- SQLite du 11 : cause historique **indéterminée**, sans défaut applicatif démontré.
- La fragilité temporelle du test a été démontrée séparément, avant toute correction.

## Correction démontrée

Le scénario positif utilise les événements `write_attempt`, `write_parked`, le résultat 201
validé du détenteur, puis `continue` pour reprendre le concurrent à sa frontière SQL.
La non-régression avec parent adversarial est rouge sur le protocole précédent puis verte
sur le protocole corrigé, sous Windows et Linux, en development et production.
Les cinq séries Linux bornées passent leurs 30 cas, y compris les refus `apis_timeout`.
Tous les délais, assertions métier/HTTP/transactions/intégrité et seuils sont conservés.
Aucun code applicatif ni workflow Playwright n’est modifié.

Le [lot technique publié](publication.md) est `f400a8e98b0b363f1b10ccca6d4381781390234e`.
Les gates locaux passent : 1 498 tests backend, 97,51 % de couverture, lint/format/migrations.
Le pre-push est passé sans bypass ; la CI exacte `43346012639` est verte et confirme les
huit partitions backend, leur couverture et le gate requis. Aucune campagne exhaustive
supplémentaire ni rerun de l’ancien SHA n’a été déclenché.

## Risques et limites résiduels

Le cas positif qualifie un passage de relais observable ; son SQL concurrent n’entre plus
dans le busy handler avant le commit du détenteur. Il ne constitue pas une nouvelle mesure
d’attente native sous verrou. Les scénarios natifs d’attente/refus et `apis_timeout` restent
présents et sont verts dans la suite complète. Les autres gardes bornées continuent de
signaler un ralentissement excessif ; aucune stabilité absolue du scheduler n’est promise.

Le résolveur exact responsable du 11 et la chronologie SQLite historique restent inconnus.
Aucune correction applicative, capacité cible MESS, décision MESS ni réouverture de PBI
n’est revendiquée. Aucun statut canonique, chantier C04 ou TEAM-003 n’est modifié.

## Livraison documentaire et nettoyage

Cette clôture documentaire doit elle aussi passer `npm run publish` et sa CI exacte avant
succès final de livraison. Son diff ne requiert aucun nouveau test applicatif selon le plan
existant. Après succès, seul le worktree `Assess-teams-ci-20261111` et sa branche
`audit/ci-20261111` sont supprimés ; le principal doit rester propre et à jour en fast-forward.
Les deux conteneurs temporaires propres à l’audit ont déjà été supprimés.
Les extraits et recettes nécessaires restent versionnés ; les caches de travail ne sont pas livrés.
