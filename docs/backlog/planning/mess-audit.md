# Audit contradictoire du backlog MESS — 2026-10-14

## Conclusion et base de comparaison

**Retenu : 4 Epics, 20 Features et 62 PBI actifs**, avec un acquis référencé hors dénominateur.
Les **63 points fonctionnels détaillés du cadrage restent couverts** ; aucune suppression de capacité.
Le total initial annoncé était **61**, la refonte `a406801` comptait **63 fiches**.
La [matrice exhaustive des intitulés, tailles, origines et traitements](mess-cadrage-matrice.md) rapproche
chaque ligne disponible ; les [36 anciens travaux](pre-mep-rapprochements.md), jalon inclus, restent traçables.

| Base | Nature de la preuve | Cardinalité | Limite |
| --- | --- | ---: | --- |
| En-tête du premier prompt de refonte | Cadrage déclaratif dans cet échange | 61 annoncés | Pas de liste distincte de 61 intitulés fournie |
| Liste détaillée E01–E04 / F01–F20 du même prompt | Transcription ligne par ligne dans la matrice | 63 points | 13 + 17 + 19 + 14 ; pas deux ajouts identifiables |
| Sources / registres à a406801 | Inventaire Git reproductible de la refonte | 63 fiches | Inclut MEP-041, alias de capacités déjà canoniques |
| Sources / registres après audit | Même couverture, doublon archivé | 62 PBI actifs | 03.01 est un acquis référencé, pas un chantier supplémentaire |

Le résultat 62 ne vient pas d’une préférence numérique pour 61 ou 63 : 63 − 1 doublon documentaire.
L’écart +2 entre l’annonce et la liste existait avant la refonte ; il ne permet pas de nommer deux
« PBI supplémentaires ». Inventer un inventaire de 61 ou supprimer deux titres aurait falsifié le cadrage.

## Écarts et traitements explicites

| Écart | Preuve contradictoire | Traitement et justification | Effet sur le périmètre |
| --- | --- | --- | --- |
| C01 — 61 annoncé / 63 détaillés | Les 63 codes NN.NN existaient dans le premier prompt | Conserver toutes les intentions ; distinguer annonce, inventaire et suivi | Aucun ajout ni retrait fonctionnel |
| C02 — MEP-041 recompte un acquis | Sa seule intention est « reconnaître » JOURNAL-001/002 ; mêmes preuves et extension HTTP du 2026-10-05 | Archiver MEP-041 et sa ligne exacte ; 03.01 référence les PBI existants, jamais reparentés | Un PBI actif en moins ; aucune capacité supprimée |
| C03 — Validation globale attribuée au demandeur | Une réponse de comptage existe, mais aucun audit fonctionnel n’y figure | Retirer les formulations de « cible confirmée » comme preuve de périmètre ; fonder le résultat sur la matrice | Aucun statut réalisé inventé ni exigence réputée validée par déduction |
| C04 — WCAG AA / zoom 200 % prescrits | La liste initiale exige lisibilité/accessibilité ; MEP-019 historique dit « zoom supporté », sans ces deux prescriptions | Retirer les niveaux numériques/normatifs présumés de 09.01/09.03 ; mesures à définir dans le cahier UX 17.02 | Intentions conservées, prescriptions non sourcées retirées ; aucune règle qualité modifiée |
| C05 — Dépendance artificielle à MEP-041 | 03.02 dépendait d’un alias sans livraison propre | Référencer directement JOURNAL-001/002 réalisés | Même prérequis acquis, sans réouverture ni attente nouvelle |
| C07 — 03.02 absent de la liste des prêts | Ses prérequis réalisés permettaient déjà sa préparation | Réintégrer MEP-042 dans le plan des prêts ; statut inchangé | Omission de vue corrigée, aucun nouveau PBI |
| C06 — Mesures de recette implicites | 09.01/09.03 exigent mesures/zoom sans contrat de scénario | Dépendance explicite à MEP-067 (17.02) ; conserver Ouvert, pas Bloqué par un simple prérequis ouvert | 24 PBI prêts selon les prérequis enregistrés, au lieu de 26 |

## Traçabilité des décisions et correction des affirmations

La formulation « cible confirmée par le demandeur le 2026-10-13 » figurait dans la référence opérationnelle,
la synthèse et la vue de suivi ; une « décision du demandeur » figurait dans la correspondance.
Ces formulations sont remplacées par le résultat de l’audit et ses motifs, sans utiliser une approbation
présumée pour justifier une capacité ou un PBI.

L’échange consultable contient néanmoins la réponse exacte :

> Conserver les 63 PBI listés et corriger le total annoncé

Cette trace ne doit pas être niée ou fabriquée : elle choisit un total et la conservation des intitulés,
sans analyser les doublons, les seuils d’acceptation ni approuver une modification fonctionnelle détaillée.
La mission actuelle demande de réexaminer ce résultat. Le présent audit distingue donc cette réponse de
comptage d’une validation fonctionnelle globale, et remplace son usage comme justification opérationnelle.
Ni la date Git du commit ni une réponse de comptage ne constituent à elles seules une recette ou un GO.

## Conservation des réalisés et des identifiants

- MEP-001 à MEP-008 : huit réalisations du Job 1, [statuts, dates et preuves inchangés](../tracking/mess-historique.md).
- JOURNAL-001 : Réalisé le 2026-09-28, parent FEAT-039 ; JOURNAL-002 : Réalisé le 2026-09-29, parent FEAT-040, extension HTTP le 2026-10-05 ; [registre fonctionnel inchangé](../tracking/pbis.md).
- MEP-041 : [fiche d’origine](../source/mess/mep-041-historique.md) et [ligne canonique exacte](../tracking/mess-doublons-historique.md) conservées ; Réalisé/2026-10-05 restent historiques, sans réouverture ni nouvelle livraison. ID jamais réutilisé.
- MEP-009 à MEP-034 : mêmes identifiants et statuts Ouvert/N/A ; aucune capacité déjà livrée supposée absente.
- MEP-035 : jalon GO/NO-GO séparé, Ouvert/N/A ; responsable et candidat À définir ; aucune décision finale déduite du comptage.
- FEAT-042 à FEAT-048 et anciens Jobs : archives, aucune dépendance active de vague rétablie.

La régularisation permise par la [gouvernance](../governance.md) porte sur un comportement sans entrée
correspondante. MEP-041 faisait au contraire référence à deux entrées déjà canoniques : c’est la raison
fonctionnelle de sa consolidation, pas une correction arithmétique opportuniste.

## Décompositions conservées, recouvrements vérifiés

La matrice justifie individuellement les 62 PBI retenus. Inventaire/configuration, paramètres/verrous/conflits,
politique/purge, audit/correction, contrat/chargement, composants/assemblage et implémentation/recette sont
des livrables distincts. Ils peuvent partager du code ou un commit sans devenir des doublons d’intention.

Frontières examinées : 05.03 feedback de sauvegarde de notation / 08.05 erreurs transverses ;
06.01 contexte des résultats / 09.03 typographie globale ; 11.03 README/architecture / 11.04 suivi canonique
après le contrat / F16 guides détaillés ; F13 installateur / F18 PV sur cible vierge ; F15 outils de reprise /
20.03 exercice d’incident sur candidat. Pas de fusion imposée par proximité de vocabulaire.
11.04 reste le futur ajustement au contrat/configuration livrés : cet audit n’en revendique pas la réalisation.
Les compléments F01/F05–F09 vérifient les écarts avérés et réutilisent les acquis ; ils ne les recréent pas.

## Fichiers concernés et raisons

| Fichiers | Raison |
| --- | --- |
| README racine, index docs et backlog | Annonce préalable, total courant et accès à l’audit |
| planning/mess-audit.md, mess-cadrage-matrice.md | Constats contradictoires, inventaire exhaustif et justification ligne par ligne |
| source/07-pre-mep.md, source/mess/e01–e04 | Périmètre actif 62, couverture 63, retrait des affirmations de validation globale |
| source/mess/f03.md et mep-041-historique.md | Référence à l’acquis et conservation complète de la fiche consolidée |
| tracking/mess-e01.md, pbis.md, mess-doublons-historique.md | Statuts/dates canoniques préservés, un seul décompte des réalisés |
| source/mess/f09.md, f17.md | Critères issus du cadrage, choix des mesures par la recette UX et dépendances explicites |
| planning/pre-mep.md, pre-mep-rapprochements.md | Prérequis réels, 24 PBI prêts, correspondance des 36 travaux et décisions corrigées |
| tracking/pre-mep-view.md, synthese.md | Vues dérivées et agrégats : MESS 62/0 réalisé ; global 96/25 réalisés, 26 % |

Aucun code applicatif, workflow CI, hook, script ni règle de validation n’est modifié.
SQLite permanente, livraison MESS hors ligne sans Docker/Node/npm, optimisations de validation et de CI conservés.

## Contrôles documentaires et livraison

La revue contrôle les 63 points initiaux, les 62 sources actives et leurs lignes canoniques/dérivées,
les parents uniques, tailles, statuts/dates, dépendances connues et acycliques, 24 PBI prêts, liens locaux,
archives et conservation exacte des 36 correspondances et des huit réalisations du Job 1.
Les versions initiales et actuelles sont comparées contre le SHA `a406801`, pas contre une synthèse mouvante.
1 190 contrôles documentaires passent ; l’omission de 03.02 dans la liste des prêts est corrigée.
La limite de 200 lignes, les secrets et le diff strictement documentaire sont vérifiés.
Revue d’impact : README, règles agents, charte, DoD, stratégie de tests, architecture et API examinés ;
aucun comportement, endpoint, modèle ou règle qualité modifié, aucune migration ni nouveau test applicatif requis.
Les gates complets existants de pre-push et de CI restent obligatoires ; résultats de publication restitués au bilan final.

## Arbitrages humains encore possibles ou nécessaires

- Si un inventaire distinct de **61 intitulés** existe, fournir cette pièce pour un rapprochement complémentaire ; la présente matrice ne prétend pas l’avoir retrouvée.
- Niveau d’accessibilité, zoom et viewports mesurables : choisir dans 17.02 avant clôture de 09.01/09.03 ; ni AA ni 200 % n’est présumé décidé.
- Arbitrages produit existants (notamment ARB-ORG-005), OS cible, responsables, seuils de reprise et durées de conservation : inchangés, à traiter par leurs entrées existantes.
- GO/NO-GO : décision finale explicite sur le candidat livré, toujours non rendue ; aucune décision nouvelle ajoutée par cet audit.

La consolidation de l’alias ne nécessite aucun choix entre deux capacités concurrentes : la couverture
est conservée et les parents canoniques existants font autorité. Aucun deuxième retrait n’est proposé pour atteindre 61.
