# MEP-018 - Etats de chargement

Qualification locale du 2026-11-05 par Codex, Windows / Chromium, donnees fictives.
Base qualifiee : `4793611227cc8b3d79fe366094118cdd49d2195e` (MEP-050 integre).
[Source](../../backlog/source/mess/f08.md) / [fiche](../../backlog/planning/audit-20261027/fiches/MEP-018.md) /
[recette UX](../ux-acceptance.md). La livraison technique et la proposition de cloture ne valent pas PV MESS.

## Qualification avant correction

Les tests existants `usePagedCollection`, `ResultsSelectionRace`, `PlanningLoading` et
`SteeringPage` passent : 13 tests sur la base avant correction. Ils couvrent scopes/revisions,
mutation conservee apres lecture tardive, pagination, attente et premier ordre inverse.
MEP-045 conserve la sauvegarde des notes ; MEP-017 conserve geometrie et scrolls ; MEP-050 conserve
absence/filtre/vide. Aucune politique reseau, API, permission, cache ou dependance ajoutee.

| Anomalie | Ecran / etat / requete | Attendu / observe avant correction | Test rouge puis vert |
| --- | --- | --- | --- |
| L01 | Planification / initial / GET organisations + evaluations | Attente annoncee, choix protege / aucune indication | `PlanningContextRace` : initial prerequisites |
| L02 | Planification / changement A vers B / GET organizations/{id}/teams/ | Etat B conserve / equipes A reintroduites apres echec B | `PlanningContextRace` : obsolete teams success after current error |
| L03 | Planification / sauvegarde / POST ou PUT planning | Une seule soumission / deux appels du formulaire en attente | `PlanningPending` : success et error |
| L04 | Pilotage / page 2 refusee / GET steering page=2 | Anciennes lignes masquees / equipes page 1 reaffichees | `SteeringLoading` : previous page teams after failure |

L01/L02/L03 ont echoue avant leurs corrections ; L04 a ensuite echoue avant sa correction.
La non-regression complete a detecte une attente infinie introduite par le premier correctif lors
du rechoix de la meme organisation (test existant `dark-theme`). Reproduction React rouge puis
garde de selection identique : equipes et etat conservees, sans nouvelle attente.
Les erreurs de montage initial des nouveaux tests (encodage puis selecteurs Playwright exacts)
ne sont pas comptees comme anomalies produit. Le remplacement README tente avant developpement
n'avait pas modifie le texte (encodage de l'ancre) : detecte par le gate, corrige explicitement ;
la presence finale du README ne prouve pas le respect de l'ordre temporel initial.

## Comportement livre et verdicts

| Scenario | Role / jeu / action | Observation et preuve | Verdict local |
| --- | --- | --- | --- |
| Attente collections | Admin / shell-state / GET users retarde puis vide et 500 | `shell-states` : aria-busy, geometrie constante ; `usePagedCollection` conserve page/scope et mutations | Conforme |
| Attente Planification | Admin / North / prerequis retardes | Texte de chargement ; organisation desactivee ; equipes en attente annoncees, formulaire protege | Conforme |
| Reponses inversees | Superadmin / North A puis South B / succes ou 500 pour chaque requete | 4 combinaisons dans ResultsSelectionRace et SteeringLoading ; 8 E2E `loading-context` ; aucun etat, erreur ou contenu A restaure | Conforme |
| Equipes inversees | Superadmin / A puis B / succes et erreur | 4 combinaisons dans PlanningContextRace ; aucune equipe A sous selection B | Conforme |
| Mutation retardee | Admin / Alpha / soumettre deux fois avant 201 ou 400 | PlanningPending et `planning-pending` : un seul appel, controles proteges, aucun succes avant reponse, saisie conservee sur refus | Conforme |
| Pagination refusee | Admin / Pilotage / page 2 refusee | SteeringLoading : attente puis erreur, aucune equipe page 1 presentee comme page 2 | Conforme |
| Refus de qualification | Cas L01-L04 ci-dessus | Echecs rouges attribues a un ecran, un etat et une requete ; corrections vertes | Conforme |

`usePlanningContext` isole chargement initial et lecture d'equipes avec nettoyage des effets.
Le verrou synchrone du formulaire protege aussi les soumissions reentrantes avant le rendu React.
Le fieldset gele les saisies pendant la sauvegarde et leur restitution attend la reponse effective.
Le selecteur d'organisation est protege pendant la creation. Les protections de fermeture existantes
restent en place dans les dialogues ; les tests de non-regression les reexecutent.
La synthese Pilotage et ses anciennes lignes sont masquees apres refus d'une nouvelle page.

## Executions et relecture

- Selection React de non-regression initiale : 8 fichiers / 23 tests passes apres L01-L03.
- Selection React finale MEP-018 : 4 fichiers / 17 tests passes, lint, format et TypeScript verts.
- Selection navigateur initiale : 11 tests passes (8 inversions, 2 mutations, 1 shell-states).
- `planning-pending` couvre aussi 390x844 sombre en plus de 1280x720 clair, palette verte, zoom 100 %.
- Les captures `planning-initial.png`, `planning-saving.png`, `planning-settled.png` sont regenerees
  dans les sorties Playwright ; relecture desktop et mobile sombre : attente lisible, champs desactives,
  refus et saisies presentes. Le gate du 2026-11-05 a termine sans echec : 133 tests React dependants et campagnes E2E application/demo.
  La reprise du 2026-11-06 renforce les assertions de maintien des donnees et de refus des erreurs obsoletes.
- Les E2E ajoutes interceptent le transport pour controler l'ordre et les statuts ; ils ne revendiquent
  pas de nouvelles preuves ORM. Les parcours connectes existants restent dans le gate E2E obligatoire.

Commandes reproductibles, depuis la racine :

```powershell
npm run quality:targeted -- frontend src/PlanningContextRace.test.tsx src/PlanningPending.test.tsx src/SteeringLoading.test.tsx src/ResultsSelectionRace.test.tsx
npm run quality:targeted -- e2e e2e/loading-context.spec.ts e2e/planning-pending.spec.ts e2e/shell-states.spec.ts
npm run quality:targeted
npm run publish
```

La relecture n'est pas une certification d'accessibilite : zoom navigateur 200 %, tactile physique,
et PV cible restent les recettes UX/MESS communes. Aucun seuil de latence ou spinner impose.
Le statut canonique reste Ouvert ; cloture proposee sur preuves apres gates et CI du SHA publie.

Resynchronisation du 2026-11-06 sur `62fb3ab` : les deux ajouts documentaires et la regle responsive
MEP-017 de faible hauteur sont conserves ; le fieldset de sauvegarde reste distinct.
Qualification apres rebase du candidat `e997f28d6278a64ac7b1d41288506b8a3ab6a5bd` : 17 tests React et 17 E2E passes,
dont les collections/dialogues responsive en clair et sombre. Lint, formatage et TypeScript passent.

## Revue documentaire / DoD

README, agent-rules, charte, DoD, strategie de tests, fondamentaux, contrat API/OpenAPI et
product-layout relus : aucune evolution backend, schema, migration, droit ou architecture.
README, strategie et lien de qualification sont actualises ; les autres regles restent applicables.
Les fichiers maintenus restent sous 200 lignes. Les gates automatiques restent bloquants.

## Livraison technique et proposition de cloture - 2026-11-06

Le candidat publie et qualifie est `8609c857b4404d5b1addfe8c7174a4c02fca8085`,
apres integration de MEP-017 et MEP-051 sans alteration de leurs perimetres.
Le pre-push proportionne passe : documentation, lint/format/TypeScript, 133 tests React dependants,
150 tests navigateur applicatifs et 10 tests de demo ; aucun test backend requis par ce diff frontend.
La relecture des captures du candidat confirme attente/protection desktop clair et refus avec saisies
conservees sur mobile sombre. Le main principal a ete constate propre et synchronise en fast-forward.

La [CI du SHA exact](https://github.com/GaranceRichard/assess-teams/actions/runs/42273721774)
est verte (tentative 2). La premiere execution avait ete annulee apres un push documentaire concurrent ;
la meme CI a ete relancee integralement apres la fin de l'autre execution, sans changement du workflow.

Les quatre scenarios fonctionnels sont conformes sur ces preuves : cloture fonctionnelle proposee.
La reserve de procedure initiale README reste tracee ci-dessus. Le registre canonique reste Ouvert
jusqu'a validation de la proposition ; cette livraison ne constitue pas un PV cible ni un GO MESS.
