# MEP-030 — Revue du cahier et DoD documentaire

Le 2026-10-22, base `origin/main` à `4bfb4a5` ; branche `docs/mep-030-functional-acceptance`,
worktree interne `C:\Users\garan\Desktop\Projets\Assess-teams-mep-030`.
Livrable : [cahier fonctionnel](functional-acceptance.md), jeux et fiches FON-01 à FON-18 ;
[source MEP-030](../backlog/source/mess/f17.md) et [registre](../backlog/tracking/mess-e04.md).
La réalisation de MEP-030 signifie que les scénarios sont définis ; aucun scénario applicatif ni PV cible exécuté ici.

## Critères et vrais refus du cahier

| Exigence de MEP-030 | Vérification documentaire |
| --- | --- |
| Par rôle/parcours | FON-01/03 balayent les quatre acteurs ; FON-04/05/06/07 administration, FON-08 à 13 modèle/planning/passation, FON-14 à 18 consultation/pilotage |
| Préconditions et données fictives | G0 à G6, versions/notes/dates, scopes et IDs à relever ; préparation écran distincte des fixtures destructives sur clone |
| Actions et attentes vérifiables | Étapes ordonnées, réponses HTTP/états/provenance, oracles radar/historique et décompte des retards ; résultats observés à renseigner |
| Vrais refus | Permissions, hors scope, invariants, incomplet, valeurs invalides, état immuable et responsabilité suspendue ; relecture sans effet et sans faux succès métier |
| PBI et preuves | PBI métier et consommateur, suites existantes et références de contrats par fiche ; captures, valeurs et rapports requis |
| Livré distinct de l'ouvert | Tableau de périmètre, USER/ORG/TEAM partiels, correctifs UX et recettes cible ouverts ; arbitrages 005/006/007/010/013 non tranchés |
| Pas de validation fictive | Tous les cas Non exécutés ; modèle de PV et critères de refus des preuves ; panne simulée distincte d'un vrai refus serveur |

Rejeter le cahier si une capacité ouverte est supposée livrée, une donnée sensible nécessaire au jeu,
ou un scénario critique sans résultat attendu. La revue utilise exclusivement des identités/adresses fictives,
aucun credential ni token. Les modèles sont locaux, aucun partage/export/score global/surveillance ajouté.
ARB-ORG-005 demeure bloquant pour l'administration/GO tant que décision et protection effective manquent.
La seule exclusion documentaire d'une suppression dangereuse n'est pas présentée comme une protection.

## Revue d'impact et DoD applicable

README annoncé avant rédaction puis relié au cahier. AGENTS, règles détaillées, charte qualité, DoD,
stratégie de tests, couverture fonctionnelle, fondamentaux et contrat backend/API consultés.
Contrats rôles, isolation, identités, modèles, versionnement, passation, Results/Pilotage, journaux,
notifications et mots de passe confrontés aux assertions API/E2E pertinentes.
Le contrôle des refus de planning distingue notamment 400 métier et 404 de ressource non éligible.
Aucune modification des critères/dépendances sources, aucun arbitrage ajouté ou supprimé.

Seul MEP-030 est marqué Réalisé/2026-10-22 dans le registre, puis les vues dérivées sont actualisées :
62 PBI MESS, 15 Réalisés / 45 Ouverts / 2 Bloqués ; F17 à 2/3, E04 à 2/14 ; 15 ouverts prêts.
Scoring global : 96 PBI, 40 Réalisés / 53 Ouverts / 3 Bloqués. Le rappel du registre général,
encore à 13 réalisés malgré MEP-053 canonique, et les anciens totaux ouverts globaux sont alignés
au recomptage des 96 lignes, sans nouvelle clôture voisine.
MEP-033/069/070 et MEP-035 restent ouverts ; aucune qualification ou disponibilité de cible présumée.

Tests applicatifs nouveaux, campagnes backend/frontend/E2E, coverage, lint/build/typecheck, migrations
et génération OpenAPI : non applicables à ce diff exclusivement de prose dans les emplacements audités.
Aucun comportement, composant, style, dépendance, script, workflow ni processus Git/CI modifié.
Aucune refonte des tests ni du cahier UX MEP-067. Les assertions existantes sont des appuis,
pas une preuve d'exécution nouvelle ; la [validation proportionnée](validation-costs.md) reste obligatoire.

## Contrôles et livraison

Contrôles réalisés : `npm run quality:targeted` documentaire réussi, zéro échec ;
limite de 200 lignes, détection de secrets, structure et règles documentaires conformes.
Revue complémentaire : 376 liens locaux (fichiers et ancres), 43 références backend et noms E2E présents ;
critères/refus/dépendances sources inchangés, recomptage canonique ci-dessus vérifié.
`git diff --check` réussi. Le premier contrôle a signalé un README à 202 lignes : annonce intégrée
au paragraphe de cadrage existant, README à 200 lignes, sans retirer les responsabilités documentées.
Le pre-push reste bloquant ; `npm run publish` sérialise les publications, resynchronise sur le dernier main,
pousse directement branche dédiée → main puis attend la CI du SHA publié. Aucune PR.
Livraison terminée uniquement après CI verte, main principal propre synchronisé en fast-forward,
puis suppression du seul worktree et de la branche MEP-030.
