# Backlog produit initial

> **Suivi courant :** consulter la [synthèse du backlog](synthese.md), vue humaine complète de l’avancement.

## Finalité et principes

Ce backlog décrit les premières capacités métier d’**Assess teams**. Il est ordonné par valeur utilisateur et par parcours, non par couches techniques. Les identifiants sont stables : un élément retiré n’est pas renuméroté. La [gouvernance du backlog](governance.md) définit les sources faisant autorité, les métadonnées, les états et les calculs.

Chaque future implémentation reste soumise à la [charte qualité](../quality/quality-charter.md), à la [Definition of Done](../quality/definition-of-done.md) et à la [stratégie de tests](../quality/test-strategy.md). En particulier, chaque comportement fonctionnel devra avoir un cas passant et un vrai cas de refus, et les parcours critiques devront être couverts de bout en bout. Ces exigences sont des critères de livraison, pas des fonctionnalités produit.

Priorités :

- **P0** : nécessaire au premier parcours fonctionnel complet ;
- **P1** : important après le premier parcours ;
- **P2** : capacité secondaire ou amélioration.

## Socle organisationnel

Le système est multi-organisation. Les définitions canoniques d’**Organisation**, du `Superadmin` technique, des rôles authentifiés `Admin`, `Coach`, `Viewer`, de la matrice CRUD des Organisations et Équipes, de leur périmètre et des règles de cloisonnement se trouvent dans les [concepts métier transverses](source/00-concepts-transverses.md). L’[Epic de gestion des organisations](source/05-organisations.md) porte leur cycle de vie et le rattachement des acteurs.

Le [registre des arbitrages Organisation](source/00-arbitrages-organisations.md) distingue les décisions prises, les décisions `À arbitrer — bloquant` et le backlog bloqué. Aucune future implémentation ne devra transformer ces inconnues en règles implicites. Toute lecture de donnée métier exige une identité authentifiée.

## Premier parcours vertical — PV-001

**Objectif :** prouver rapidement la valeur et la cohérence du produit sur une chaîne complète : **Organisation → Admin → Coach → Équipe → Affectation du Coach → Modèle d’évaluation → Affectation du modèle → Passation → Finalisation → Historique**.

`TEAM-001` reste indépendant de l’implémentation technique de l’authentification et des permissions. Il ne peut toutefois être ordonnancé qu’après `ORG-001` et la résolution des rattachements du socle Organisation dont dépend son organisation obligatoire.

**Scénario nominal :**

1. Une organisation a été créée par `ORG-001` et son premier rattachement `Admin` a été établi selon le mécanisme d’initialisation restant à arbitrer (`FEAT-037`).
2. Cet `Admin` authentifié crée et active l’identité du `Coach` selon `USER-001`, puis le rattache à la même organisation (`FEAT-001` à `FEAT-004`, `FEAT-038`).
3. Il crée dans cette organisation une équipe, puis lui affecte ce `Coach` de la même organisation ; l’affectation est historisée (`TEAM-001`, `TEAM-003`, `FEAT-008`, `FEAT-009`).
4. Il compose, paramètre, publie et versionne un modèle d’évaluation dans un périmètre organisationnel explicite (`FEAT-011` à `FEAT-014`).
5. Il associe ce modèle à l’équipe et fixe la première échéance ainsi que la fréquence (`FEAT-015` à `FEAT-018`).
6. Le `Coach` affecté démarre l’évaluation attendue, renseigne les critères et conserve au besoin un brouillon (`FEAT-020`, `FEAT-021`).
7. Le produit refuse une finalisation incomplète ; une passation valide peut être finalisée et devient traçable (`FEAT-022`, `FEAT-023`).
8. Le `Coach` retrouve l’évaluation finalisée dans l’historique de l’équipe avec la version exacte du modèle utilisée (`FEAT-024`).

**Refus essentiels à démontrer :** un rôle non autorisé ne peut ni affecter un `Coach` ni finaliser l’évaluation ; aucun acteur ne peut consulter ou manipuler implicitement les données d’une autre organisation ; une équipe inactive, un rattachement organisationnel incohérent ou un modèle non publié ne permet pas de démarrer une passation ; une passation incomplète ou une note hors modalités est refusée ; une évaluation finalisée n’est pas modifiable silencieusement.

**Résultat attendu :** une évaluation finalisée, rattachée sans ambiguïté à la bonne organisation, à la bonne équipe, au `Coach` responsable, à son échéance et à une version immuable du modèle, est consultable dans l’historique. Ce parcours constitue le premier scénario E2E critique.

## Source fonctionnelle détaillée

- [Concepts métier transverses : Organisation, rôles et rattachements](source/00-concepts-transverses.md)
- [Décisions et arbitrages bloquants du socle Organisation](source/00-arbitrages-organisations.md)
- [Identités, coachs et habilitations](source/01-identites.md)
- [Gestion des équipes](source/02-equipes.md)
- [Accompagnement des équipes](source/02a-accompagnement-equipes.md)
- [Modèles, planification et passation des évaluations](source/03-evaluations.md)
- [Suivi, notifications et pilotage](source/04-suivi-et-pilotage.md)
- [Gestion des organisations](source/05-organisations.md)

Ces documents détaillés constituent la source de vérité fonctionnelle des Epics, Features et PBIs.

## Planification

- [Ordonnancement, domaines et garde-fous](planning/ordonnancement.md)

## Suivi

- [Synthèse du backlog et suivi d’avancement](synthese.md)
- [Registre canonique des métadonnées PBI](tracking/pbis.md)
