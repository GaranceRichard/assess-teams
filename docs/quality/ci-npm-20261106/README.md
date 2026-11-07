# Correctif transversal CI et qualification npm — 2026-11-06

Base examinée : `54afdde2ff58cd50e0c3c11b55092f600d42c9dd`, dernier origin/main au démarrage.
Branche `fix/ci-concurrency-npm-20261106`, worktree dédié hors du principal ; aucun nouveau PBI.
Périmètre : concurrence de quality.yml, mises à jour compatibles npm, qualification et preuves.

## Incident et cause démontrée

Le [run 42273721774, tentative 1](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774/attempts/1)
valide `8609c857b4404d5b1addfe8c7174a4c02fca8085` : démarrage 18:46:27 UTC,
annulation terminée à 18:47:34 UTC le 6 novembre 2026.
Le [nouveau push 42273813103](https://github.com/GaranceRichard/assess-teams/actions/runs/42273813103)
valide `b5845143a1f61d70d19d8b157536330985aca1e3` et démarre à 18:47:04 UTC.
L’annotation du [job frontend 128084669802](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774/job/128084669802)
confirme un remplacement par une requête prioritaire en attente dans `Quality gate-refs/heads/main`.
Frontend, repository et e2e sont annulés ; `Required impact gate` est en échec, donc refus conforme.
La [tentative 2](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774/attempts/2)
démarre à 18:49:13 UTC et réussit à 19:10:26 UTC sur le même SHA : elle ne rend pas la première conforme.
Ces résultats et l’annotation ont été relus par API GitHub, avec sélection explicite de la tentative 1.

Ancien groupe : workflow + numéro PR ou ref ; tous les pushes main partagent donc un groupe annulable.
Mettre seulement `cancel-in-progress: false` laisserait le remplacement des runs en attente du même groupe.
La [sémantique GitHub](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency)
justifie une identité propre par exécution pour les publications, plutôt qu’une file partagée.

## Correction bornée

Le groupe devient workflow + événement + (numéro PR ou run_id).
`cancel-in-progress` est vrai uniquement pour l’événement pull_request.
Chaque push, y compris deux runs distincts du même SHA, a son groupe : ni annulation d’un run actif,
ni remplacement d’un run en attente par une autre publication.
Une même PR conserve le remplacement de ses validations obsolètes ; PR distinctes et main restent isolés.
Les workflows réutilisables ne déclarent aucune concurrence susceptible d’annuler leur appelant.
Aucun push artificiel n’a servi à tester les chevauchements.

Pré-push, plan proportionné, gate obligatoire, couvertures >= 90 %, nightly, qualification exhaustive,
promotion et SHA exact restent inchangés. `wait-ci.mjs` et `qualification.mjs` sont conservés ;
leurs refus d’annulation, de mauvais SHA, de preuve partielle ou locale restent testés.
Aucune PR créée, aucun ruleset modifié, aucun contrat API, droit ou changement applicatif.

## Qualification npm

- [Inventaire complet des 19 paquets signalés et chaînes](npm-inventory.md).
- [Vingt avis directs : préconditions, exposition et décisions](npm-advisories.md).
- [Tests, reproduction, versions et empreintes](validation.md).

Les 17 signalements frontend (4 élevés, 13 modérés) sont reproduits. L’audit racine révèle aussi
2 signalements critiques, provenant d’un seul avis shell-quote. Un paquet propagé par npm n’est pas
un avis supplémentaire ; sévérité d’avis et exploitabilité ne sont pas assimilées.
Après corrections : racine 0 ; frontend 10 modérés liés au seul avis minimatch ; production 0/0.
Les 20 avis directs initiaux se répartissent en 19 corrigés et 1 restant qualifié.

## Décisions et gouvernance

Risques corrigés : shell-quote, source-map-js, zod, huit avis undici, six Vite et deux mocker.
Non-exploitabilité bornée : minimatch dans l’usage lint examiné (optimisation par défaut 1,
patterns versionnés), et les outils Node absents du runtime de production ; détails dans les avis.
Cela n’est ni une acceptation de risque ni une garantie pour toute configuration future.
Risques acceptés par ce chantier : **aucun**.
Décision restante : suivi du correctif minimatch par ses consommateurs, ou autorisation ultérieure
pour qualifier une évolution incompatible ; pas d’override majeur, downgrade ESLint ou audit fix forcé.
La suppression de tous les avertissements npm n’est donc pas acquise, même si les gates passent.

MEP-012 conserve son statut ; C06 n’est pas arbitré. Ce dossier peut compléter leurs preuves
techniques sur la CI et les dépendances, sans modifier l’acquis historique ni la décision du 21 octobre.
Aucune préparation d’infrastructure MESS, aucun nettoyage d’autre chantier.
La clôture technique ne peut être proposée qu’après pré-push et CI verts sur le SHA publié ;
la réserve minimatch reste explicite et aucune clôture fonctionnelle/gouvernance n’est prononcée ici.
