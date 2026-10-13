# MEP-035 — Décision GO/NO-GO

Jalon canonique de préparation MESS, conservant l’identifiant historique MEP-035.
Il n’est ni un PBI technique ni une Feature ; il est exclu des dénominateurs d’avancement.
Le rattachement historique FEAT-048 reste dans l’[instantané](mess-historique.md).

## Suivi canonique

| État de suivi | Décision | Date de décision / réalisation | Responsable | Candidat / empreinte | Preuves |
| --- | --- | --- | --- | --- | --- |
| Ouvert | À définir — non rendue | N/A | À définir avec le MESS dans F11 | À définir | À définir — aucun PV cible global enregistré |

Aucun GO ni responsable n’est inventé par la refonte. Le statut historique Ouvert et la date N/A sont conservés.
Une décision enregistrée, même NO-GO, passe le jalon à Réalisé avec date ISO, attribution, motif et preuves ;
les PBI non satisfaits restent ouverts/bloqués. Une nouvelle décision est historisée après correction.

## Intention et critères

En tant que responsable de MEP désigné avec le MESS, disposer des faits pour décider sur le candidat
exact : commit, version, package/empreintes, environnement et configuration expurgée identifiés.
Décision GO ou NO-GO motivée, datée et attribuée, avec anomalies, arbitrages, responsabilités et preuves liées.

Pour GO, les vingt Features MESS ont leurs critères/refus satisfaits selon la DoD ; les acquis historiques
restent valides dans leur périmètre. Les PV F18/F19/F20 concernent le même candidat effectivement livré ;
les guides/configuration/exploitation et la reprise sont démontrés, la CI et le pre-push sont conformes,
aucune anomalie bloquante sécurité, intégrité, exploitation ou UX ne subsiste. Les arbitrages applicables
sont résolus ou le périmètre est explicitement limité, notamment ARB-ORG-005.

Prérequis de décision GO : 18.01/18.02, 19.01/19.02/19.03, 20.01/20.02/20.03 et ensemble des capacités
F01 à F20 satisfaites ; identifiants dans la [source](../source/07-pre-mep.md) et les fiches détaillées.
Les seuils disponibilité/reprise et les responsabilités sont fixés par 11.02, pas par hypothèse.

Vrais refus : candidat non identifié, preuve manquante ou portant sur une autre version, incident non résolu,
restauration non démontrée, scénario critique non passé ou gate échoué imposent NO-GO.
Aucune dérogation ne contourne les gates du produit. NO-GO peut être consigné dès un blocage démontré.
Seul un GO explicite autorise la MEP ; un jalon Réalisé ne signifie jamais automatiquement GO.
