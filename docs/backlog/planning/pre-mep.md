# Backlog opérationnel — chemin vers une version installable MESS

Suivi actualisé le 2026-11-16 ; refonte du 2026-11-14 sur `c82f4e4` ; [sources](../README.md#source-fonctionnelle-détaillée),
[registre canonique](../tracking/pbis.md), [dépendances et disponibilité des 35 non réalisés](mess-dependances.md).
Les **96 PBI actifs** comptent 61 réalisés et 35 non réalisés après les trois clôtures approuvées
le 2026-11-16 (054/057/022). Le rapprochement du 14 novembre et ses décisions restent historiques.
Les huit PBI Job 1, MEP-041 archivé et MEP-035 hors dénominateur restent conservés.

## Préparation de la remise en cohérence — 2026-11-14

- Périmètre : examiner les 96 PBI et corriger leurs sources, dépendances, registres et vues de pilotage.
- Objectif : retirer les validations externes non demandées et les lancements obsolètes qui empêchent la réalisation.
- Effets attendus : profil technique de référence testable, résultats bornés et prochains PBI immédiatement exécutables.
- Risques : préserver les réalisations, décisions produit, historique, chantier ORG-004 et qualification du site réel.
- Vérification : rapprochement sources/registre, critères/refus et graphe sans cycle ; liens et gates documentaires.

Préparation consignée avant les corrections. Aucun travail applicatif ni fichier technique modifié ; les
sources et le suivi sont le livrable demandé. Le README est relu pour impact public et liens de pilotage.

## Règle de lancement

**Prêt** signifie résultat et refus assez définis, entrées réellement consommées disponibles ; commencer
la réalisation directement depuis la source, sans nouvel audit préalable. **Non prêt** nomme l’entrée
manquante ; on ne remplace pas une capacité entière par un inventaire préparatoire. Ouvert/Bloqué restent
les statuts du registre ; l’aptitude n’en crée pas de nouveaux. Une clôture reste une décision distincte.

Le [profil REF-WIN-01](../../operations/installation-prerequisites.md#profil-technique-de-référence-ref-win-01)
est une convention de réalisation, pas une homologation MESS. D01–D09 sont des axes de contrôle sans neuf
approbations externes. MEP-054 définit des paramètres, MEP-057 fige versions/ABI/empreintes ; ils n’attendent
plus la clôture de MEP-055. MEP-022 définit opérations et mesures sans SLA externe supposé.
Un banc qualifié ne qualifie que ce banc ; l’accès au site réel reste nécessaire pour le GO MESS.

<a id="actions-immédiatement-exécutables-et-porte-de-sélection"></a>

## Les dix prochains PBI par valeur

Tous gardent la priorité canonique P1. L’ordre combine réduction du risque, capacité débloquée et coût
recommandé ; XS/S ne sont pas des engagements. Les Non prêts sont la suite prévue une fois leurs entrées livrées.

| Rang | PBI / capacité livrable | Aptitude actuelle et raison | Valeur / coût recommandé |
| ---: | --- | --- | --- |
| 1 | [MEP-021 — Chargement commun de la configuration](../source/mess/f10.md) | **Prêt** : MEP-054 et MEP-009 réalisés ; contrat et refus disponibles | Première capacité runtime de la chaîne ; S |
| 2 | [MEP-058 — Frontend et assets locaux de distribution](../source/mess/f12.md) | **Prêt** : MEP-057 réalisé ; I02 Swagger à traiter sur les assets produits | Artefact normal sans CDN ni build cible ; S |
| 3 | [MEP-059 — Dépendances Python hors ligne](../source/mess/f12.md) | **Prêt à engager** : MEP-057 réalisé ; I01 runtime corrigé à traiter avant packaging | Wheels exactes et pose sans Internet à démontrer ; S |
| 4 | [TEAM-006 — Consultation séparée des archives](../source/02-equipes.md) | **Prêt** : TEAM-005 réalisé et droits C04 décidés | Valeur utilisateur indépendante de l'installation ; S |
| 5 | [MEP-055 — Prérequis d'installation](../source/mess/f11.md) | **Prêt** : Ouvert/N/A sur décision du 2026-11-14 ; aucune clôture déduite | Vérifier le contrat de référence et ses refus ; XS |
| 6 | [MEP-031 — Scénarios de recette technique](../source/mess/f17.md) | **Prêt** : MEP-022 et MEP-039 réalisés ; finaliser le cahier | Attentes mesurables, sans PV cible anticipé ; S |
| 7 | [MEP-024 — Assemblage reproductible du package](../source/mess/f12.md) | **Non prêt** : attend 058/059/021 ; 022 réalisé, I01–I03 conservées | Package exact et manifeste, outils livrés seulement ; S |
| 8 | [MEP-060 — Préflight et chemins persistants](../source/mess/f13.md) | **Non prêt** : package 024 et configuration 021 manquants | Refus avant effet destructif ; S |
| 9 | [MEP-061 — Pose locale des composants](../source/mess/f13.md) | **Non prêt** : préflight 060 à livrer | Installation sans résolution réseau ; S |
| 10 | [MEP-064 — Sauvegarde cohérente SQLite](../source/mess/f15.md) | **Non prêt** : attend 021 ; 022 réalisé, sans attente 025 | Snapshot cohérent et refus, indépendants de l'installateur ; S |

MEP-055 : **Ouvert / N/A sur approbation explicite du responsable produit le 2026-11-14**, sans clôture.
Prêt pour vérifier la cohérence du contrat et ses refus, puis proposer sa clôture distinctement. MEP-012 attend la décision
C06 sur son dossier publié ; aucune nouvelle investigation Git/CI n’est une tâche préalable.

## Chemin technique et travaux parallèles

1. **Dès maintenant en parallèle** : 021 (chargeur), 058 (frontend), 059 (Python) et TEAM-006 (archives).
   Limiter les éditions concurrentes de documentation commune ; intégrer chaque PBI prêt sans attendre les autres.
2. **054/057/022 réalisés** : 021/058/059 peuvent être engagés, I01–I03 sans résolution présumée. Après 021,
   064 livre la sauvegarde indépendamment de l’installateur ; 031 peut finaliser le cahier technique. 023/056 alignent les sources
   de 021/022 dans leurs documents existants, sans nouveau dossier ni campagne d’audit.
3. **Installation** : 058 + 059 + 021 + 022 → 024 → 060 → 061 → 062 → 025. 025 vérifie les commandes
   workers avant automatisation ; 063 supervise ensuite API/workers/tâches. Aucun cycle 024↔063.
4. **Exploitation** : 064 et 063 convergent vers 026 (upgrade) et 027 (restauration), parallélisables sur
   clones distincts ; 026 + 027 → 065 (rollback). 028 suit les commandes d’installation livrées ; 066 suit
   les opérations réelles ; 029 complète le fork/package, sans migration d’hébergement imposée.
5. **Candidat final** : réassembler 024 avec le build courant, services et outils de reprise désormais
   livrés. Identifier SHA/version/manifeste/empreintes, profil mesuré et configuration expurgée. Aucun outil futur déclaré présent.
6. **Recettes** : 025 + 028 + 031 → 032 (vierge), puis 032 + 063 + 030 → 068 (usage sans Internet).
   033/069/070 et 034/071/072 peuvent ensuite avancer en parallèle sur clones identifiés du même candidat,
   chacun avec ses propres prérequis et vrais refus. C’est une qualification, pas du développement caché.
7. **MEP-035** : PV du candidat et site réellement disponibles, guides, F01–F20, arbitrages applicables
   et qualification exhaustive du SHA exact satisfaits ; décision GO/NO-GO attribuée et explicite.

Le chemin 054→021 et 057→058/059 converge au package ; sa durée dépend des capacités disponibles,
pas de neuf signatures. Les dépendances techniques de livraison figurent dans les sources ; un ordre
recommandé ou la préparation d’un guide ne crée aucune attente supplémentaire.

## Décisions qui restent réellement nécessaires

| Sujet | Point précis / options à approuver | Effet limité |
| --- | --- | --- |
| ARB-ORG-005 / ORG-004 — décision rendue | Responsable produit le 2026-11-14 : A/R01–R09 approuvées, R03 sous rétentions existantes ; aucune validation externe MESS ni repli D | [Réalisation et preuves ORG-004](realisation-org-004/README.md), statut Ouvert/N/A jusqu’à approbation fonctionnelle ; 033/GO vérifient la protection du candidat |
| C01/C02 | Collecte/reprise nom/prénom et lien mail/login ; conserver ou réviser explicitement champs mutables et droits actuels FEAT-004 | USER-002/003 complets non prêts ; USER-001 historique conservé |
| C03 | Projection Coach minimale dédiée ou contexte existant seulement ; données et accès précis à choisir | ORG-002 complet non prêt ; Viewer conserve Results selon concepts |
| C05 | Reprise automatique ou explicite des affectations/plans/échéances après réactivation, avec historique préservé | TEAM-007 non prêt ; TEAM-006 indépendant |
| C06 | Approuver le verdict/date proposé de MEP-012 selon les décisions Git acquises | Statut Bloqué conservé, aucun chantier PR/CI ni nouvel audit Apps |
| MEP-055 — décidé | Bloqué→Ouvert explicitement approuvé le 2026-11-14, réalisation N/A ; clôture non approuvée | Suivi régularisé ; ne bloque plus 054/057 ni ne qualifie MESS |
| C21 | Acceptation visuelle et inclusion au candidat du correctif déjà publié `eede631` | Aucun nouveau PBI ou développement présumé ; CI ne décide pas l’esthétique |

C11 : objectifs contractuels éventuels et titulaires du **site réel** à établir avant promesse de service
ou exploitation de ce site ; protocoles techniques de référence et outils ne les attendent pas.
C12 : absorption de MEP-056 demeure une option facultative ; conserver le contrôle existant ne demande
aucune décision nouvelle. Les 19 Features sans PBI restent non raffinées ; aucun ajout au périmètre de MEP.

## Revue documentaire et livraison — refonte du 2026-11-14

Les 58 réalisations et leurs dates restent acquises ; EPIC-012 est complet pour ses 17 PBI raffinés.
Les audits datés restent historiques ; ce plan et les sources corrigées remplacent leurs conseils de lancement.
ORG-004/ARB-ORG-005 et le worktree parallèle ne sont pas modifiés. README, règles agents, charte, DoD,
stratégie, architecture et contrat API sont relus ; aucune évolution applicative, migration ou règle de gate.
Le README public garde ses entrées valides et ses capacités exactes : aucune modification artificielle.
Préparation réellement effectuée avant corrections ; aucun écart de procédure ni approbation humaine supposée.
Vérification : 96 sources/96 lignes de registre, 38 résultats/refus/prérequis/preuves couverts ; graphe sans
cycle, 58 contrats réalisés et ORG-004 conservés littéralement, seul statut modifié MEP-055 sur accord.
quality:targeted final réussi en documentation seule, zéro échec ; 905 liens locaux vérifiés, maximum
199 lignes ; diff --check conforme, aucun secret ni artefact ajouté. Aucun résultat de recette MESS déduit.
Tests backend/frontend/E2E, couverture et génération OpenAPI non applicables au seul diff documentaire.
Publication : quality:targeted, commit, npm run publish, pré-push bloquant, CI du SHA exact et fast-forward
sûr du main principal ; nettoyage du seul worktree et de la seule branche terminés, aucune PR.

Suite ORG-004 du 2026-11-14 : la décision produit ci-dessus complète ce plan après sa refonte. Les
mentions de conservation littérale d’ORG-004 dans la revue du mandat précédent restent historiques ;
les conventions et autres dépendances de ce mandat sont conservées. Aucun PBI n’est clôturé ici.

## Clôtures approuvées — 2026-11-16

Clôtures 054/057/022 approuvées, critères/refus/DoD et CI des réalisations
vérifiés sur leurs preuves existantes, après correction MEP-022 publiée et CI verte. Seuls ces trois
statuts/dates changent ; 61/96 réalisés, 35 non réalisés, MESS 33/62. Aptitudes recalculées sans nouvel arc.
Revue README, règles, charte, DoD, tests, architecture/API : aucun impact public ou technique ; gates
strictement documentaires. Les décisions, historiques et réserves I01–I03 restent conservés.

Contrôles de clôture : PASS, seules les trois transitions/dates autorisées parmi 96 entrées ;
62 statuts/dates MESS alignés avec la vue dérivée, 35 aptitudes non réalisées et 404 liens locaux vérifiés.
Critères F10/F11/F12 et texte I01–I03 identiques ; quality:targeted documentaire réussi, zéro échec.
