# Audit contradictoire et raffinement intégral — conclusions et décisions ouvertes

Travail commencé le **2026-10-27**, repris et contrôlé le **2026-10-28** (America/Toronto).
Base examinée : **`3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`**, dernier `origin/main`
récupéré au démarrage et revérifié à la reprise. Le SHA n’a pas changé entre ces deux vérifications.
Branche `audit/backlog-contradictoire-20261027`, worktree dédié hors du checkout principal.

Consolidation : [revue prête à décision produit](consolidation-revue.md), avec anomalie UX refusée, actions A–F et sorties bornées.

## Lire les propositions dans cet ordre

1. **[A — Matrice des 96 PBI](matrice.md)** : diagnostic contradictoire exhaustif, huit colonnes demandées.
2. **[Restructuration et frontières](structure.md)** : responsabilités, recouvrements, 19 Features sans PBI,
   dépendances et propositions de fusion/séparation/retrait à arbitrer.
3. **[B — Backlog raffiné proposé](raffinement.md)** : index des 52 fiches A–G ; 51 PBI non réalisés
   et le delta actuel de USER-001, dont la réalisation historique est conservée.
4. **[C — Registre des contradictions](contradictions.md)** : vingt constats initiaux et C21 pour le refus des transitions, avec autorité explicite.
5. **[D — Trajectoire révisée](trajectoire.md)** : qualifications prêtes, décisions externes, chaîne MESS,
   preuves cible et backlog fonctionnel distinct.
6. **[Index des preuves](preuves.md)** et [revue documentaire](revue.md) : code, tests nommés, contrats,
   rapports existants, contrôles exécutés et limites.

Chaque identifiant dans la matrice ouvre un dossier contenant les dix dimensions demandées :
parent, valeur, comportement, code présent, tests/preuves, écart, recouvrements, prérequis,
arbitrages et traitement du statut. Les critères déjà précis des PBI réalisés sont référencés sans réécriture.
Les fiches A–G donnent des scénarios conditionnels lorsque la décision manque ; elles ne rendent pas
le PBI prêt par leur seule forme. Aucun PBI n’est créé depuis un intitulé de Feature.

## Conclusions à soumettre à revue

| Conclusion d’audit | Nombre | Conséquence proposée |
| --- | ---: | --- |
| Déjà couvert | 47 | 44 réalisés limités et 3 ouverts : MEP-045/047/048 à qualifier, sans développement présumé. |
| Partiellement couvert | 20 | Delta fonctionnel ou delta de preuve distingué explicitement dans chaque dossier. |
| Non couvert | 22 | Capacité, artefact ou PV réellement absent dans le périmètre propre ; pas d’absence métier déduite d’un PV manquant. |
| Insuffisamment défini | 2 | USER-003 contradictoire et MEP-016 sans occurrence lexicale fautive localisée. |
| Bloqué | 5 | ORG-004, MEP-012/055, et décisions indispensables à MEP-054/022 ; statuts officiels inchangés. |
| Redondant | 0 | Aucun doublon actif intégral démontré ; des recouvrements de développement et de preuve sont établis. |

Le registre demeure à **45 Réalisés, 48 Ouverts, 3 Bloqués, 0 En cours**.
Les catégories ci-dessus n’en sont pas de nouveaux statuts. USER-001 reste Réalisé à sa date historique ;
le mail est déjà exposé par la gestion/invitation, tandis que POST /api/users/ ne l’accepte pas.
La consultation/réactivation d’équipe et le dispositif MESS autonome restent des deltas réels.
D01–D09, ARB-ORG-005 et la réconciliation MEP-012 constituent des décisions distinctes, sans nouvelle
exigence de PR, de contrôle CI serveur préalable ou d’audit Apps.

## Méthode et niveau de preuve

- Inventaire exact depuis pbis.md et mess-e01 à mess-e04, recoupé aux titres et parents des sources.
- Lecture de la vision, gouvernance, concepts/arbitrages, sources fonctionnelles/MESS, ordonnancement,
  synthèse, DoD, cahiers FON/UX et contrats, rapprochés du code suivi et des tests nommés.
- Les archives et rapprochements historiques expliquent les périmètres antérieurs ; ils ne pilotent pas
  les statuts ou l’ordre courant. MEP-001–008, MEP-041 et le jalon MEP-035 restent hors des 96 actifs.
- Les tests cités sont des preuves de spécification/couverture ; les rapports datés sont des preuves
  d’exécution historiques. Aucun test métier, API ou E2E n’est exécuté par cette phase documentaire.
- Les deux captures de refus MEP-013 (avant/refus, clair 390×844) ont été inspectées ; cette lecture
  ne constitue pas une exécution du candidat courant ni une certification esthétique générale.
- Aucune configuration distante actuelle n’est revendiquée : F04 utilise ses décisions/preuves datées.
- Pour réutiliser un résultat, comparer ses entrées effectives et sa sélection au candidat concerné.
  Un ancien rapport ou une capture seule ne prouve pas tous les critères voisins ; la CI exacte et la
  qualification MESS restent distinctes, selon la politique existante sans expiration temporelle.
- Toute absence de décision est écrite comme telle ; pas de noms utilisateur, seuil, règle de reprise,
  compatibilité sémantique ou valeur d’infrastructure inventés.

## Portée de la présente livraison de travail

Les phases initiale et de consolidation sont restées **locales et non canoniques**, sans publication,
selon l’instruction alors applicable. Les [revues datées](revue.md) en conservent les contrôles et limites.
La mission ultérieure de finalisation autorise l’intégration des constats établis et la publication documentaire
via `npm run publish`, sans PR. Les [frontières canoniques](../../source/08-ecarts-et-qualifications.md)
et le [plan courant](../pre-mep.md) reprennent les acquis, deltas et natures, sans recopier les 52 fiches.
Les propositions de politique, de restructuration, de clôture ou de portage restent à valider ; aucune
décision ouverte n’est implicitement prise. Aucun code, contrat API, test ou workflow n’est modifié.
Cet audit ne vaut ni clôture MEP-056, ni acceptation du périmètre MESS, ni GO ; statuts/dates/parents conservés.

## Consolidation du 2026-10-28

La base et les classifications sont confirmées : aucune ligne des 96 n’est reclassée ; les 45 réalisations
canoniques restent distinctes des 47 comportements jugés couverts. Les 20 contradictions initiales sont
conservées et **C21** ajoute le refus visuel des transitions, sans créer de PBI.
Lire d’abord la [revue prête à décision](consolidation-revue.md), puis :

- [Suivi d’anomalie UX séparé](anomalie-transitions.md) : entrée seule techniquement livrée, continuité refusée ;
  reproduction statique et protocole courant distingués, propriétaire/portage et acceptation visuelle à décider.
- [52 actions A–F avec condition de passage](actions.md) ; chaque fiche reprend ces champs.
- [Sortie 045](sortie-mep-045.md), [sortie 047](sortie-mep-047.md), [sortie 048](sortie-mep-048.md) :
  tous critères/refus canoniques tracés, réutilisabilité et quatre issues bornées ; aucun développement identifié.
- [Ordre UX motivé](ordonnancement-ux.md) ; [trajectoire à huit colonnes](trajectoire.md) par étape/PBI.
- [Suppression d’organisation](suppression-organisation.md) et [décisions D01–D09/C11](decisions-mess.md) :
  effets réels, responsabilités et conditions de lancement/GO, sans politique choisie ni seuil inventé.
- [Comparaisons d’entrées supplémentaires](reutilisation-consolidee.md), sans campagne métier exécutée.

Les 52 fiches ont été relues sur les six questions. Les 19 scénarios d’exploitation répétant une
exigence de traçabilité générique sont remplacés par des cas de données/processus propres à leur
capacité ; deux scénarios UX et le cas d’édition utilisateur sont également précisés.
Les chiffres de contrôles initiaux dans revue.md décrivent la première phase ; les contrôles de cette
consolidation sont consignés séparément dans la revue prête à décision.

## Finalisation du 2026-10-29

Les constats établis sont intégrés dans les sources et le pilotage selon l’autorisation ultérieure ;
[revue d’intégration et contrôles](integration-revue.md). La resynchronisation conserve les évolutions
Résultats et le correctif transitions publié dans main `eede631` : [C21 actualisé](anomalie-transitions.md),
acceptation visuelle utilisateur non acquise. Les 96 classifications et 52 fiches restent à la base auditée ;
aucun statut, parent, date ou arbitrage changé, aucun nouveau développement présumé.
