# Backlog produit initial

## Finalité et principes

Ce backlog décrit les premières capacités métier d’**Assess teams**. Il est ordonné par valeur utilisateur et par parcours, non par couches techniques. Les identifiants sont stables : un élément retiré n’est pas renuméroté. La [gouvernance du backlog](governance.md) définit les sources faisant autorité, les métadonnées, les états et les calculs.

Chaque future implémentation reste soumise à la [charte qualité](../quality/quality-charter.md), à la [Definition of Done](../quality/definition-of-done.md) et à la [stratégie de tests](../quality/test-strategy.md). En particulier, chaque comportement fonctionnel devra avoir un cas passant et un vrai cas de refus, et les parcours critiques devront être couverts de bout en bout. Ces exigences sont des critères de livraison, pas des fonctionnalités produit.

Priorités :

- **P0** : nécessaire au premier parcours fonctionnel complet ;
- **P1** : important après le premier parcours ;
- **P2** : capacité secondaire ou amélioration.

## Premier parcours vertical — PV-001

**Objectif :** prouver rapidement la valeur et la cohérence du produit sur une chaîne complète : **Coach → Équipe → Affectation du coach → Modèle d’évaluation → Affectation du modèle → Passation → Finalisation → Historique**.

`TEAM-001` est le premier PBI d’implémentation. Il établit la création d’une équipe avant l’ajout de l’authentification et des habilitations ; le rôle d’administrateur y reste une intention fonctionnelle, sans dépendance technique à `FEAT-004`.

**Scénario nominal :**

1. Un administrateur authentifié crée et active le compte d’un coach (`FEAT-001` à `FEAT-004`).
2. Il crée une équipe, puis lui affecte ce coach ; l’affectation est historisée (`TEAM-001`, `TEAM-003`, `FEAT-008`, `FEAT-009`).
3. Il compose, paramètre, publie et versionne un modèle d’évaluation (`FEAT-011` à `FEAT-014`).
4. Il associe ce modèle à l’équipe et fixe la première échéance ainsi que la fréquence (`FEAT-015` à `FEAT-018`).
5. Le coach affecté démarre l’évaluation attendue, renseigne les critères et conserve au besoin un brouillon (`FEAT-020`, `FEAT-021`).
6. Le produit refuse une finalisation incomplète ; une passation valide peut être finalisée et devient traçable (`FEAT-022`, `FEAT-023`).
7. Le coach retrouve l’évaluation finalisée dans l’historique de l’équipe avec la version exacte du modèle utilisée (`FEAT-024`).

**Refus essentiels à démontrer :** un acteur non autorisé ne peut ni affecter un coach ni finaliser l’évaluation ; une équipe inactive ou un modèle non publié ne permet pas de démarrer une passation ; une passation incomplète ou une note hors modalités est refusée ; une évaluation finalisée n’est pas modifiable silencieusement.

**Résultat attendu :** une évaluation finalisée, rattachée à la bonne équipe, au coach responsable, à son échéance et à une version immuable du modèle, est consultable dans l’historique. Ce parcours constitue le premier scénario E2E critique.

## Source fonctionnelle détaillée

- [Identités, coachs et habilitations](source/01-identites.md)
- [Gestion et accompagnement des équipes](source/02-equipes.md)
- [Modèles, planification et passation des évaluations](source/03-evaluations.md)
- [Suivi, notifications et pilotage](source/04-suivi-et-pilotage.md)

Ces documents détaillés constituent la source de vérité fonctionnelle des Epics, Features et PBIs.

## Planification

- [Ordonnancement, domaines et garde-fous](planning/ordonnancement.md)

## Suivi et synthèses

- [Registre canonique des métadonnées PBI](tracking/pbis.md)
- [Vue des Epics et vue par Epic](summaries/epics.md)
- [Vue par Feature raffinée](summaries/features.md)
- [Scoring global et contrôle de cohérence](summaries/scoring.md)
