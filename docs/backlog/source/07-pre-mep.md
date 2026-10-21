# Préparation de la mise en production MESS — référence opérationnelle

La hiérarchie exclusive de préparation MESS est **Epic → Feature → PBI**.
Cette refonte du 2026-10-13 conserve le backlog fonctionnel général, ses Epics/Features et ses arbitrages.
Les Jobs sont uniquement des archives ; aucune unité active de planification ou de livraison n’est un Job.

## Structure et identifiants

E01–E04, F01–F20 et NN.NN sont des repères de la demande, mappés aux identifiants canoniques ci-dessous.
EPIC-011 est conservé et recentré explicitement sur E01 ; EPIC-012 à EPIC-014 sont ajoutés.
FEAT-042 à FEAT-048 sont archivées, jamais réutilisées ; FEAT-049 à FEAT-068 portent les vingt capacités.
MEP-001 à MEP-008 restent les huit réalisations du Job 1. MEP-009 à MEP-034 sont réaffectés explicitement
à un PBI atomique de leur découpage ; leur ancien périmètre reste archivé et les compléments reçoivent
MEP-036 à MEP-072 ; MEP-041 est désormais archivé comme doublon documentaire. Aucun identifiant n’est réutilisé.
MEP-035 reste la décision finale, suivie comme jalon séparé, hors des PBI et du scoring technique.

| Repère | Epic et enjeu | Features | PBI actifs |
| --- | --- | ---: | ---: |
| E01 | [EPIC-011 — Sécurité et robustesse](mess/e01-securite.md) : Protéger les données, garantir la stabilité d’exploitation et maîtriser la traçabilité. | 4 | 12 |
| E02 | [EPIC-012 — Expérience utilisateur](mess/e02-experience.md) : Améliorer la compréhension, l’accessibilité et la fluidité des parcours d’évaluation et de consultation des résultats. | 5 | 17 |
| E03 | [EPIC-013 — Installation et exploitation MESS](mess/e03-exploitation.md) : Permettre une installation, une exploitation et une restauration autonomes, hors ligne et sans Node/npm en production. | 6 | 19 |
| E04 | [EPIC-014 — Documentation, transfert et recette](mess/e04-recette.md) : Garantir l’autonomie du MESS et réunir les preuves nécessaires à la décision GO/NO-GO. | 5 | 14 |

Résultat de l’[audit du 2026-10-14](../planning/mess-audit.md) : **4 Epics, 20 Features et 62 PBI actifs**.
Le cadrage annonçait 61, mais listait 63 points ; les 63 restent couverts par 62 PBI et l’acquis 03.01.
La justification est le rapprochement fonctionnel, pas une affirmation de validation globale du demandeur.

## Décisions structurantes conservées

- SQLite est la base permanente, y compris en production ; aucun remplacement de moteur planifié.
- Cible on-premise MESS hors ligne, sans Docker ni Node/npm ; build React et dépendances préparés ailleurs.
- Configuration d’installation centralisée, distincte des paramètres métier et arbitrages de FEAT-031.
- Apache 2.0, LICENSE/NOTICE et droits des composants distribués conservés.
- Curseur entier 0–10, choix explicite, absence distincte de zéro, repères et versions historiques conservés.
- Évaluation, résultat, accompagnement et pilotage distincts ; aucune surveillance individuelle.
- Optimisations locales de validation et CI acquises ; pre-push et Full quality gate restent bloquants.

## Contrat commun des PBI

Chaque fiche détaillée porte identifiant, parent unique, titre, user story, intention/description, valeur,
priorité P1, acceptation, vrais refus et dépendances explicites. Taille XS/S recommandée, statut et date
font autorité uniquement dans les sections MESS du [registre canonique](../tracking/pbis.md).
Le périmètre est atomique : une vérification et les seuls écarts avérés de sa capacité ; pas de refonte globale.
Les titres d’audit ne prouvent aucun défaut. Si les critères sont déjà satisfaits, réutiliser les preuves et
qualifier le périmètre exact plutôt que produire un changement artificiel. Toute preuve cible reste distincte.
Chaque réalisation exige tests/contrôles applicables, critères et refus satisfaits, DoD et intégration effective.

La séparation HTTP/métier (03.01) est un acquis référencé, sans nouveau PBI ; JOURNAL-001/002
restent dans leurs Features fonctionnelles avec leurs dates initiales. MEP-041 est archivé ; Job 1 n’est jamais relancé.
Les capacités UI, permissions et CI livrées restent des prérequis/acquis, pas des développements nouveaux.
Une recommandation XS/S ne permet pas d’élargir la fiche : un écart dépassant S impose raffinement explicite.

## Suivi, dépendances et décision

Ordre de lancement du 2026-10-21 : MEP-067 (cahier UX), puis cohérence visuelle et corrections par parcours ;
MEP-055 et la préparation installation avancent en parallèle. Le [plan pilotable](../planning/pre-mep.md)
distingue cet ordre des dépendances techniques, sans créer de PBI ni retirer de capacité requise au GO.

- [Ordonnancement par dépendances réelles et livraison progressive](../planning/pre-mep.md).
- [Audit contradictoire et matrice des 63 points initiaux](../planning/mess-audit.md).
- [Correspondance exhaustive des anciens travaux et preuves](../planning/pre-mep-rapprochements.md).
- [Avancement des vingt Features](../tracking/pre-mep-view.md), dérivé du registre.
- [Jalon MEP-035 — Décision GO/NO-GO](../tracking/mess-jalon.md), décision non rendue.
- [Ancienne source et décisions historiques](070-mep-historique.md), sans règle de lancement active.

Le responsable et les seuils de disponibilité/reprise sont à convenir avec MESS dans F11.
ARB-ORG-005 et les autres arbitrages ouverts restent dans leur registre ; la préparation MESS ne les tranche pas.
Les rapports d’audit externes ne sont pas disponibles localement ; aucune conclusion d’audit n’est inventée.
