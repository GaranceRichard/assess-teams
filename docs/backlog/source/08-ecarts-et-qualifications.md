# Périmètres livrés, écarts et qualifications

Complément des sources d’Epics, actualisé au 2026-11-14. Les [96 diagnostics historiques](../planning/audit-20261027/matrice.md)
restent analytiques ; les [registres](../tracking/pbis.md) portent statuts et dates. Le [plan courant](../planning/pre-mep.md)
et les [38 aptitudes](../planning/mess-dependances.md) remplacent leurs conseils de lancement obsolètes.
Aucun identifiant/parent nouveau ; 58 réalisés, 36 ouverts, 2 bloqués ; aucune clôture de ce mandat.

## Produit : acquis et deltas bornés

| PBI / capacité | Acquis conservé | Delta ou décision réellement nécessaire |
| --- | --- | --- |
| USER-001 — Création | Réalisation historique du contrat livré | Collecte/reprise nom/prénom/mail et lien mail/login C01 ; aucune réouverture de USER-001 |
| USER-002 — Consultation | Liste et scopes livrés | Détail/identité complète après C01/C02 ; choix produit explicites, pas nouvel audit |
| USER-003 — Modification | Édition et autorisations FEAT-004 livrées | C02 réconcilie les critères de delta proposés avec la matrice ; aucune capacité supprimée par inférence |
| ORG-002 — Consultation | Admin/Superadmin livrés, Viewer via Results | Projection minimale Coach C03 à décider ; aucun serializer administratif ouvert implicitement |
| ORG-004 — Suppression | Dossier ARB-ORG-005 publié, chantier parallèle protégé | Politique des données dépendantes toujours à décider ; aucune recommandation considérée approuvée |
| TEAM-002/003 — Liste et détail | C04 décidé ; clôtures distinctes approuvées le 2026-11-13 | Aucun travail supplémentaire déduit de ce mandat |
| TEAM-005 — Archivage | Clôture approuvée le 2026-11-13, refus du second archivage et historique prouvés | Aucun changement, acquis utilisable par TEAM-006 |
| TEAM-006 — Archives | Scope C04 décidé, TEAM-005 réalisé, filtre Logs acquis | **Prêt** : liste séparée des seules archives, vide, détail et vrais refus ; aucune préparation supplémentaire requise |
| TEAM-007 — Réactivation | Identité/historique et archivage acquis | C05 décide les effets sur affectations/plans/échéances ; aucune relance automatique implicite |

Les critères de delta USER-003 contradictoires avec FEAT-004 sont marqués **proposés, non approuvés**
dans leur source. Les décisions préciseront champs/cibles/droits avant réalisation ; les capacités livrées
restent conservées. Les Features sans PBI ne deviennent pas réalisées par proximité avec ces acquis.

<a id="ux--qualifier-lexistant-avant-toute-correction"></a>

## UX réalisée et preuve cible distincte

EPIC-012 compte **17/17 PBI raffinés réalisés** : notation F05, résultats F06, dashboard/pilotage F07,
responsive/états F08 et thèmes F09. Le [registre E02](../tracking/mess-e02.md) conserve critères, preuves,
clôtures et dates ; aucun ancien titre « améliorer » ne justifie de les relancer.
MEP-015 est réalisé le 2026-11-02 ; MEP-047 et MEP-048 ont leurs clôtures approuvées.
La dérogation D01 de MEP-018 est conservée et ne concerne pas les axes D01–D09 du profil d’installation.
Les mesures et tests locaux ne remplacent pas les recettes MEP-069/070 ni les essais complémentaires du site.

C21 reste un suivi visuel distinct, sans PBI nouveau : correctif technique publié dans main `eede631`,
acceptation utilisateur et inclusion au candidat à décider. CI et mesures ne valent pas acceptation esthétique.

## MESS : résultats à livrer

| PBI / groupe | Sortie opérationnelle et limite |
| --- | --- |
| MEP-012 / MEP-043 | Dossier C06 publié : verdict/date 012 à approuver ; 043 réalisé, push direct et CI après intégration acquis, G05 accepté non bloquant ; aucune nouvelle barrière |
| MEP-055 | Ouvert/N/A sur approbation explicite du 2026-11-14, sans clôture ; vérifier contrat/refus du profil, pas obtenir neuf signatures |
| MEP-054 / MEP-022 | **Prêts** : schéma de configuration et opérations/protocoles du projet, indépendants ; aucun SLA MESS présumé |
| MEP-021 | Après 054 : même source/configuration/base pour API/workers/scripts, refus avant effet |
| MEP-057/058/059/024 | 057 **prêt** : versions/ABI/empreintes/droits ; puis build normal et wheels locaux, assemblage reproductible et manifeste |
| MEP-060/061/062/025 | Préflight, pose hors ligne, migrations/bootstrap et diagnostic ; bootstrap développeur ne prouve aucune installation cible |
| MEP-063/064/026/027/065 | Services, sauvegarde cohérente, upgrade, restauration et rollback ; 064 après 021/022 sans attente 025 ; aucun RPO/RTO réel inventé |
| MEP-023/028/066/029/031 | Documents des commandes réelles, reconstruction du package et cahier mesurable ; guides sans attente technique d’une réécriture README |
| MEP-056 | Contrôle sources/registre/synthèse après 021/022 dans les documents existants ; C12 facultatif, aucun rapport ni PBI supplémentaire |
| MEP-032/068 | PV d’installation vierge puis autonomie hors Internet sur profil/hôte/candidat identifiés ; site MESS absent jamais qualifié |
| MEP-033/069/070 | Recettes métier/UX par rôle et vrais refus ; 033 vérifie la politique destructive effectivement décidée et appliquée |
| MEP-034/071/072 | Sécurité/isolation, charge SQLite et reprise sur clones ; intégrité obligatoire, mesures et limites sans promesse de capacité MESS |

Le [profil technique de référence](../../operations/installation-prerequisites.md) est une convention de
réalisation. Les analyses D01–D09 sont utiles, leurs approbations externes ne sont pas des prérequis.
L’absence d’un environnement réel empêche sa qualification, pas le développement de l’outillage.
Versions exactes, ABI et droits sont figés par 057 ; protocole de mesure par 022 ; les PV restent distincts.

## Décisions ouvertes et frontières à préserver

| Question | Autorité et consommateurs réels |
| --- | --- |
| ARB-ORG-005 | Responsable produit : traitement par donnée/état ou limitation effective ; ORG-004, 033 et GO si risque destructif exposé ; dossier et chantier existants préservés |
| C01/C02 | Produit : collecte/reprise identité, lien mail/login, champs/cibles/droits ; USER-002/003 complets non prêts |
| C03/C05 | Produit : projection Organisation Coach et effets de réactivation ; ORG-002 et TEAM-007 concernés ; C04 déjà décidé |
| C06 | Produit/dépôt : verdict/date de MEP-012 à approuver sur le dossier publié ; aucun nouvel audit Git/Apps ou circuit PR |
| C11 | Le projet définit les opérations et mesures de référence ; seuls engagements éventuels et titulaires du site réel restent à décider avant promesse/exploitation réelle |
| C12 | Absorption éventuelle de 056 non approuvée ; conserver le contrôle existant ne bloque aucun développement |
| C21 | Produit/UX avec utilisateur : acceptation visuelle et inclusion du correctif déjà publié ; aucun rattachement PBI inventé |

Les **19 Features sans PBI propre restent non raffinées**. Affectations courantes ≠ historiques datés ;
planning courant ≠ calendrier général ; snapshots/longitudinal par lignée ≠ tendance ou évolution calculée.
Partage, agrégation et politiques de destruction ne sont pas décidés par le présent mandat.
Aucune extension implicite de la première MEP ni suppression d’exigence de sécurité/intégrité/hors ligne.
