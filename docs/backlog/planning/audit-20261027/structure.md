# Frontières des Epics/Features et restructuration proposée

[À lire après la matrice](matrice.md). Aucun identifiant, parent, statut, date ou périmètre canonique
n’est modifié. Les restructurations et décisions métier ci-dessous restent à valider ; les constats techniques
et documentaires sont repris dans les [frontières canoniques](../../source/08-ecarts-et-qualifications.md), sans parent ou PBI nouveau.
Aucun PBI n’est supprimé par cet audit ; un recouvrement partiel ne prouve pas une redondance totale.

## Capacités et responsabilité de l’acceptation

| Frontière | Acquis à réutiliser | Proposition justifiée par la valeur | Décision / limite |
| --- | --- | --- | --- |
| Identité / rôle / rattachement | USER-001/004, ORG-005/006, matrice FEAT-004 | Nom/prénom partagés par création/lecture/édition : une politique de données et de reprise commune ; USER-002 owns lecture/détail, USER-003 édition du contrat retenu, USER-004 lifecycle. | C01/C02 avant évolution. La source exige un delta distinct pour la création historique ; aucun nouvel ID alloué ici. |
| Lecture Organisation / contexte Results | ORG-001/003 et RESULT-001/002 | Corriger la portée Viewer proposée d’ORG-002 ; projeter le minimum autorisé pour Coach. | Concepts et ARB-ORG-012/015 priment ; pas de serializer administratif ouvert par hypothèse. |
| Dossier équipe / archivage / archives | TEAM-001/004, archivage logique déjà livré | TEAM-003 owns GET actif/archivé ; TEAM-005 seulement transition/refus déjà archivée ; TEAM-006 liste exclusive ; TEAM-007 transition inverse. | C04 scope Coach ; C05 effets des reprises. Aucun doublon de détail dans TEAM-005. |
| Coach courant / affectation datée | COACH-001, ORG-005/006, USER-004 | Garder courant et temporel séparés : une relation many-to-many n’est pas une chronologie. | ARB-ORG-006/007 ; aucune période de responsabilité inventée. |
| Référentiel / passation | EVAL-001/002/003/004 et PASS-001 | Conserver leurs périmètres limités ; ne pas fusionner copies de versions et révision de notes. | Révision garde seulement dernière révision ; historique exhaustif reste un besoin distinct à raffiner. |
| Planification / calendrier / retard | PLAN-001, NOTIF-001/MEP-004 et STEER-001 | Expliciter la frontière mise en file / finalisation avant FEAT-018 ; réutiliser les attentes persistées pour le retard actuel. | C15 : cible à finalisation différente du calendrier livré ; ne pas modifier la règle en documentation comme si décidée. |
| Radar / longitudinal / interprétation | RESULT-001/002, MEP-014/046 | MEP-015 owns présentation du radar ; MEP-047 qualification du contexte/sélections existants ; aucune formule ni compatibilité sémantique nouvelle. | C07/C08 ; observations par lignée ne clôturent pas FEAT-025/026/027 entières. |
| Dashboard / Pilotage / supervision Coach | DASH-001, STEER-001 | MEP-016 owns occurrences lexicales prouvées ; MEP-048 interprétation et accès aux sources existants. | La carte d’un Dashboard personnel n’est pas un indicateur de performance individuelle. |
| Notation / erreurs transverses | PASS-001, MEP-005/007/013/044 | MEP-045 qualifie la confirmation serveur déjà livrée ; MEP-051 exclut ce doublon de correction et référence les preuves locales. | Ne pas remplacer la sauvegarde pour produire un diff ; qualifier puis décider clôture selon DoD. |
| Responsive / navigation / états | Shell, MEP-013/014/053, protections de réponses tardives | Garder cinq responsabilités de F08 : 017 géométrie, 049 navigation, 018 attente/obsolescence, 050 vide, 051 erreur/reprise. Un défaut de composant a un propriétaire et des consommateurs de preuve. | Pas de fusion en « refonte UX » ; pas de nouveau découpage de Feature sans bénéfice démontré. |
| Inventaire / schéma / chargeur | MEP-036/009 et futurs 054/021 | 036 inventorie ; 054 contractualise ; 021 applique partout en réutilisant les validateurs. | Ne pas fusionner sécurité et configuration métier FEAT-031 ; D01–D09 nécessaires à la cible. |
| Packaging / pose / PV | Build et migrations existants | 058/059 préparent composants ; 024 assemble ; 060–062/025 installent/vérifient ; 032/068 prouvent sur cible. | Les unités restent distinctes car artefact, effet système et preuve d’acceptation diffèrent. |
| Services / sauvegarde / reprise | File SMTP, commandes et purge acquises | 063 supervise ; 064 protège ; 026 met à jour ; 027 restaure ; 065 revient au couple précédent ; 072 exerce. | Ne pas fusionner les trois opérations de reprise : leurs refus et conséquences diffèrent. |
| Guides / recette / statut | MEP-030/067 réalisés, licence MEP-006 acquise | F17 prépare, F18–F20 exécutent ; guides d’installation/exploitation et fork ont des destinataires distincts. | Un cahier ou un E2E local n’est pas un PV MESS ; aucune fonction développée dans les PBI de recette. |
| Gouvernance / suivi | MEP-043 et DoD documentaire | Réconcilier MEP-012, sans nouveau circuit ; conserver MEP-056 comme point de contrôle contractuel ou soumettre son absorption dans la DoD. | C06/C12 ; seule absorption proposée à arbitrer, aucun retrait actuel. |

## Les 19 Features sans PBI propre ne sont pas toutes absentes

Le calcul canonique « Raffinée = au moins un PBI détaillé » est structurel, pas une mesure de couverture.
Ces Features gardent leur identité ; les références ci-dessous ne créent aucun rattachement supplémentaire.

| Feature non raffinée | Capacité présente / delta réel | Prérequis ou décision avant un nouveau PBI | Conclusion de frontière / raffinement sans ID proposé |
| --- | --- | --- | --- |
| FEAT-003 — Qualifier et superviser un coach | Fonction Coach, activation et éligibilité courante présentes ; profil/supervision et continuité datée plus larges. | Ne pas redévelopper USER-004/ORG-006 ; ARB-ORG-006 pour dates/effets. | Acquis dans USER-004/ORG-006 ; profil/supervision partiels et besoin restant à décider. Proposer d’abord la définition du profil distinct de la fonction, sans nouveau PBI. |
| FEAT-004 — Appliquer les rôles et permissions métier | Permissions/scopes largement codés et testés par MEP-011/037/038 ; matrice User contradictoire avec USER-003. | C02/C03/C04 ; raffiner le delta de contrat seulement. | Acquis dans les PBI de permissions et de domaines ; contrat encore contradictoire. Proposer une matrice rôle/action/cible/champ consolidée après C02/C03/C04, pas une réécriture des permissions. |
| FEAT-009 — Retracer les affectations de coachs | Team.coaches courant sans périodes ; snapshots de passation ne sont pas la chronologie d’affectation. | ARB-ORG-006/007, dates/autorités et correction historique à décider. | Capacité temporelle réellement manquante ; besoin insuffisamment décidé. Proposer périodes/fin/correction d’affectation après ARB-ORG-006/007, sans refaire COACH-001. |
| FEAT-015 — Associer des modèles à une équipe | PLAN-001 associe un modèle/version local à une équipe ; pas de période d’applicabilité générale. | Règles de périodes, versions futures, partage ARB-ORG-010 et transfert si concernés. | Feature partiellement satisfaite par PLAN-001 ; périodes et politique des versions futures manquent. Proposer association datée après décisions, sans second planning courant. |
| FEAT-016 — Retracer les associations équipe–modèle | FK/version exacte et runs historiques conservés ; pas de chronologie complète des associations. | FEAT-015, politique de clôture/correction datée. | Acquis de références exactes dans PASS-001/EVAL-003 ; chronologie d’association manquante. Proposer consultation des périodes/auteurs et clôture datée après FEAT-015. |
| FEAT-018 — Calculer la prochaine échéance | Calendrier mensuel/trimestriel et prochaine date présents ; finalisation ne pilote pas le calcul. | C15 et calendrier métier ; ne pas compter une notification comme finalisation. | Feature partiellement satisfaite par PLAN-001/NOTIF-001 ; règle à finalisation non décidée/livrée. Proposer contrat du cycle et de son fait déclencheur après C15. |
| FEAT-019 — Identifier les évaluations en retard | STEER-001 qualifie des attentes persistées strictement échues ; pas de reconstitution générale des cycles ni historique de résolution. | FEAT-018 et politique des cycles manquants/résolus, sans l’inventer pour la MEP. | Partiel dans STEER-001 ; historique du retard et cycles non persistés manquants. Proposer qualification du cycle résolu après FEAT-018, sans recalcul inventé. |
| FEAT-020 — Démarrer l’évaluation attendue | PASS-001 démarre et snapshotte une attente, vérifie modèle/équipe/assigné ; associations temporelles plus larges absentes. | Réutiliser le démarrage ; ne raffiner que le contexte nouveau décidé. | Démarrage largement livré par PASS-001 dans une autre Feature ; contexte temporel élargi manquant si retenu. Aucun nouveau démarrage générique proposé. |
| FEAT-021 — Renseigner et reprendre un brouillon | PASS-001 sauvegarde/reprend des entiers 0–10 ; autres modalités ne sont pas livrées. | Ne pas recréer le brouillon ; FEAT-012 pour éventuelles modalités nouvelles. | Brouillon 0–10 livré par PASS-001 ; modalités nouvelles indécises. Ne proposer un delta de réponse qu’après décision FEAT-012, sans refaire reprise/sauvegarde. |
| FEAT-022 — Valider la complétude et les résultats | Contrôle complet 0–10 et refus de finalisation livrés ; résultats globaux/calculs plus larges non spécifiés. | Décision de modalités/calculs avant extension ; aucun score global ajouté à la MEP. | Complétude 0–10 livrée par PASS-001 ; calcul global non défini. Proposer uniquement validation des nouvelles modalités/calculs décidés, aucun score global automatique. |
| FEAT-024 — Parcourir l’historique des évaluations | Tableau de runs pour acteurs de passation et observations de critère Results ; pas de dossier historique général par équipe pour tous les rôles. | Distinguer liste/détail général de RESULT-002 ; périmètre Viewer canonique. | Partiel via tableau de runs PASS-001 et observations RESULT-002 ; historique général manquant. Proposer liste/détail de complétions par équipe et rôles, distinct du critère longitudinal. |
| FEAT-026 — Mesurer l’évolution par critère et globale | Scores datés présents ; aucun écart/tendance calculé. | FEAT-025 compatible et unité/période/formule décidées. | Observations RESULT-002 disponibles, évolution calculée réellement absente et formule non décidée. Proposer unité/période/ruptures avant une différence calculée. |
| FEAT-027 — Visualiser les tendances | Courbes d’observations et tableau présents ; ne démontrent pas un calcul de tendance. | Ne pas reconstruire le graphique ; raffiner le reste après FEAT-026. | Courbe/tableau d’observations RESULT-002 déjà livrés ; tendance calculée absente. Proposer seulement restitution de l’évolution décidée en FEAT-026, sans reconstruire la courbe actuelle. |
| FEAT-028 — Préparer les rappels d’évaluations à venir | Intentions de confirmation/échéance et déduplication présentes ; pas de fenêtre d’anticipation paramétrable. | Fenêtre/paramètres FEAT-031 et responsabilités courantes. | Confirmations et échéances NOTIF-001 présentes ; fenêtre anticipée absente/indécise. Proposer fenêtre/déduplication et destinataire applicables après FEAT-031. |
| FEAT-029 — Alerter sur les évaluations en retard | Courriel d’échéance livré ; pas de politique de relance/escalade de retard. | Fréquence, destinataires, arrêt/déduplication à décider ; pas de nouvelle alerte présumée MEP. | Échéance NOTIF-001 présente, alerte de retard/escalade absente et politique indécise. Proposer fréquence/arrêt/destinataires après FEAT-019/031, sans confondre échéance et relance. |
| FEAT-031 — Gérer les paramètres métier du dispositif | Settings d’installation distincts ; pas d’administration métier avec dates d’effet. | ARB-ORG-013 ; ne pas utiliser MEP-054 comme réalisation de cette Feature. | Capacité métier réellement manquante, paramètres/partage indécis. Proposer valeurs autorisées et date d’effet après ARB-ORG-013 ; MEP-054 reste installation. |
| FEAT-032 — Superviser la charge et la situation des coachs | Dashboard personnel et Coachs courants dans Pilotage ; pas de supervision complète par Coach. | Politique des affectations/date/charge ; pas de KPI individuel contraire à la vision. | Coachs courants et activité personnelle livrés, supervision par Coach partielle. Proposer faits d’affectation/échéance par Coach, sans score de performance, après décisions temporelles. |
| FEAT-033 — Superviser le portefeuille d’équipes | STEER-001 couvre actifs, Coachs et complétions ; pas de tous les filtres/modèles/archives prévus. | TEAM-003/006 et associations élargies si retenues ; réutiliser la projection P0. | Partiel via STEER-001, filtres et archives plus larges absents. Proposer seuls segments et accès source manquants après TEAM-003/006 et associations retenues. |
| FEAT-034 — Superviser les échéances | Retards connus et prochaine échéance par équipe présents ; pas de vue filtrable générale des cycles/statuts résolus. | FEAT-018/019 et définition des cycles ; pas d’agrégat nouveau dans MEP-048. | Partiel via STEER-001 pour prochaine échéance/retards connus ; vue des cycles/résolus absente. Proposer filtre et preuve de résolution après contrat FEAT-018/019. |

Features raffinées mais plus larges : FEAT-008/037/038 ont seulement le courant ; FEAT-011 n’a pas le
réordonnancement utilisateur ; FEAT-012 n’a que notation entière/repères ; FEAT-013 n’a pas tout le
traitement d’impact du retrait ; FEAT-014 n’ouvre pas de consultation autonome Viewer ;
FEAT-025/030/035 gardent leurs limites explicites. Les PBI réalisés ne les clôturent pas implicitement.

## Dépendances et faux cycles

- Le graphe des références PBI des champs de dépendances actifs ne contient pas de cycle détecté.
  Les huit acquis MEP-001–008 restent des feuilles historiques ; aucun ID inconnu relevé dans ce graphe.
- TEAM-004 dépend textuellement de TEAM-003, pourtant son vertical est réalisé : le GET dédié
  n’était pas une dépendance technique de ce renommage. Proposer de qualifier cette relation comme
  contexte de parcours, sans la supprimer silencieusement de la source.
- Les champs de Feature F10/F11, F14/F15 et F17/F19 semblent circulaires si l’on exige toute une
  Feature avant une autre. Les sources imposent seulement les prérequis du PBI consommateur :
  contrat→chargement, services/sauvegarde→upgrade/restauration→rollback, cahier→exécution.
- MEP-012→043 est une relation audit/correction ; exiger la clôture conforme de l’audit avant correction
  était un verrou logique. La correction est livrée selon décision révisée ; reste C06 documentaire.
- MEP-024 peut être assemblé progressivement puis régénéré avec les services/outils avant le candidat
  final ; ajouter MEP-063 comme prérequis du premier assemblage créerait un cycle inutile.

## Fusions, séparations et suppressions soumises à validation

1. **Aucune fusion d’IDs active nécessaire démontrée.** Mutualiser les preuves et retirer les reprises
   de développement couvertes, sans retirer les PBI de qualification ni leurs critères.
2. **Séparation du delta identité** demandée par la source USER-001 : définir son portage après C01 ;
   préserver USER-001 réalisé et relier les consommateurs USER-002/003. Aucun nouveau numéro inventé.
3. **MEP-056 : absorption facultative**, seulement si le produit préfère intégrer le contrôle contractuel
   dans la DoD MEP-021/022. Sinon conserver la fiche resserrée comme revue de cohérence.
4. **MEP-041 : aucune action**, archive de doublon déjà consolidée ; ne pas le ressusciter ni le compter.
5. Tout retrait approuvé gardera l’ID, son parent historique, le motif/date/décideur et la destination de
   chaque critère. Jamais de réutilisation de numéro, de baisse implicite de périmètre MEP ou de statut inventé.

## Consolidation : anomalie UX et natures de travail

La [correction des transitions refusées](anomalie-transitions.md) est suivie hors des 96, avec portage
produit/UX à décider. La livraison technique et les tests de mouvement ne valent pas acceptation esthétique.
Aucune absorption dans F08 ni réouverture d’un PBI réalisé ; C21 documente cette frontière.
Les [52 prochaines actions A–F](actions.md) distinguent capacité nouvelle, correction, qualification,
arbitrage, livrable et recette cible ; les colonnes ajoutées aux 19 Features ci-dessus n’attribuent aucun ID.
Le [graphe de suppression](suppression-organisation.md) précise CASCADE, PROTECT et SET_NULL,
sans choisir le traitement d’ARB-ORG-005. [D01–D09 et C11](decisions-mess.md) restent non décidés.
