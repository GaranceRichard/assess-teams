# MEP-048 — qualification contradictoire des indicateurs

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

Rapport local du **2026-11-01**, auteur : Codex, sur données fictives.
**Décision proposée : qualification complémentaire ciblée A ; pas de clôture proposée en l’état.**
Les faits techniques contrôlés sont conformes. La lecture visuelle complète et le refus réel du
lien vers une équipe absente de la version courante ne sont pas démontrés sur le jeu fixe.
Aucun nouveau calcul ou développement n’est justifié par les observations disponibles.

## Référence et limites

- Candidat : `2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd`, dernier `origin/main` récupéré au départ.
- Branche : `audit/mep-048-indicateurs-20261101`.
- Worktree : `C:/Users/garan/Desktop/Projets/Assess-teams-mep-048`, distinct de MEP-047.
- Autorités : [FEAT-055 / critères et refus MEP-048](../../source/mess/f07.md),
  [dossier de sortie](../audit-20261027/sortie-mep-048.md), [fiche analytique](../audit-20261027/fiches/MEP-048.md).
- Contrats relus : [Pilotage](../../../architecture/steering-api.md), [Dashboard](../../../architecture/dashboard-api.md).
- [Jeu fixe](jeu-fixe.md) ; [validations et preuves](validations.md).
- Aucun changement de code, test, source ou statut canonique ; aucun commit, push, publication ou PR.
  Aucun fichier de MEP-047 modifié ; checkout principal propre sur le SHA de départ.
- Qualification locale du seul périmètre 048 : aucune acceptation MESS, promotion ou décision GO/NO-GO.

## Matrice attendu / observé / preuve / verdict

« Conforme technique » se limite aux assertions/données contrôlées ; les manques visuels restent nécessaires.

| Critère ou refus canonique | Attendu | Observé | Preuve | Verdict |
| --- | --- | --- | --- | --- |
| Couverture reliée aux faits | Actives de l’organisation ; avec/sans COMPLETED accessible ; archives exclues ; absence distincte de 0 | Jeu fixe : 4 / 2 / 2 ; archivée absente. Vide : 0 / 0 / 0 et date null. Sans complétion : 1 / 0 / 1 et last_result null | J1–J3 ; B1 ; R1 ; V1 | Conforme technique ; visuel du jeu fixe et des absences restant |
| Complétions reliées aux sources | Date initiale/version snapshotée ; révision séparée ; Dashboard borné à dix événements accessibles | Révision réelle A1 à 0 : HTTP 200 ; dates A1 et maximum A2 inchangés ; Results A1 garde run/version et notes 0. Dashboard sépare révision/complétion ; bornage/auteurs par rôle passent | J1 ; B1–B2 ; R1 ; E1 ; V2 | Conforme technique ; dates/contexte du jeu fixe à relire à l’écran |
| Retards reliés aux échéances | Attente persistée non complétée, due_date < D ; D/futur exclus ; jamais évaluée prioritaire | A2/A3 dus D−1 donnent 2 retards ; A2 overdue, A3 never_evaluated ; A4 due D puis D+1 ne change pas le compte ; planning non matérialisé sans retard artificiel dans B1 | J1 ; B1 ; R1 ; E1 | Conforme technique ; lecture conjointe des explications/chiffres restante |
| Explications actionnables vers Results, sans nouveau calcul | Définitions des cinq cartes/états ; source autorisée ; aucune équipe substituée si inexploitable | Code explicite ; lien E2E réel sélectionne Équipe A et persiste au reload. API J1 rejoint A1/A2 v1. Absence/inaccessibilité testées par API simulée dans ResultsIntent ; aucun refus navigateur réel J1 | J1 ; R1 ; E1 ; SteeringSummary/Teams et useResultSelection | Partiel : succès connecté démontré ; refus connecté et définitions ouvertes à qualifier |
| Refus classement individuel | Aucune hiérarchie de performance Coach/utilisateur | Cinq cartes factuelles ; Coachs affectés aux lignes ; tri état d’équipe puis nom/ID ; Dashboard personnel sans note ni classement ; scopes des quatre rôles contrôlés | B1–B2 ; R1 ; E1 ; lecture projection/composants | Refus respecté techniquement ; revue visuelle par rôle incomplète |
| Refus score global Pilotage | Ni moyenne, note globale, ni qualité déduite de À jour | Summary : quatre comptes et une date. Aucun appel au calcul Results dans steering_projection ; note explicite « sans présumer de la qualité de l’équipe » | J1 ; B1 ; R1 ; SteeringSummary/Teams | Refus respecté techniquement ; aucune acceptation esthétique implicite |
| Refus indicateur sans provenance | Organisation/date/faits accessibles ; source/absence explicites ; aucun droit élargi | as_of_date/version/snapshots ; Coach/Viewer/anonyme/inactif 403 ; organisation étrangère 404 ; Superadmin choisit une organisation sans agrégation ; nulls explicites ; message inexploitable vérifié en React | J1–J3 ; B1–B2 ; R1 ; E1 | Conforme technique ; refus Results réel et lecture des absences restants |

## Interprétation métier

Les quatre valeurs numériques comptent des équipes ou des passations ; aucun score n’est calculé.
« Évaluations en retard » compte des **passations**, plusieurs par équipe étant possibles.
« Jamais évaluée » n’annule pas le retard compté. « À jour » signifie seulement aucun retard connu.
Une prochaine échéance passée ne crée pas de retard sans attente matérialisée.

D vient de `timezone.localdate()`, fuseau configuré `America/Toronto`.
Les dates calendrier sont rendues sans décalage ; les instants utilisent le fuseau du navigateur.
Échéance, complétion initiale et révision sont trois dates de sens distinct.

Dernier résultat : `completed_at DESC, pk DESC` ; ni échéance ni révision ne changent sa récence.
« Avec un résultat » signifie COMPLETED accessible, sans certifier l’exploitabilité du snapshot radar.
Le lien conserve organisation/famille/équipe, mais **n’impose pas la version historique**.
Results choisit sa version courante avec résultats et explique une équipe absente.
Lien par carte, version imposée par URL ou filtre supplémentaire : arbitrage D distinct.

Dashboard : dix événements maximum, seule dernière révision de chaque passation ; aucun inventaire
exhaustif ou indicateur de performance. Les archives accessibles peuvent y figurer, contrairement à
Pilotage. Assignations personnelles réalisables, pas total des retards ; null Viewer/Superadmin
signifie non exposé, pas zéro.

## Arguments favorables et contradictoires

**En faveur d’une clôture ultérieure sans développement :** capacités présentes ;
46 tests backend, 27 assertions React et 9 E2E passent sur le candidat.
Le jeu discriminant confirme valeurs, dates, priorités, révision réelle et sources.
Aucun calcul manquant ni défaut métier reproductible observé.

**Contre une clôture immédiate :** les E2E n’ouvrent pas les définitions de Pilotage ;
leurs données (3 actives) diffèrent de J1 (4). La capture sombre superpose Dashboard et Pilotage :
elle ne démontre pas la lisibilité au repos. Le mobile montre les cartes mais les colonnes
de droite demandent un défilement ; la note sous tableau apparaît tronquée à gauche.
La persistance de cette gêne après stabilisation n’a pas été vérifiée : aucun correctif déduit ici.
L’accès navigateur était indisponible ; l’ouverture native d’Edge a expiré.
La recette visuelle J1 et les autres formats UX-09 restent non exécutés.

## Décision et qualification complémentaire bornée

Retenir **A**, sans modifier « Ouvert » ni sa date canonique.

| Cellule | Exécution exacte | Condition de passage |
| --- | --- | --- |
| Q1 — valeurs/définitions/états | J1, Admin, Vert clair/sombre, définitions ouvertes ; lire cinq cartes, D et A1–A4 en état stabilisé ; 1280×720, 1920×1080, 1280×480, 390×844 | Valeurs J1, textes/dates/notes accessibles ; captures sans superposition ; tableau défilable et liens atteignables au clavier |
| Q2 — source et vrai refus | Suivre A1/A2 après révision ; relire organisation/famille/équipe/version/notes. Puis équipe avec seule version ancienne non sélectionnable au radar courant et contexte hors scope | Source exacte ou message explicite ; aucune équipe/version implicitement substituée ; aucun accès étranger |
| Q3 — absences/rôles | J2/J3 avec définitions ouvertes ; Dashboard des quatre rôles ; refus Pilotage Coach/Viewer ; deux thèmes aux formats pertinents | Vide/absence/0 distincts ; auteur Viewer masqué ; scopes compréhensibles, aucun classement/score ; preuve datée par rôle |

La capture de transition ne bloque pas automatiquement les calculs indépendants.
Si la gêne persiste en Q1, consigner une anomalie reproductible séparée (viewport, étapes,
état stabilisé, propriétaire shell/UX), sans développer de correctif dans cette mission.
Si Q1–Q3 passent et la DoD applicable est démontrée, soumettre une **clôture proposée** au suivi.
Toute extension du contrat devient D. MEP-070 peut consommer le rapport avec ses réserves ;
MEP-047 n’est ni attendu ni modifié.
