# Revue de la refonte d’ordonnancement — 2026-10-21

Instantané historique : compteurs et « prêts » ci-dessous sont datés. Pour le courant, suivre le [plan consolidé](pre-mep.md) et les [natures/deltas](../source/08-ecarts-et-qualifications.md), sans relancer les acquis.

Périmètre strictement documentaire, base finale `7f456fdbb4fc3ba03e77955630ccad08537a3e5b` après resynchronisation.
Branche `codex/mess-backlog-order`, worktree interne `C:\Users\garan\Desktop\Projets\Assess-teams-mess-backlog-order`.
[Plan pilotable](pre-mep.md), [décisions sur les dépendances](mess-dependances.md),
[62 lignes de suivi](../tracking/pre-mep-view.md) et [registre canonique](../tracking/pbis.md).

## Examen exhaustif des PBI existants

Lecture des vingt fiches F01–F20, critères/refus et dépendances, rapprochés des quatre sections canoniques,
des acquis historiques et des correspondances. L’avancement ne constitue ni recette ni autorisation de MEP.

| Feature examinée | PBI actifs | Réalisés | Ouverts | Bloqués | Traitement d’ordonnancement |
| --- | ---: | ---: | ---: | ---: | --- |
| F01 — FEAT-049 — Sécurité de production | 5 | 5 | 0 | 0 | Acquis référencés, qualification cible en F20 |
| F02 — FEAT-050 — SQLite en exploitation | 3 | 3 | 0 | 0 | Acquis conservés, charge cible distincte |
| F03 — FEAT-051 — Journalisation/conservation | 2 | 2 | 0 | 0 | Aucune purge/collecte à recréer |
| F04 — FEAT-052 — Gouvernance Git/CI | 2 | 1 | 0 | 1 | MEP-043 livré, réserve acceptée ; divergence de suivi MEP-012 signalée |
| F05 — FEAT-053 — Notation | 3 | 0 | 3 | 0 | U2, après cadrage visuel par choix d’ordre |
| F06 — FEAT-054 — Résultats/comparaisons | 4 | 0 | 4 | 0 | U3a, avant candidat final |
| F07 — FEAT-055 — Pilotage/dashboard | 2 | 0 | 2 | 0 | U3b, parallèle aux résultats |
| F08 — FEAT-056 — Responsive/interactions | 5 | 0 | 5 | 0 | U4, anticipable sur composants indépendants |
| F09 — FEAT-057 — Cohérence visuelle/thèmes | 3 | 0 | 3 | 0 | U1 prioritaire, MEP-067 pour mesures clair/typographie |
| F10 — FEAT-058 — Configuration unique | 2 | 0 | 2 | 0 | I1 puis chargement I2 |
| F11 — FEAT-059 — Contrat installation/exploitation | 4 | 0 | 3 | 1 | D01–D09 externes ; opérations puis entrées documentaires |
| F12 — FEAT-060 — Distribution autonome | 4 | 0 | 4 | 0 | Inventaire, build/wheels parallèles, assemblage |
| F13 — FEAT-061 — Installation automatisée | 4 | 0 | 4 | 0 | Séquence de préflight à diagnostic |
| F14 — FEAT-062 — Cycle d’exploitation | 2 | 0 | 2 | 0 | Services puis mise à jour sûre |
| F15 — FEAT-063 — Sauvegarde/réversibilité | 3 | 0 | 3 | 0 | Sauvegarde/restauration parallèles à services/upgrade, puis rollback |
| F16 — FEAT-064 — Documentation/transfert | 3 | 0 | 3 | 0 | Guides anticipés, finalisés sur commandes/package réels |
| F17 — FEAT-065 — Préparation des recettes | 3 | 0 | 3 | 0 | MEP-067 en premier, MEP-030 parallèle, MEP-031 après contrat |
| F18 — FEAT-066 — Recette hors ligne | 2 | 0 | 2 | 0 | Candidat réel, pose vierge puis usage hors Internet |
| F19 — FEAT-067 — Recette fonctionnelle/UX | 3 | 0 | 3 | 0 | Trois parcours parallèles après MEP-068 et correctifs requis |
| F20 — FEAT-068 — Recette technique/reprise | 3 | 0 | 3 | 0 | Essais parallèles isolés après MEP-068 ; F04 portée au GO |
| Total actif | 62 | 11 | 49 | 2 | 18 % ; aucun changement de statut/date |

17 prêts selon les prérequis enregistrés : MEP-013/014/015/016/017/018/044/045/046/047/048/049/050/051/052,
MEP-030 et MEP-067. Le prochain recommandé reste MEP-067 ; l’éligibilité ne définit pas l’ordre de valeur.
Les 51 non réalisés figurent tous dans la séquence ou ses blocages. Les 62 lignes détaillées restent
alignées avec les sources et le registre ; MEP-041 archivé, Job 1 et MEP-035 restent hors dénominateur actif.

## Contrôle de cohérence reproductible

Comparer les titres `## MEP-NNN` des F01–F20 aux lignes des quatre registres : ensembles de 62 IDs uniques,
parents identiques, dates/statuts égaux à la base. Extraire les champs Dépendances : chaque identifiant
est connu, sans auto-dépendance ni cycle formel. Confronter chaque ligne du suivi détaillé à sa source.
Comparer les champs Intention/description, Acceptation et Refus avant/après : 186 champs inchangés.
Un seul arc diffère : retrait MEP-034 → MEP-043, motivé et historisé, F04 toujours exigée au jalon.
Recompter les statuts et les prêts selon les dépendances ; vérifier couverture des 51 non réalisés,
liens locaux, longueur des fichiers et absence de modification hors README et documentation du backlog.

Ces vérifications sont une revue de données documentaires, pas une nouvelle suite de tests applicatifs
ou une modification de l’outillage. Les commandes de gates restent celles du dépôt.

## Revue d’impact et DoD

- README annoncé avant les modifications, avec lien vers le nouveau chemin de MEP.
- AGENTS, règles détaillées, charte qualité, DoD et stratégie de tests consultés ; aucune règle ni aucun seuil modifié.
- Fondamentaux, API/OpenAPI, contrat MEP-055 et audit MEP-012 confrontés à la planification : aucune évolution applicative ou d’architecture nécessaire pour ce diff.
- Sources MESS, registre et vues de planification/synthèse alignés. Historique, preuves, parents, tailles, modèles recommandés, critères et refus conservés ; un arc de dépendance retiré explicitement.
- Tests fonctionnels/API/contrat/E2E, couvertures, lint/build/typecheck applicatifs, migrations et génération OpenAPI : non applicables au diff de prose dans les emplacements audités. Leurs obligations sur les futurs PBI et la qualification exhaustive MESS restent inchangées.
- Aucun secret réel ni donnée de production ajouté ; D01–D09 et seuils d’exploitation restent non décidés. Aucun PV MESS, GO, package, transfert de dépôt ou installation n’est revendiqué.
- Aucun code, script, workflow, protection GitHub, nouveau PBI ou PR modifié/créé par ce chantier.
- Validation locale : `npm run quality:targeted` réussi, scope documentation seul, zéro échec ; lignes, secrets, structure et règles documentaires conformes. Premier contrôle de lignes refusé sur README à 202 lignes, corrigé par remplacement du paragraphe de cadrage devenu redondant ; maximum final 200 lignes.
- Revue de cohérence réussie : 62 PBI/20 Features, 186 champs source préservés, statuts/dates/parents inchangés, seul arc retiré MEP-034 → MEP-043, 17 prêts et 51 non réalisés couverts ; 434 liens locaux résolus sur 17 fichiers documentaires. `git diff --check` conforme.

## État de livraison

Le commit initial `acf4cc1` a été conservé localement tant que MEP-043 attendait sa livraison.
Cette condition est levée : MEP-043 est livré/nettoyé, critères révisés et réserve G05 acceptée conservés.
Resynchronisation sur `7f456fd`, conflit du suivi résolu en conservant MEP-043 Réalisé/2026-10-21 ;
recomptage final : 11 réalisés, 49 ouverts, 2 bloqués, aucun statut modifié par cette refonte.
Livraison : gates documentaires frais,
`npm run publish`, pré-push obligatoire, CI verte du SHA exact, fast-forward sûr du main principal,
puis nettoyage du seul worktree/branche terminé. La livraison documentaire ne vaut pas GO applicatif.
