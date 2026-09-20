# Backlog produit initial

## Finalité et principes

Ce backlog décrit les premières capacités métier d’**Assess teams**. Il est ordonné par valeur utilisateur et par parcours, non par couches techniques. Les identifiants sont stables : un élément retiré n’est pas renuméroté.

Chaque future implémentation reste soumise à `QUALITY_CHARTER.md`, `DEFINITION_OF_DONE.md` et `TEST_STRATEGY.md`. En particulier, chaque comportement fonctionnel devra avoir un cas passant et un vrai cas de refus, et les parcours critiques devront être couverts de bout en bout. Ces exigences sont des critères de livraison, pas des fonctionnalités produit.

Priorités :

- **P0** : nécessaire au premier parcours fonctionnel complet ;
- **P1** : important après le premier parcours ;
- **P2** : capacité secondaire ou amélioration.

## Premier parcours vertical — PV-001

**Objectif :** prouver rapidement la valeur et la cohérence du produit sur une chaîne complète : **Coach → Équipe → Affectation du coach → Modèle d’évaluation → Affectation du modèle → Passation → Finalisation → Historique**.

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

## Découpage du backlog

- [Identités, coachs et habilitations](backlog/01-identites.md)
- [Gestion et accompagnement des équipes](backlog/02-equipes.md)
- [Modèles, planification et passation des évaluations](backlog/03-evaluations.md)
- [Suivi, notifications et pilotage](backlog/04-suivi-et-pilotage.md)
- [Ordonnancement, domaines et garde-fous](backlog/05-ordonnancement.md)
- [Synthèse de suivi du travail](backlog/06-synthese-suivi.md)
