# Périmètres livrés, écarts et qualifications

Complément opérationnel des sources d’Epics, issu de la [consolidation contradictoire](../planning/audit-20261027/consolidation-revue.md).
Il précise les acquis et les prochaines actions ; il ne révise pas les critères historiques ni les décisions
encore ouvertes. Les concepts transverses et arbitrages conservent leur autorité selon la [gouvernance](../governance.md).
Les [96 diagnostics](../planning/audit-20261027/matrice.md) restent analytiques ; seuls les
[registres](../tracking/pbis.md) portent les statuts et dates. Aucun identifiant ou parent ne change.

## Choisir la nature du prochain travail

| Nature analytique | Résultat à produire avant passage |
| --- | --- |
| A — Qualification | Critères/refus confrontés à l’existant et preuves attribuées aux entrées exactes ; manque de preuve nommé. |
| B — Correction | Défaut reproductible, comportement attendu et correction minimale délimitée avant implémentation. |
| C — Développement | Capacité absente spécifiée ; décisions, données et prérequis effectivement disponibles. |
| D — Arbitrage | Décision attribuée par l’autorité compétente ; aucune hypothèse par défaut. |
| E — Recette cible | PV sur candidat, configuration et environnement MESS identifiés ; tests locaux insuffisants. |
| F — Documentation ou livrable d’exploitation | Contrat, guide, manifeste, package ou procédure vérifiable effectivement produit. |

Ces natures peuvent coexister ; elles ne sont pas des statuts. Consulter l’[action et la condition de passage
de chacun des 52 dossiers](../planning/audit-20261027/actions.md), puis ses scénarios/refus et preuves.
Un rang, un intitulé « améliorer » ou des prérequis réalisés ne prouvent pas un défaut à développer.
La DoD et les contrôles proportionnés restent exigés ; une preuve versionnée ne périme pas par son âge,
mais sa réutilisation exige des entrées et une sélection identiques selon la politique qualité.

## Produit : acquis et deltas bornés

| PBI / capacité | Acquis à conserver | Delta et passage nécessaire |
| --- | --- | --- |
| [USER-001 — Création](../planning/audit-20261027/fiches/USER-001.md) | Réalisation historique ; POST technique identifiant/mot de passe/fonction, invitation avec mail dans un autre parcours | Noms/prénoms non exposés par la gestion ; C01 décide collecte/reprise et portage distinct, sans réouverture ni nouvel ID ici. |
| [USER-002 — Consultation](../planning/audit-20261027/fiches/USER-002.md) | Liste, pagination, hiérarchie et scopes | Détail et données d’identité manquants ; C01/C02 avant contrat complet. |
| [USER-003 — Modification](../planning/audit-20261027/fiches/USER-003.md) | Édition identifiant/mail/fonction/activité et protections existantes | C02 doit réconcilier champs/cibles/droits divergents ; ne pas supprimer une capacité testée par inférence. |
| [ORG-002 — Consultation](../planning/audit-20261027/fiches/ORG-002.md) | Liste/détail Admin et Superadmin | C03 décide une projection Coach ; Viewer reste limité aux résultats COMPLETED selon les concepts, sans écran d’administration. |
| [ORG-004 — Suppression](../planning/audit-20261027/fiches/ORG-004.md) | Suppression vide réservée au Superadmin, comptes conservés | ARB-ORG-005 doit décider/protéger les dépendances avant correction ; ni cascade générale admise ni conservation totale démontrée. |
| [TEAM-002 — Liste](../planning/audit-20261027/fiches/TEAM-002.md) | Liste active Admin/Superadmin ; Viewer exclu | C04 précise le scope Coach avant extension ; contexte Dashboard/Results ne livre pas cette consultation. |
| [TEAM-003 — Détail](../planning/audit-20261027/fiches/TEAM-003.md) | Identité stable, contrôle organisationnel et mutations existantes | GET actif/archivé absent ; slice Admin/Superadmin seulement après découpage approuvé, portée complète après C04. |
| [TEAM-005 — Archivage](../planning/audit-20261027/fiches/TEAM-005.md) | Premier archivage et activité ; aucun effacement d’historique | Second archivage renvoie 404 au lieu du refus métier ; relecture archivée portée par TEAM-003. Pas de nouvel archivage à construire. |
| [TEAM-006 — Archives](../planning/audit-20261027/fiches/TEAM-006.md) | Liste incluant les archives pour Logs | Consultation dédiée des archives absente, à spécifier après TEAM-003/005 et scope Coach C04 ; ne pas refaire le filtre Logs. |
| [TEAM-007 — Réactivation](../planning/audit-20261027/fiches/TEAM-007.md) | Identité et historique de l’équipe archivée | Réactivation absente ; C05 décide effets sur affectations et planning, sans reprise automatique supposée. |

TEAM-004 demeure livré malgré la dépendance documentaire à TEAM-003 : son renommage ne consomme
pas un GET de détail. Le champ historique est conservé, sans fabriquer une attente technique de reprise.
Les champs des sources en conflit restent visibles jusqu’aux décisions C01–C05, sans élargir les droits.

## UX : qualifier l’existant avant toute correction

| PBI | Prochaine action et limite | Sortie attendue |
| --- | --- | --- |
| [MEP-045 — Confirmation de sauvegarde](../planning/audit-20261027/sortie-mep-045.md) | A : confronter les huit lignes critère/refus à sauvegarde en cours/succès serveur/échec/reprise déjà présents | Verdict de conformité et décision de clôture proposée ; pas de développement identifié. Préserver notes explicites, révision et navigation protégée. |
| [MEP-047 — Comparaisons](../planning/audit-20261027/sortie-mep-047.md) | A : vérifier sélection conservée entre vues, version exacte/archives, lignée et scope sur données discriminantes | Verdict borné ; pas de nouvelle comparaison ni équivalence sémantique inventée. Réinitialisations volontaires de contexte conservées. |
| [MEP-048 — Indicateurs](../planning/audit-20261027/sortie-mep-048.md) | A : vérifier couverture/complétions/retards contre faits, date de référence et lien Results | Verdict borné ; conserver calculs, provenance, droits et absence de classement/score global. |
| [MEP-015 — Radar](../planning/audit-20261027/fiches/MEP-015.md) | A : observer labels longs, légende, séries et tableau aux formats du cahier | Défaut localisé ou conformité documentée avant toute retouche de graphique. |
| [MEP-016 — Vocabulaire](../planning/audit-20261027/fiches/MEP-016.md) | A puis D si nouveau sens : inventorier occurrences Dashboard/Pilotage par rôle et les confronter aux concepts | Occurrence et ambiguïté nommées ; aucune substitution lexicale présumée. |
| [MEP-017 — Petits écrans](../planning/audit-20261027/fiches/MEP-017.md) / [MEP-049 — Navigation tactile](../planning/audit-20261027/fiches/MEP-049.md) | A : tableaux/modales/scroll/actions puis navigation/repli/focus/cibles, sans refonte du shell | Matrice de formats et refus observés ; corrections uniquement sur défaut reproduit. |
| [MEP-018 — Attente](../planning/audit-20261027/fiches/MEP-018.md) / [MEP-050 — Vides](../planning/audit-20261027/fiches/MEP-050.md) / [MEP-051 — Erreurs](../planning/audit-20261027/fiches/MEP-051.md) | A : injecter attente/réponse obsolète, absence/filtre, refus/panne et réessai avec saisie | États distingués, pas de faux succès/divulgation/perte ; conserver les protections déjà livrées. |

Pour 045/047/048 : critères et DoD prouvés → clôture proposée ; comportement conforme mais preuve
manquante → qualification ciblée ; défaut reproduit → correction minimale à préparer ; nouvelle exigence
→ arbitrage séparé. **Aucune clôture effective dans cette intégration documentaire.**
047 peut précéder 015 par économie de preuve, sans dépendance technique ; défaut de lisibilité démontré
prioritaire. 016 et 048 peuvent avancer ensemble. F08 suit le risque constaté, pas le rang du tableau.
La [justification détaillée](../planning/audit-20261027/ordonnancement-ux.md) précise les conditions.

Les transitions restent un [suivi distinct C21](../planning/audit-20261027/anomalie-transitions.md),
sans nouveau PBI ni absorption automatique dans F08. Correctif technique publié dans main `eede631` :
ne pas reconstruire le raccord ; acceptation visuelle utilisateur encore non acquise. CI et mesures ne
valent pas ce verdict ; aucune refonte UX générale n’est justifiée par ces constats.

## MESS : contrats, distribution et preuves cible

| PBI / groupe | Livrable manquant et condition de passage |
| --- | --- |
| MEP-012 / MEP-043 — F04 | D+F pour 012 seulement : C06 réconcilie critères/suivi avec la décision du 21 octobre ; 043 reste réalisé, push direct et CI après intégration acceptés, réserve G05 non bloquante. Aucun chantier Git/CI/PR. |
| MEP-055 / MEP-054 / MEP-022 — Profil et contrats | D+F : D01–D09 approuvent l’environnement ; 054 contractualise schéma/précédence/chemins/secrets, C11 fixe opérations/objectifs/responsables. Aucun OS, SLA, RPO/RTO ou volume par défaut. |
| MEP-021 — Chargement commun | C+F après 054/009 : source approuvée consommée par API/workers/scripts, validations existantes préservées, refus avant effet. |
| MEP-057/058/059/024 — Distribution | Inventaire versions/ABI/empreintes/droits → build produit local et wheelhouse compatible → package exact avec manifeste/notices, sans secrets ni résolution réseau cible. |
| MEP-060/061/062/025 — Installation | C+F après package : préflight/idempotence, pose hors ligne, SQLite/bootstrap explicite puis diagnostic sans faux succès ; bootstrap développeur non réutilisé comme preuve cible. |
| MEP-063/064/026/027/065 — Exploitation | C+F : services/arrêt contrôlé, sauvegarde cohérente, upgrade, restauration isolée et rollback du couple code/schéma/données ; seuils et responsabilités C11 nécessaires aux mesures. |
| MEP-023/028/066/029/031 — Documentation | F, D si objectifs manquants : guides des commandes réelles, fork reconstructible et cahier technique à seuils décidés ; trames anticipables, finalisation après capacités techniques et contrats requis livrés. |
| MEP-056 — Suivi contractuel | D+F : C12 décide maintien/absorption ; le suivi après 021/022 n’est pas livré par cet audit, aucun retrait d’ID. |
| MEP-032/068 — Installation/autonomie cible | E après prérequis propres : PV d’installation vierge puis runtime hors Internet, même candidat et profil approuvé ; build local et CI ne sont pas ces PV. |
| MEP-033/069/070 — Recettes métier | E et D applicable : PV administration/notation/Results, droits/refus/intégrité/provenance et observations UX ; 033 dépend de la protection approuvée ARB-ORG-005. Aucun développement caché dans la recette. |
| MEP-034/071/072 — Recettes techniques | E et D applicable : sécurité/isolation, concurrence API/workers et reprise sur cible/clones identifiés ; C11 nécessaire aux protocoles/seuils de charge et reprise. |

Les [52 actions](../planning/audit-20261027/actions.md) et la [trajectoire par PBI à huit champs](../planning/audit-20261027/trajectoire.md)
donnent les entrées, dépendances, livrables, sorties et consommateurs exacts. Préparer les trames et
inventaires en parallèle des qualifications UX et des décisions ; cela ne livre pas les commandes absentes.
La [séquence canonique](../planning/pre-mep.md) conserve les dépendances réelles et la convergence finale
du package avec services/outils, sans cycle artificiel ni durée/calendrier inventés.

## Décisions ouvertes et frontières à préserver

| Question | Autorité attendue / véritables consommateurs bloqués |
| --- | --- |
| ARB-ORG-005 | Produit/MESS : politique par donnée/état ou limitation effective ; ORG-004, conformité administration MEP-033 et GO si opération destructive non arbitrée exposée. [Graphe et protections](../planning/audit-20261027/suppression-organisation.md). |
| D01–D09 | Exploitation/sécurité/réseau/PKI/messagerie MESS selon matrice ; profil, compatibilité, installation et services. [Ordre et livrables](../planning/audit-20261027/decisions-mess.md). |
| C11 | Produit/propriétaire des données et exploitation : charge/disponibilité/reprise/RACI et protocoles ; contrats, cahier technique, PV charge et reprise. |
| C01/C02 | Produit : collecte/reprise identité puis champs/cibles/droits Utilisateurs ; contrats complets USER-002/003 et delta distinct USER-001. |
| C03/C04/C05 | Produit : projection Organisation Coach, scope Équipes Coach et effets de réactivation ; seules les extensions concernées attendent. |
| C06 | Responsable dépôt/produit : traitement critères/verdict/date de MEP-012 ; suivi F04 avant GO, aucune nouvelle barrière de publication. |
| C12 | Produit : maintien ou absorption explicite de MEP-056 ; ni clôture ni retrait déduit de cette intégration. |
| C21 | Produit/UX avec l’utilisateur : portage, attendu visuel et inclusion au candidat ; acceptation esthétique non acquise, aucun gate nouveau implicite. |

Le [registre des contradictions](../planning/audit-20261027/contradictions.md) conserve l’autorité,
l’historique et les autres questions conditionnelles. Une publication documentaire ne les tranche pas.
Les **19 Features sans PBI propre restent non raffinées** : acquis voisins, satisfaction partielle,
capacités manquantes et besoins indécis sont distingués dans la [table de frontières](../planning/audit-20261027/structure.md).
Affectations courantes ≠ affectations datées ; planning courant ≠ calendrier/historique ; snapshots et
longitudinal par lignée ≠ historique général, calcul d’évolution ou tendance. Aucun nouveau PBI/parent
ni extension de la première MEP n’en est déduit. Aucun PBI non réalisé complet n’est déclaré prêt au
développement sans réserve à la base auditée ; 045/047/048 sont prêts **pour qualification uniquement**.
