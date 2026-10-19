# MEP-042 — Preuves et revue DoD

Validation du 2026-10-18 ; [contrat et arbitrages](journal-retention.md),
[fiche canonique](../../backlog/source/mess/f03.md). Toutes les entrées sont synthétiques.

## Critères et refus

| Critère | Preuve permanente |
| --- | --- |
| Durées par type, indépendantes | `test_journal_retention_configuration.py` : absence/keep sans échéance, durées techniques positives et borne technique acceptées ; métier toujours protégé |
| Durée invalide refusée | Vide, zéro, négatif, fraction, booléen, notation scientifique, espaces, zéro initial, chiffres non ASCII, dépassement ; types effectifs stricts sans coercition |
| Suppression non autorisée des preuves refusée | Durée finie métier refusée, y compris par surcharge effective ; politique partielle/étendue avec champ d'autorisation rejetée |
| Intégration au démarrage | `test_journal_retention_startup.py` : vrais sous-processus development/production, chargement des variables et vérification du contrat normalisé, refus avant service |
| Pas de contournement par settings dérivés | Surcharges métier finie et technique booléenne refusées par `ready()` dans les deux modes |
| Confidentialité du diagnostic | Entrée invalide synthétique absente de stdout/stderr du processus refusé |
| Conservation effective de l'historique | Test ORM : activités et logs anciens sans organisation conservés intégralement après configuration valide et refus ; zéro requête pendant validation/ready |
| Périmètres, accès et responsabilités | Contrat d'exploitation : deux collections, portée instance incluant global/SET_NULL, accès OS séparé des rôles produit, changements coordonnés et décisions attendues |

Les nombres utilisés dans les tests sont des valeurs synthétiques, jamais une politique MESS.
Le refus métier est volontairement conservatoire tant qu'aucune décision canonique n'autorise sa levée.

## Revue documentaire et applicabilité

README annoncé avant code ; règles agents, charte, DoD, stratégie de tests, fondamentaux,
API/OpenAPI, journaux, inventaire MEP-036, démarrage MEP-009, source F03 et suivi relus.
Contrats journaux et configuration, navigation architecturale et suivi actualisés ; stratégie inchangée.
Règles qualité et seuils conservés ; aucune nouvelle dépendance, couche, table ou migration.
Les deux collecteurs, modèles, API, permissions de lecture et frontend restent les acquis JOURNAL-001/002.

Aucun endpoint ni parcours produit ajouté/modifié : pas de nouveau contrat HTTP ou E2E dédié ;
la non-régression existante reste exécutée selon le plan d'impact conservateur de configuration.
Le schéma OpenAPI et les migrations sont vérifiés par les suites existantes.
Il s'agit d'une nouvelle capacité de configuration, pas d'une correction de bug historique.

La configuration ne prouve pas les ACL d'une installation MESS, une durée réglementaire, une
autorisation de destruction métier, la purge MEP-020 ou le futur chargeur unique MEP-021.
Ces limites sont explicites ; aucun accord d'exploitation réel n'est supposé.

## Livraison

Le PBI reste En cours tant que `npm run publish` n'a pas confirmé la CI du SHA applicatif exact.
Les résultats locaux, le SHA intégré et le run vert seront consignés avant clôture canonique.
Validation ciblée : `npm run quality:targeted -- backend tests/test_journal_retention_configuration.py
tests/test_journal_retention_startup.py` — **62 tests réussis**, Ruff/format et migrations conformes.

`npm run quality:targeted` sélectionne le plan exhaustif pour les settings globaux :
contrôles du dépôt (lignes, secrets, structure, README, hooks/bootstrap et outils qualité),
Ruff/format et absence de migration manquante, puis **1 374 tests backend réussis, couverture 97,40 %**.
Frontend : lint, formatage, typecheck/build et **428 tests réussis** ; couvertures statements 96,42 %,
branches 94,78 %, fonctions 96,63 %, lignes 97,30 %. **66 E2E réels et 9 E2E démo réussis**,
dont `http-logs.spec.ts` et `journals.spec.ts`. Liens locaux et comptages du registre vérifiés.
