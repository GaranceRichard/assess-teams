# Règles de travail des agents

## Portée et priorité

Ce fichier s'applique à tout le dépôt **Assess teams** et à tout agent humain ou automatisé qui y contribue. Les règles ci-dessous sont obligatoires. En cas de conflit, appliquer la règle qui protège le mieux la qualité, la sécurité et la maintenabilité, puis signaler le conflit.

Avant toute modification, inspecter l'existant et respecter l'architecture, les conventions et les responsabilités déjà établies. Ne pas introduire de nouvelle couche, dépendance ou abstraction sans besoin démontré. Garder Django et Django REST Framework côté backend, React et TypeScript côté frontend, et SQLite comme base initiale tant qu'une décision d'architecture documentée ne les remplace pas.

[`AGENTS.md`](../../AGENTS.md) est l'autorité d'entrée permanente de tout agent. Le présent document en détaille
les règles qualité et de livraison sans affaiblir ses obligations d'isolation et d'intégration asynchrone.

## Isolation obligatoire des chantiers

Tout chantier part du dernier état pertinent de `origin/main`. Il utilise une branche dédiée et un worktree
dédié créé hors du dépôt principal, puis annonce explicitement au démarrage le nom de la branche et le chemin
physique du worktree. Aucun travail n'est réalisé directement dans le checkout principal utilisé dans VS Code.

Le checkout principal reste disponible et stable pendant le travail. Les worktrees sont des espaces internes
aux agents, annoncés uniquement pour traçabilité. Ne demander ni workspace multi-root, ni changement du dossier
ouvert dans VS Code, ni ouverture manuelle des worktrees. La seule mutation finale autorisée dans le checkout
principal est le fast-forward sûr de sa branche locale `main` vers `origin/main` après publication.

## Préparation obligatoire avant travail

Avant tout développement, correction, refactoring ou changement technique, mettre à jour le [README racine](../../README.md) pour annoncer le périmètre travaillé, le sujet ou la feature lorsqu'il existe, et l'évolution attendue. Cette mise à jour précède le travail ; elle ne doit pas être ajoutée a posteriori pour satisfaire le gate.

L'ordre temporel ne pouvant pas être vérifié fiablement par Git, l'automatisation contrôle qu'un lot comportant un changement applicatif ou technique comporte aussi une modification de `README.md`. Ce contrôle de cohérence ne remplace pas la responsabilité de mise à jour préalable et ne justifie jamais une modification artificielle sans changement de périmètre.

## Règle bloquante des 200 lignes

**Aucun fichier maintenu manuellement ne doit dépasser 200 lignes. Cette limite est non négociable et bloquante.**

Elle s'applique notamment aux fichiers Python, TypeScript, TSX, JavaScript, aux tests, aux utilitaires et aux configurations maintenues manuellement.

La définition exécutable unique des exclusions se trouve dans `scripts/quality/files.ps1`. Elle couvre uniquement :

- les métadonnées Git (`.git`) ;
- les dépendances et environnements locaux (`node_modules`, `.venv`, `venv`) ;
- les sorties et caches nommés `dist`, `build`, `coverage`, `htmlcov`, `playwright-report`, `test-results`, `__pycache__`, `.pytest_cache`, `.ruff_cache`, `.mypy_cache` ou `.cache` ;
- les migrations Django `migrations/*.py`, les fichiers minifiés `*.min.js` et `*.min.css`, et les source maps `*.map` ;
- les lock files explicitement reconnus dans ce script ;
- les fichiers binaires, détectés par extension connue ou par présence d’un octet nul.

Il est interdit de contourner cette règle par une compaction artificielle, la suppression de retours à la ligne utiles ou toute dégradation de la lisibilité. Lorsqu'un fichier approche de la limite, le découper selon des responsabilités cohérentes.

## Clean Code obligatoire

Chaque changement doit garantir :

- des responsabilités clairement séparées ;
- des fonctions courtes et des noms explicites ;
- un faible couplage et une forte cohésion ;
- une logique simple avec peu d'imbrication ;
- aucune abstraction prématurée ;
- aucune duplication significative ;
- aucun code mort ;
- aucune dette technique cachée.

Toute dette acceptée exceptionnellement doit être visible, justifiée, documentée et suivie. Elle ne doit jamais masquer un quality gate en échec.

## Règles de tests

Tout élément fonctionnel doit avoir au minimum :

- un test fonctionnel passant couvrant le comportement attendu ;
- un test fonctionnel non passant couvrant un véritable refus, échec ou cas métier, et non un scénario artificiel.

Selon l'impact du changement, ajouter ou mettre à jour les tests unitaires, fonctionnels, API, d'intégration, de contrat, de non-régression et E2E nécessaires. Les interactions significatives doivent être vérifiées, notamment service Django + ORM, API + base de données, authentification + permissions + endpoint, React + couche API et frontend + backend.

Les contrats entre React et Django REST Framework doivent couvrir la structure des requêtes et réponses, les champs obligatoires, les types, les codes HTTP, les erreurs et les validations. Les parcours métier critiques doivent être couverts en E2E et suivis par parcours fonctionnel, indépendamment du coverage de lignes.

Toute correction de bug doit inclure un test de non-régression qui reproduit le défaut réel, échoue avant la correction et passe après celle-ci.

## Seuils et contrôles bloquants

- Coverage backend : **>= 90 %**.
- Coverage frontend : **>= 90 %**.
- Tous les tests doivent passer.
- Le lint et le formatage doivent passer.
- Toute modification de modèle Django doit avoir sa migration requise.
- Aucun secret, jeton, mot de passe ou identifiant sensible ne doit être commité.

Un seuil global ne dispense jamais de tester les comportements modifiés, les branches métier significatives et les erreurs attendues.

## Documentation

Avant tout push, effectuer une revue d'impact documentaire. Vérifier au minimum le [README racine](../../README.md), les [règles des agents](agent-rules.md), la [charte qualité](quality-charter.md), la [Definition of Done](definition-of-done.md), la [stratégie de tests](test-strategy.md), la [documentation d'architecture](../architecture/fundamentals.md), le [contrat API et OpenAPI](../architecture/backend-api.md) et tout autre fichier Markdown concerné. Mettre à jour chaque document affecté dans le même changement.

Tout endpoint backend nouveau ou modifié doit être décrit par `drf-spectacular`. L’évolution reste inachevée si le schéma `/api/schema/` n’est pas générable et valide, si Swagger UI `/api/docs/` n’est plus accessible, ou si méthode, chemin, paramètres, corps, réponses, codes, erreurs, authentification ou permissions divergent de l’implémentation.

## Livraison complète par défaut

Sauf instruction explicite contraire, terminer une tâche signifie aussi la committer et la publier.
Le circuit est : travail, validations proportionnées, commit, resynchronisation, pré-push, branche
distante, PR, CI obligatoire, fusion protégée, CI du SHA intégré et synchronisation locale sûre.

Pour chaque tâche :

1. Lire contexte/règles et annoncer préalablement le périmètre dans README.
2. Réaliser le changement et la revue documentaire ; valider les contrôles applicables et corriger les échecs.
3. Vérifier fichiers, propreté et absence de secrets ; créer un commit cohérent.
4. Utiliser `npm run publish` depuis la branche et le worktree dédiés.
5. Récupérer le dernier origin/main, resynchroniser et résoudre les conflits ; une branche déjà publiée
   reçoit main par merge et se pousse en fast-forward, sans réécriture distante.
6. Le pré-push exige HEAD vers la propre branche distante du chantier, propreté et ascendance du
   SHA distant annoncé et du main frais ; il valide tout le diff main→candidat, jamais le seul incrément.
7. Ouvrir/réutiliser la PR de cette branche vers main et attendre son merge synthétique validé en CI.
8. Exiger le workflow qualité réussi, le `Required impact gate` exact et son producteur GitHub Actions,
   ainsi que le plan CI archivé pour la bonne base et le bon merge synthétique.
9. Relire les règles actives : PR, branche à jour, conversations résolues, zéro approbation obligatoire,
   force-push/suppression interdits et bypass vide pour tous, admins/automates compris.
10. Fusionner avec le HEAD attendu, par commit de merge ; refuser si main ou le candidat a évolué.
11. Confirmer la fusion et l’ascendance du candidat ; vérifier que l’arbre intégré est celui testé.
12. Vérifier le principal propre et non divergent sur main, puis le rattraper uniquement en fast-forward.
13. Attendre la CI push verte du SHA intégré, puis rafraîchir et synchroniser encore main local.
14. Confirmer propreté, absence de retard/divergence et CI verte avant succès de livraison.
15. Supprimer uniquement branche distante/locale et worktree du PBI terminé, puis rendre compte des preuves.

Le commit/push ne sont omis que sur instruction explicite. `npm run publish -- -Prepare` prépare et valide
une PR sans fusion ; ce mode ne constitue pas une livraison terminée. Il sert à la transition MEP-043
avant activation des règles, puis fusion de son propre candidat sous protection active.
Le push direct vers `main` est interdit ; aucun `--no-verify`, `--admin`, force-push ou assouplissement
de protection n’est autorisé pour publier. Si un problème externe bloque, préserver candidat et preuves.
Une CI post-fusion rouge laisse main synchronisé et la livraison non terminée ; corriger par une autre PR.

## Intégration asynchrone

Le premier PBI prêt n’attend pas les autres. Le verrou commun sérialise publication de branche,
attente PR/CI, fusion et synchronisation. Chaque PBI parallèle retardataire repart du nouveau origin/main.
Une validation antérieure reste valable si ses entrées et sa sélection sont identiques,
selon le [dispositif de validation](validation-costs.md) ; dépôt/documentation restent frais.
La CI reste indépendante. Les règles strictes GitHub arbitrent aussi les clients d’autres machines.

Un travail ne prend jamais fin tant que le main local principal est en retard sur origin/main.
Si son rattrapage exige d’écraser des données, si le checkout est sale, divergent ou sur une autre branche,
ne rien écraser et conserver la livraison non terminée jusqu’à résolution.
Ne jamais nettoyer, déplacer ou modifier les ressources d’un autre chantier.

## Procédure de livraison

Avant de déclarer une tâche terminée :

1. vérifier la conformité à la [Definition of Done](definition-of-done.md) ;
2. contrôler la longueur de tous les fichiers maintenus concernés ;
3. exécuter les tests, le coverage, le lint et le contrôle de formatage applicables ;
4. vérifier les migrations, les contrats, les parcours E2E et la sécurité selon l'impact ;
5. effectuer la revue documentaire avant le push ;
6. suivre la procédure de livraison complète par défaut, sauf exception explicite du prompt ;
7. signaler explicitement tout contrôle impossible à exécuter.

Une tâche reste non terminée dès qu'un quality gate est en échec.

## Automatisation des quality gates

Les commandes canoniques et l'installation des hooks sont documentées dans le [README](../../README.md#commandes-qualité).
Le pre-commit est rapide, informatif et non bloquant. Le pre-push impose isolation, propreté et push vers
la propre branche distante ; il interdit le push direct vers `main`, suppression et réécriture.
Le plan d’impact porte sur tout le diff main→candidat. Un échec applicable bloque toujours.
La CI vérifie indépendamment le merge synthétique ; le ruleset actif exige son `Required impact gate`
produit par GitHub Actions avant fusion, sans bypass.
La publication utilise `npm run publish`, qui sérialise jusqu’au rattrapage et à la CI du SHA intégré.
Pendant le développement, privilégier `quality:targeted` ; `quality:quick` reste statique et informatif.
Les preuves et métriques sont définies dans [validation proportionnée](validation-costs.md).

## Trois niveaux de validation

`quality:targeted` sans argument est le comportement local normal : diff réel et sélection automatique.
Les tests explicites donnent un feedback ciblé sans lancer automatiquement l'exhaustif pendant le développement.
Prose et backlog dans les emplacements audités déclenchent seulement le scope documentaire, aucun test applicatif.
Le plan conserve les statiques, tests et parcours adaptés ; risque inconnu/sensible/transverse : sélection conservatrice.
Les seuils de 90 % restent ceux des campagnes complètes, pas des couvertures partielles ciblées.
Une preuve versionnée exige entrées effectives et sélection identiques, y compris après rebase ; aucune expiration temporelle.

La nightly indépendante exécute tout sur main ; la qualification MESS exige le SHA complet exact.
Le gate de promotion exige un run exhaustif GitHub réussi et son artefact correspondant ; une autre nightly ne suffit pas.
`Full quality gate` reste exhaustif ; il ne remplace pas le gate ordinaire obligatoire sur chaque PR.
Le ruleset doit être actif avant fusion ; [circuit et preuves MEP-043](ci.md).
Un échec CI post-fusion refuse la livraison ; corriger par PR, sans force-push ni bypass.
