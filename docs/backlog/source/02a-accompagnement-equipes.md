## EPIC-002A — Accompagnement des équipes

Cet Epic porte la responsabilité courante du `Coach` et l’historique des affectations. L’identité et le cycle de vie des équipes restent dans la source [Gestion des équipes](02-equipes.md), et les rattachements organisationnels communs dans les [concepts métier transverses](00-concepts-transverses.md).

### FEAT-008 — Affecter un coach à une équipe

- **Intention métier :** rendre explicite la responsabilité d’accompagnement d’une équipe.
- **Acteur concerné :** `Admin` de l’organisation de l’équipe.
- **Description :** démarrer, remplacer ou terminer l’affectation du coach responsable selon une période déterminée.
- **Critères d’acceptation principaux :**
  - un `Coach` actif peut devenir responsable d’une équipe active de la même organisation à une date d’effet connue ;
  - un remplacement clôt l’affectation courante avant d’ouvrir la suivante, sans chevauchement incohérent ;
  - un `Coach` inactif, une équipe inactive, un rattachement organisationnel différent ou une période invalide entraîne un refus.
- **Dépendances éventuelles :** `FEAT-003`, `FEAT-038`, `TEAM-001`, `FEAT-004`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.

### FEAT-009 — Retracer les affectations de coachs

- **Intention métier :** savoir qui était responsable d’une équipe à tout moment.
- **Acteurs concernés :** `Admin`, `Coach` autorisé par son affectation.
- **Description :** conserver et consulter la chronologie des affectations, avec dates d’effet et motif de fin ou de remplacement.
- **Critères d’acceptation principaux :**
  - chaque transition conserve le `Coach`, l’organisation, la période et l’auteur de la décision ;
  - l’affectation applicable à une date passée peut être déterminée sans ambiguïté ;
  - une correction ne doit pas effacer silencieusement une période déjà utilisée par une évaluation ;
  - aucun historique d’une autre organisation n’est consultable ou modifiable implicitement.
- **Dépendances éventuelles :** `FEAT-008`.
- **Priorité :** P0.
- **Domaine métier cible :** Équipes et coaching.
