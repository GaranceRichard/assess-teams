# MEP-042 — Preuves et revue DoD

Validations des 2026-10-18 et 2026-10-19 ; [contrat et arbitrages](journal-retention.md),
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

Le PBI est clôturé le 2026-10-19 après intégration de `72477e4ede17e1657f56f2f59253f3140eb18568`
et [CI complète verte, tentative 2](https://github.com/GaranceRichard/assess-teams/actions/runs/39248513093/attempts/2).
Validation ciblée : `npm run quality:targeted -- backend tests/test_journal_retention_configuration.py
tests/test_journal_retention_startup.py` — **62 tests réussis**, Ruff/format et migrations conformes.

`npm run quality:targeted` sélectionne le plan exhaustif pour les settings globaux :
contrôles du dépôt (lignes, secrets, structure, README, hooks/bootstrap et outils qualité),
Ruff/format et absence de migration manquante, puis **1 386 tests backend réussis, couverture 97,40 %**
sur le candidat resynchronisé ; le module `config/journal_retention.py` atteint **100 %**.
Frontend : lint, formatage, typecheck/build et **428 tests réussis** ; couvertures statements 96,42 %,
branches 94,78 %, fonctions 96,63 %, lignes 97,30 %. **66 E2E réels et 9 E2E démo réussis**,
dont `http-logs.spec.ts` et `journals.spec.ts`. Liens locaux et comptages du registre vérifiés.
Recomptage global : 25 PBI fonctionnels et 9 MESS réalisés, soit 34/96 (35 %), 61 ouverts et 1 bloqué.
La synthèse omettait quatre réalisations fonctionnelles déjà canoniques ; leurs statuts ne sont pas modifiés.

Revue renouvelée après intégration du pipeline `5aee9f2` : huit partitions backend en CI,
fusions et seuils de 90 % inchangés. Le pré-push final a rejoué tous les domaines requis.
Un premier pré-push avait été refusé sur les E2E ; les campagnes complètes suivantes sont vertes,
sans modification du code ni contournement du gate. L'échec initial ne s'est pas reproduit.

Publication par `npm run publish`, push branche dédiée vers main et fast-forward principal confirmés.
Le push documentaire concurrent `8eb1ef9` a annulé la première tentative CI ; après sa réussite,
la CI MEP-042 a été relancée intégralement sur le même SHA, puis confirmée par `wait-ci.mjs`.
Les huit partitions backend, couvertures fusionnées, frontend, deux shards E2E, consolidation,
`Full quality gate` et `Required impact gate` sont verts. La clôture documentaire suit cette preuve,
avec pré-push documentaire, CI de son SHA exact et vérification finale du main principal.
