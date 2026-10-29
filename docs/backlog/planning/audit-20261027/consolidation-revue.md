# Consolidation contradictoire — revue prête à décision produit

Base auditée et conservée : `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6`.
Mission documentaire du 2026-10-28, dans le worktree d’audit existant.
[Matrice](matrice.md) · [Structure](structure.md) · [52 fiches](raffinement.md) ·
[Contradictions](contradictions.md) · [Trajectoire](trajectoire.md) · [Contrôles](consolidation-controles.md).

## 1. Conclusions confirmées

96 PBI actifs : 34 fonctionnels et 62 MESS ; 47 déjà couverts, 20 partiellement couverts, 22 non couverts,
2 insuffisamment définis et 5 bloqués. Aucun doublon actif intégral démontré.
45 réalisés canoniques, 48 ouverts et 3 bloqués restent distincts de ces catégories analytiques.
**Aucune classification, réalisation, date, décision approuvée ou parent canonique n’est changé.**
Les 19 Features sans PBI propre demeurent non raffinées ; les acquis voisins ne livrent pas leur capacité entière.

## 2. Conclusions corrigées et justification

| Point initial | Correction consolidée | Fondement concret |
| --- | --- | --- |
| Transitions citées comme acquis technique sans leur refus visuel | [Anomalie UX hors des 96](anomalie-transitions.md), nature B+D+A, portage à décider ; pas de refonte générale | Signalement utilisateur + code entrée seule, ancien contenu démonté, fermeture immédiate ; tests de mouvement non probants pour esthétique. |
| Qualification ouverte sans fin possible | [045](sortie-mep-045.md), [047](sortie-mep-047.md), [048](sortie-mep-048.md) : critères/refus, manque exact, recette et quatre issues | Code/tests existants ; comparaison des entrées courantes aux références historiques, pas de nouvelle capacité manquante démontrée. |
| 047 avant 015 non expliqué ; 016/048 et F08 présentés en rang | [Ordre justifié et conditionnel](ordonnancement-ux.md), sans nouvel arc | Nature A et jeu de preuve commun ; différence entre lecture des sélections, rendu, termes et faits ; risque démontré prime le rang. |
| 19 scénarios d’exploitation génériques | Scénarios spécifiques à chaque processus/artefact et vraie action suivante | Un rattachement de SHA/commande ne teste pas la configuration, relance, migration, backup ou restauration. |
| Suppression d’organisation traitée trop sommairement | [Graphe des données](suppression-organisation.md), états et protections différenciés | CASCADE, suppression NOT_STARTED, PROTECT IN_PROGRESS/COMPLETED, SET_NULL journaux/notifications et scope Admin après suppression. |
| D01–D09 et C11 agrégés | [Environnement / objectifs / responsables / essais séparés](decisions-mess.md) | Profil cible non approuvé, mesures locales distinctes d’objectifs et PV MESS. |

Le refus esthétique est une nouvelle information d’acceptation, pas un motif pour inventer un PBI ou
reclasser arbitrairement les 96. La lecture du code démontre l’absence de sortie/raccord orchestré ;
une nouvelle capture navigateur reste à produire, explicitement Non exécutée dans cette consolidation.

## 3. Fiches modifiées et contrôle des six questions

Les **52 fiches A–G** sont relues ; chacune reçoit nature A–F, action concrète, condition de passage et
consommateur. Le problème, le delta, le résultat, les acquis/exclusions, les scénarios/refus et les blocages
restent identifiables dans A–G. « Prêt » est corrigé par la porte de sélection : aucune décision manquante
n’est transformée en hypothèse. Les critères conditionnels restent à finaliser après décision, donc non prêts.

| Groupe | Fiches modifiées | Correction approfondie |
| --- | --- | --- |
| Produit — 10 | USER-001/002/003, ORG-002/004, TEAM-002/003/005/006/007 | Données/lectures/rattachements conservés ; cas USER-003 précisé ; actions et dépendances. ORG-004 renvoie au graphe décisionnel. |
| UX — 10 | MEP-015/016/017/018/045/047/048/049/050/051 | Portes A ; sorties dédiées 045/047/048 ; obsolescence 018 et réessai Planification 051 rendus spécifiques ; transitions séparées. |
| F04 — 1 | MEP-012 | D+F seulement, traitement documentaire selon décision 043 ; aucune action sur Git/CI. |
| Contrats/exploitation — 19 | MEP-021/022/023/024/025/026/027/054/055/056/057/058/059/060/061/062/063/064/065 | Remplacement des 19 scénarios répétant la traçabilité par cas propres ; action, entrée et sortie par PBI. |
| Guides/cahier — 4 | MEP-028/029/031/066 | Nature F ou D+F, commandes/seuils réels avant clôture ; aucune recette cible anticipée. |
| Recettes cible — 8 | MEP-032/033/034/068/069/070/071/072 | Nature E avec D si décision indispensable ; prérequis, données/clones et vrais refus conservés ; aucun développement métier dans un PV. |

Les 44 autres réalisés ne sont pas réécrits en fiches de développement. USER-001 conserve sa réalisation
historique ; son delta distinct n’obtient ni nouvel identifiant ni réouverture dans cet audit.
La [table des 19 Features](structure.md) distingue acquis dans un autre PBI, partiel, manque et besoin
indécis, puis propose un raffinement sans ID : dates d’affectation, calendrier et histoire ne se confondent pas.

## 4. Contradictions éclaircies par rapprochement documentaire

- Mail : distinguer POST technique sans mail et invitation/gestion avec mail ; donnée présente dans
  un parcours ne satisfait pas automatiquement le contrat d’un autre. C01 reste une décision de collecte/reprise.
- Suppression : des historiques sont protégés, d’autres objets sans run protecteur peuvent cascader ;
  journaux conservés physiquement mais liens/visibilité modifiés. Ni « tout disparaît » ni « tout est protégé ».
- Historique/courant : EVAL-001/PLAN-001 limités et réalisations ultérieures coexistent ; 45 statuts et
  47 couvertures ne constituent pas une divergence à corriger dans le registre.
- Ordre UX : rang historique et dépendance technique séparés ; 047→015 est une recommandation
  de preuve et peut être dépassée par un défaut de lisibilité démontré.
- Mouvement : preuve technique conservée, acceptation esthétique refusée ; C21 rend le refus visible.
- MEP-012/043 : décision du 21 octobre conservée ; seule réconciliation de suivi à soumettre, sans
  clôture rétroactive supposée. **C06 n’est pas résolu en décision de statut par cette consolidation.**

## 5. Arbitrages humains toujours nécessaires

| Décision | Résultat attendu / autorité proposée | Conséquence sans décision |
| --- | --- | --- |
| ARB-ORG-005 | Produit/MESS : politique par dépendance/état ou limitation effective approuvée et vérifiable | ORG-004 Bloqué ; administration/GO ne peuvent être conclus avec destruction non arbitrée exposée. |
| D01–D09 | Exploitation/sécurité/réseau/PKI/messagerie MESS selon matrice | Aucun profil final, wheelhouse compatible, installation ou service MESS supposé acquis. |
| C11 / MEP-022 | Produit/propriétaire des données + exploitation : charge, disponibilité, RPO/RTO, responsabilités et protocoles | Cahier technique, essais de charge et reprise non concluables ; aucune valeur de substitution. |
| C01/C02 | Produit : identité, reprise, rôle/champ/cible autorisés et portage distinct de création | USER-002/003 et delta de USER-001 non prêts pour contrat complet. |
| C03/C04/C05 | Produit : projection/scope Coach et effets de reprise équipe ; Viewer selon concepts déjà décidés | Consultations/réactivation complètes non prêtes ; slice TEAM-003 exige découpage approuvé. |
| C06 | Responsable dépôt/produit : critères applicables, verdict/date et suivi de MEP-012 au regard de 043 | F04 reste contradictoire au suivi ; ni nouveau chantier Git ni G05 rendu bloquant. |
| C12 | Produit : conserver contrôle MEP-056 ou l’absorber explicitement dans DoD | Aucun retrait d’ID ; point contractuel conservé. |
| C21 | Produit/UX avec utilisateur : attendu visuel, portage/propriétaire et inclusion au candidat | Anomalie connue non acceptée, correction à préparer ; aucun PBI attribué ni gate de MEP inventé. |

C08 (sémantique de lignée), C09 (nouveau sens de terme) et C13 (transfert réel de dépôt) ne sont
bloquants que si cette extension est effectivement demandée ; ils n’empêchent pas les contrôles du
périmètre limité déjà livré. ARB-ORG-006/007/010/013 continuent à gouverner les capacités futures concernées.

## 6. PBI réellement prêts pour développement

**Aucun PBI non réalisé complet sans réserve à la base auditée.**
TEAM-003 pourrait fournir un GET minimal Admin/Superadmin après validation de découpage ; le PBI
complet attend la portée Coach C04. TEAM-005 a un delta de correction explicite (second archivage 404
au lieu du refus métier attendu et relecture archivée), mais dépend de TEAM-003.
Les autres capacités C de la table attendent décision ou sortie technique listée ; les preuves ne sont
pas un développement de substitution. L’anomalie transitions est connue mais son portage et l’attendu
visuel précis doivent être arrêtés avant de qualifier un chantier prêt.

## 7. Prêts uniquement pour qualification, investigation ou préparation

**Aucun développement identifié : MEP-045, MEP-047 et MEP-048.**
Ils sont immédiatement traitables comme qualifications bornées, avec propositions de clôture seulement
si tous critères/refus et DoD sont prouvés. Ce n’est pas une clôture validée.
MEP-015/017/018/049/050/051 peuvent faire leurs observations ciblées A ; une correction n’est préparée
que sur défaut identifié. MEP-016 peut inventorier les termes ; aucun patch lexical présumé.
Les matrices de décisions, schéma/inventaire et trames de guides/cahier peuvent avancer en parallèle,
sans satisfaire des prérequis ou clore un livrable absent.

## 8. Principaux obstacles à la MEP

- Politique/protection des suppressions dépendantes et intégrité/conservation réellement démontrées.
- Profil D01–D09, objectifs/responsables C11 ; distribution autonome et services/reprise encore à livrer.
- PV d’installation, hors Internet, administration/notation/résultats, sécurité/charge/reprise non exécutés.
- Écart de suivi F04 et acceptation des corrections UX requises, dont traitement explicite du refus
  transitions selon décision de périmètre ; aucun GO déduit de tests de mouvement ou du score du backlog.
- Qualification exhaustive et CI du SHA destiné à MESS restent exigées au moment du candidat.

## 9. Prochaine action et résultat attendu

**Ouvrir le dossier de qualification MEP-045** sur le SHA retenu : relever les huit lignes critère/refus,
associer les résultats exacts déjà réutilisables, produire uniquement les observations manquantes,
puis conclure sur l’une des quatre issues écrites. Résultat : verdict borné et dossier de clôture proposé
ou correction minimale précisément motivée, **sans développement artificiel ni statut modifié ici**.
En parallèle : présenter C21 au produit/UX et ARB-ORG-005/D01–D09/C11 aux responsables habilités.
Cette phase du 28 octobre s’est arrêtée à la revue, sans implémentation, PR, publication ou intégration canonique.
La mission ultérieure du 29 octobre autorise la [finalisation documentaire et publication](integration-revue.md)
des constats établis ; arbitrages, statuts et recommandations de clôture restent distincts de leur validation.
