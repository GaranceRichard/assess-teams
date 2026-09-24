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

**Sauf instruction explicite contraire dans le prompt, terminer une tâche signifie aussi la committer et la pousser.** Un prompt Codex autorise et exige donc par défaut la livraison complète du travail sur la branche distante correspondante, selon la séquence `travail → validation → commit → push`.

Pour chaque tâche, Codex doit automatiquement :

1. lire le contexte et les règles du dépôt ;
2. mettre à jour préalablement `README.md` lorsque la règle de préparation l'exige ;
3. réaliser le travail demandé ;
4. mettre à jour la documentation concernée ;
5. exécuter les contrôles et tests applicables ;
6. corriger les erreurs liées au travail réalisé et relancer les contrôles ciblés ;
7. vérifier `git status`, les fichiers à versionner et l'absence de secrets ou d'artefacts indésirables ;
8. créer un commit cohérent ne contenant que les fichiers pertinents ;
9. récupérer le dernier `origin/main`, resynchroniser le commit et résoudre les conflits éventuels ;
10. vérifier que l'état final est entièrement commité et exécuter ses validations applicables ;
11. pousser ce commit vers `main` sans contourner le pre-push et son full quality gate ;
12. confirmer que `main` distant contient le commit publié ;
13. vérifier que le checkout principal est propre et non divergent, puis avancer son `main` local vers
    `origin/main` exclusivement en fast-forward ;
14. confirmer que le `main` local n'est en retard d'aucun commit sur `origin/main` ;
15. nettoyer uniquement le worktree et la branche du chantier terminé ;
16. rendre compte du commit, du pre-push, du rattrapage local et du nettoyage.

Le commit ou le push ne sont omis que si le prompt l'ordonne explicitement, par exemple avec `ne pas commit`, `ne pas push`, `travail local uniquement`, `préparation uniquement` ou une formulation équivalente. L'absence de demande explicite de push n'est pas une exception.

`main` est la branche d'intégration. Une branche de travail n'est pas publiée comme étape intermédiaire : son
état final est poussé vers `main` depuis son worktree isolé. Ne pas réécrire inutilement l'historique. Ne jamais
utiliser `--no-verify` pour contourner le pre-push. Si un problème externe indépendant du changement empêche
techniquement le push, préserver l'état local validé et signaler précisément le blocage.

## Intégration asynchrone

Le premier PBI terminé n'attend pas les autres. Avant de publier, il récupère le dernier `origin/main`,
resynchronise sa branche dessus, résout les conflits éventuels et exécute les validations sur exactement l'état
destiné à `main`. Il intègre et pousse immédiatement ce candidat sur `main`.

Chaque PBI parallèle retardataire répète cette séquence sur le nouveau dernier `origin/main`. Une validation
antérieure à la resynchronisation ne vaut pas validation finale. Le `pre-push` applique d'abord la garde de
contribution, puis le full quality gate existant ; la CI répète le full quality gate comme frontière distante.

Un travail ne prend jamais fin tant que la branche locale `main` du checkout principal est en retard sur
`origin/main`, même d'un seul commit. Après confirmation du push, la resynchroniser exclusivement par
fast-forward. Si le checkout est sale, divergent ou impossible à avancer sans écrasement, ne modifier aucune
donnée et considérer le travail comme non terminé jusqu'à résolution du blocage.

Après confirmation du push, supprimer uniquement le worktree et la branche de travail du PBI terminé. Ne jamais
nettoyer, déplacer ou modifier le worktree ou la branche d'un autre chantier.

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

Les commandes canoniques et l'installation des hooks sont documentées dans le [README](../../README.md#commandes-qualité). Le `pre-commit` exécute le gate rapide, informatif et non bloquant. Le `pre-push` refuse une publication qui ne provient pas d'une branche et d'un worktree dédiés, qui contient des changements non commités, qui ne cible pas `main` ou qui n'intègre pas le SHA distant annoncé par Git. Il exécute ensuite le même full quality gate, exhaustif et bloquant, que la CI GitHub. Contourner le hook local ne dispense jamais du contrôle distant.
