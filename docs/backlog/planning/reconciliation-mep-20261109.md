# Rattrapage documentaire MEP — 2026-11-09

Inventaire établi avant modification sur `7bb8406d0ea71438538106cdb9b2b2a202b948a8`,
dernier `origin/main` récupéré le 2026-11-09. Le dossier de refus MEP-018 est déjà intégré.
Périmètre : rapprochement documentaire, sans développement, nouveau PBI ou changement de gouvernance.

## Matrice des écarts constatés avant régularisation

| PBI | Statut canonique | Réalisation technique | Preuves | Décision produit | Écart | Traitement |
| --- | --- | --- | --- | --- | --- | --- |
| MEP-017 | Ouvert / N/A | Correctif faible hauteur et qualification publiés | [Rapport et manifeste](../../quality/mep-017/README.md), SHA `62fb3ab`, CI et exhaustive réussies | Clôture confirmée par le responsable produit dans la demande ; date explicitement confirmée : 2026-11-09 | Statut et descriptions de travaux à faire obsolètes | Réalisé le 2026-11-09 ; [décision et DoD](../../quality/mep-017/cloture.md), sans antidater la livraison |
| MEP-018 | Ouvert / N/A | Chargements qualifiés, candidat `8609c85` publié | [Décision publiée le 9 novembre](../../quality/mep-018/decision-20261109.md), tentative 2 réussie | Clôture refusée : écart README préalable non résolu | Anciennes formulations du plan ne mentionnent pas les acquis ni le refus | Statut/date et dossier préservés ; plan courant relié au refus publié |
| MEP-051 | Ouvert / N/A | Erreurs confidentielles masquées et reprises qualifiées, `5f2bb22` publié | [Rapport](../../quality/mep-051/README.md), [preuves et limites](../../quality/mep-051/preuves.md), CI réussie | Clôture seulement proposée, aucune approbation acquise | Registre et plan décrivent encore une qualification à commencer | Conserver Ouvert/N/A ; référencer les acquis et la décision manquante |
| MEP-012 | Bloqué / N/A | Dossier C06 publié dans `b584514` | [Qualification](../../quality/mep-012/qualification.md), [proposition C06](../../quality/mep-012/proposition-c06.md) | Arbitrage non approuvé | Le suivi ne pointe pas encore le dossier C06 disponible | Conserver Bloqué/N/A ; relier la proposition sans appliquer les critères proposés |
| MEP-055 | Bloqué / N/A | Contrat préparatoire publié, aucune cible qualifiée | [Contrat et validation](../../operations/installation-prerequisites-validation.md) | D01–D09 non obtenues | Aucun décalage de statut démontré | Aucun changement ; dépendances installation conservées |

Publication technique, CI verte et approbation fonctionnelle sont trois faits distincts.
Aucune clôture supplémentaire ne découle du présent inventaire. TEAM-003 et les autres worktrees
ne sont ni modifiés ni nettoyés. Les rapports historiques et leurs chiffres datés restent intacts.

## Identité des livraisons et CI vérifiées

Lecture API GitHub le 2026-11-09 ; chaque conclusion ci-dessous porte sur le SHA complet indiqué.
Les commits sont ancêtres de la base auditée (`git merge-base --is-ancestor`).

| Objet | SHA exact publié | CI / résultat |
| --- | --- | --- |
| MEP-017, correctif puis qualification finale | `1102f3446df0f0aace15be9db50f95b3aaea5287`, puis `62fb3abbb9a25299659588a34e626095082e919d` | [Quality gate 42228338037](https://github.com/GaranceRichard/assess-teams/actions/runs/42228338037) réussi sur le second SHA ; full et Required impact gate réussis |
| MEP-017, exhaustive existante | `62fb3abbb9a25299659588a34e626095082e919d` | [Exhaustive qualification 42240732606](https://github.com/GaranceRichard/assess-teams/actions/runs/42240732606) réussie ; huit partitions backend, couverture globale, frontend, deux shards E2E et full gate réussis |
| MEP-051 | `5f2bb226b4f8f4865736e64060f247fe3fb67819` | [Quality gate 42270139865](https://github.com/GaranceRichard/assess-teams/actions/runs/42270139865) réussi ; ne vaut pas approbation |
| Base du rapprochement / refus MEP-018 | `7bb8406d0ea71438538106cdb9b2b2a202b948a8` | [Quality gate 42613825254](https://github.com/GaranceRichard/assess-teams/actions/runs/42613825254) réussi |

MEP-018 conserve ses SHA, tentatives, écart et réserves dans sa décision ; aucun résultat n'est réinterprété.
La CI de ce rattrapage sera fournie avec le SHA final au compte rendu, après publication seulement.

## Indicateurs recomptés depuis les lignes canoniques

Ordre des effectifs : Réalisés / Ouverts / En cours / Bloqués ; pourcentages arrondis à l'entier
le plus proche sur le nombre total de PBI actifs, sans exclure les bloqués du dénominateur.

| Ensemble | Avant | Après | Total inchangé | Avancement avant → après |
| --- | --- | --- | ---: | --- |
| FEAT-052 / F04 | 1 / 0 / 0 / 1 | 1 / 0 / 0 / 1 | 2 | 50 % → 50 % |
| FEAT-056 / F08 | 2 / 3 / 0 / 0 | 3 / 2 / 0 / 0 | 5 | 40 % → 60 % |
| FEAT-059 / F11 | 0 / 3 / 0 / 1 | 0 / 3 / 0 / 1 | 4 | 0 % → 0 % |
| EPIC-011 / E01 | 11 / 0 / 0 / 1 | 11 / 0 / 0 / 1 | 12 | 92 % → 92 % |
| EPIC-012 / E02 | 14 / 3 / 0 / 0 | 15 / 2 / 0 / 0 | 17 | 82 % → 88 % |
| EPIC-013 / E03 | 0 / 18 / 0 / 1 | 0 / 18 / 0 / 1 | 19 | 0 % → 0 % |
| EPIC-014 / E04 | 2 / 12 / 0 / 0 | 2 / 12 / 0 / 0 | 14 | 14 % → 14 % |
| MESS E01–E04 | 27 / 33 / 0 / 2 | 28 / 32 / 0 / 2 | 62 | 44 % → 45 % |
| Fonctionnel actif | 25 / 8 / 0 / 1 | 25 / 8 / 0 / 1 | 34 | 74 % → 74 % |
| Global actif | 52 / 41 / 0 / 3 | 53 / 40 / 0 / 3 | 96 | 54 % → 55 % |

Vérifications : 12 + 17 + 19 + 14 = 62 ; 34 + 62 = 96 ; 28 + 32 + 0 + 2 = 62 ;
53 + 40 + 0 + 3 = 96 ; 43 non réalisés globaux = 40 ouverts + 3 bloqués.
Les autres Features gardent leurs numérateurs, dénominateurs et dates ; aucun parent n'est changé.
Les acquis historiques, l'alias MEP-041 et le jalon MEP-035 restent hors des dénominateurs actifs.

## Décisions restant nécessaires

- MEP-018 : preuve contemporaine ou décision explicite de gouvernance traitant l'écart README,
  conformément au refus publié ; aucune dérogation dans ce lot.
- MEP-051 : approbation fonctionnelle explicite sur le rapport, les preuves, leur portée et les réserves,
  puis date de clôture à décider ; ni les 20 tests ciblés ni la CI ne prononcent cette clôture.
- MEP-012 : approbation ou refus de C06, critères/verdict/date et réserves explicites ; statut Bloqué conservé.
- MEP-055 : D01–D09 par les autorités MESS ; aucune infrastructure ou cible approuvée supposée.

## Revue documentaire et validation du lot

README, règles agents, charte, DoD, stratégie de tests, fondamentaux et contrat API relus.
Le README et les vues courantes sont affectés par la clôture 017 ; aucune règle, exigence métier,
condition d'acceptation, API ou architecture n'est modifiée. Les pièces historiques restent inchangées.
Tests applicatifs, coverage, builds, migrations et OpenAPI : non applicables à ce diff de prose.
Aucune nouvelle campagne exhaustive ; les preuves historiques gardent leur SHA et leur portée.
Contrôles requis : `npm run quality:targeted`, liens locaux, diff, limite de 200 lignes,
pré-push documentaire bloquant puis CI indépendante du SHA publié via `npm run publish`.
Le GO MESS, les PV cible et la promotion du candidat exact restent distincts de ce rattrapage.

Contrôles locaux du 2026-11-09 : `quality:targeted` réussi, scope documentation seul, zéro échec ;
liens locaux des dix fichiers, statuts/dates des 96 lignes, sommes et empreintes du manifeste 017
au SHA publié vérifiés. `git diff --check` conforme ; sources et rapports historiques hors diff.
