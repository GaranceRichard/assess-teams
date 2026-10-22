# MEP-030 — Cahier de recette fonctionnelle MESS

Cahier défini le 2026-10-22 à partir de `origin/main` (`4bfb4a5`), pour le responsable de recette MESS.
Source : [MEP-030 / FEAT-065](../backlog/source/mess/f17.md) ; statuts :
[registre fonctionnel](../backlog/tracking/pbis.md) et [registre MESS](../backlog/tracking/mess-e04.md).
**Tous les scénarios ci-dessous sont Non exécutés dans MEP-030.** Ce livrable définit la recette ;
il ne vaut ni PV applicatif, ni qualification du candidat installé, ni GO MEP-035.

## Mode d'emploi

1. Identifier le candidat : SHA complet, version/package et empreinte, environnement, configuration expurgée,
   date, auteur, navigateur, fuseau navigateur et `as_of_date` backend. Ne jamais remplacer ces champs par la base de rédaction.
2. Préparer une instance isolée avec les [jeux fictifs et contrôles API](functional-acceptance-data.md).
   Réserver un clone par lot mutable ; ne pas réinitialiser les données d'un autre lot en cours.
3. Rejouer les scénarios dans l'ordre du lot, avec un compte distinct par rôle et un contexte navigateur par compte.
   Les préconditions non satisfaites donnent Bloqué, jamais Passé. Conserver l'inventaire des IDs réellement créés.
4. Exécuter séparément le nominal et chaque refus. Pour un refus attendu, le scénario passe seulement si le refus
   ET l'absence d'effet indiquée sont observés ; une erreur inattendue donne Échoué.
5. Joindre les preuves demandées, comparer attendu/observé, ouvrir ou référencer l'anomalie/PBI, puis signer le PV.
   Une assertion automatisée référencée n'est pas une exécution cible ni une preuve de succès actuelle.

| Lot / scénarios | Acteurs à exercer | PV cible consommateur |
| --- | --- | --- |
| [Accès et administration — FON-01 à FON-07](functional-acceptance-admin.md) | Anonyme, Superadmin technique, Admin, Coach, Viewer | MEP-033 ; contrôles d'accès aussi MEP-034 |
| [Évaluation et notation — FON-08 à FON-13](functional-acceptance-evaluations.md) | Admin/Superadmin, Coach assigné/non assigné, Viewer refusé | MEP-069 |
| [Résultats et pilotage — FON-14 à FON-18](functional-acceptance-results.md) | Admin, Coach, Viewer, Superadmin ; responsables de consultation | MEP-070 ; pilotage/traçabilité aussi MEP-033 |

Les [fiches MEP-033/069/070](../backlog/source/mess/f19.md) imposent leurs prérequis réels,
notamment MEP-068 et les correctifs UX concernés. La préparation/exécution locale d'un cas n'autorise pas leur clôture.
La recette hors Internet relève de MEP-068 ; incidents, SMTP indisponible, TLS/CSRF approfondi, charge SQLite,
sauvegarde et reprise relèvent de MEP-031/034/071/072. Les mesures UX restent dans le
[cahier MEP-067](ux-acceptance.md), conservé sans modification ; joindre ses résultats aux PV concernés.

## Frontière du livré et des travaux ouverts

Les scénarios utilisent uniquement les capacités démontrées dans la [couverture fonctionnelle](functional-coverage.md),
la [stratégie de tests](test-strategy.md), les contrats et les assertions citées dans chaque fiche.
Le statut Réalisé d'un PBI historique ne vaut pas livraison de sa Feature entière.

| État à la base de rédaction | Capacité / limite à respecter | Traitement en recette |
| --- | --- | --- |
| Livré | AUTH-001/002/003, DASH-001, USER-004 ; USER-001 au contrat historique | FON-01 à 04 ; ne pas exiger la saisie produit nom/prénom absente |
| Livré localement | ORG-001/003/005/006, TEAM-001/004, COACH-001 | FON-05/06, sans transfert daté ni partage |
| Livré | EVAL-001 à 004, PLAN-001, PASS-001, NOTIF-001 | FON-08 à 13 ; notification métier distincte de la remise SMTP |
| Livré | RESULT-001/002, STEER-001 P0, JOURNAL-001/002 | FON-07 et 14 à 18, sans score global, classement ou surveillance individuelle |
| Ouvert, socle partiel | USER-002/003 : liste/édition présentes, détail et contrat nom/prénom/identifiant incomplets | Tester le socle actuel en FON-04 ; ne pas clôturer ces PBI |
| Ouvert, socle partiel | ORG-002 et TEAM-002 : listes Admin/Superadmin ; consultation Coach absente | FON-05/06 : refus actuel de route/API Coach ; Viewer passe par Results selon ARB-ORG-012/015 |
| Ouvert ou absent | TEAM-003 détail ; TEAM-005 archivage partiel ; TEAM-006 écran archives ; TEAM-007 réactivation | FON-06 teste seulement l'archivage existant ; aucun détail/réactivation ou second refus explicite supposé |
| Bloqué | ORG-004 / ARB-ORG-005 : cascade possible sur certaines dépendances | Ne pas exécuter de suppression avec dépendances comme nominal accepté ; blocage administration/GO à traiter explicitement |
| Ouvert | MEP-044/013/045, MEP-014/046/015/047, MEP-016/048, MEP-017/049/018/050/051 et MEP-019 | Acquis testables séparément des améliorations UX encore à qualifier ; aucun de ces PBI clôturé ici |
| Réalisé, distinct | MEP-052/053, MEP-067 | Preuves UX conservées ; MEP-030 ne les rejoue ni ne les modifie |
| Ouvert / Bloqué | Installation, package et exploitation F10–F16, MEP-055 D01–D09, recettes F18–F20, suivi F04 | Aucun déploiement cible ni disponibilité MESS supposés ; vérifier le registre courant avant campagne |

Les [arbitrages canoniques](../backlog/source/00-arbitrages-organisations.md) restent applicables :
ARB-ORG-005 (dépendances à la suppression), 006 (dates/continuité des rattachements), 007 (transfert d'équipe),
010 (partage des modèles) et 013 (paramètres/agrégations multi-organisation) ne sont pas tranchés ici.
FON-05 vérifie seulement le rattachement courant livré ; EVAL-003 vérifie le versionnement local livré.
Pas de transfert, partage, export métier, objectif, tendance calculée, historique général ou préférence de canal inventés.
Une limitation d'ARB-ORG-005 exige une décision et une protection effectives vérifiables avant recette/GO ;
la seule exclusion d'un cas du cahier ne protège pas l'application.

## Appuis automatisés disponibles

Depuis le poste de préparation, commandes existantes pour des reprises ciblées, avec les
[ports et l'isolation](test-commands.md) propres au worktree. Les fixtures réinitialisent leurs jeux.
Ce PBI de documentation n'exécute pas ces campagnes et ne revendique pas leurs résultats.

```powershell
npm.cmd run test:e2e --prefix frontend -- bootstrap.spec.ts passwords.spec.ts permissions.spec.ts user-lifecycle.spec.ts organizations.spec.ts teams.spec.ts journals.spec.ts http-logs.spec.ts dashboard.spec.ts palettes.spec.ts
npm.cmd run test:e2e --prefix frontend -- evaluations.spec.ts evaluation-lifecycle.spec.ts evaluation-versions.spec.ts planning.spec.ts evaluation-replanning.spec.ts evaluation-explicit-rating.spec.ts evaluation-taking.spec.ts appreciation-markers.spec.ts dialog-taking-accessibility.spec.ts
npm.cmd run test:e2e --prefix frontend -- results.spec.ts results-longitudinal.spec.ts viewer-results.spec.ts steering.spec.ts indirect-access.spec.ts
npm.cmd run quality:targeted -- backend tests/test_evaluation_taking.py tests/test_evaluation_revision.py
```

Pour les refus API non couverts par un E2E précis et les variantes manuelles, joindre leurs propres observations ;
une suite verte ne permet pas de cocher tous les refus de la fiche. Le coverage de lignes et la recette métier
restent deux mesures distinctes. Aucun test ni processus de validation n'est refondu par ce cahier.
## Preuves, verdicts et sortie

Créer une ligne par scénario, rôle et variante, avec ce modèle réutilisable :

```text
Campagne / PV : [identifiant] ; candidat : [SHA complet, package/empreinte]
Scénario / variante / PBI : [FON-xx, nominal ou refus, PBI métier et consommateur]
Date / exécutant / environnement / navigateur / fuseaux : [à renseigner]
Jeu / IDs fictifs / état initial et préconditions : [à renseigner]
Actions réellement réalisées : [étapes et éventuels écarts au cahier]
Attendu / observé : [valeurs, code HTTP, état persistant avant/après]
Preuves : [capture, réponse expurgée, relecture, rapport/commande/sélection et sortie]
Verdict : Non exécuté | Bloqué | Passé | Échoué
Anomalie / PBI / décision / retest requis : [référence ou aucun]
Responsable de recette / date de revue : [à renseigner]
```

Conserver captures avant/après, valeurs exactes et provenance ; pour les refus d'écriture, comparer les objets
et le Journal métier avant/après, sans exiger l'absence de Logs HTTP légitimes. Expurger cookies, headers sensibles,
identifiants réels, mots de passe et liens/token d'invitation/récupération. Ne pas joindre de HAR ou trace contenant ces secrets.
Le responsable refuse un PV avec données sensibles, preuve absente, autre candidat non justifié,
capacité non livrée supposée présente, attente critique manquante ou résultat « Passé » sans exécution.
Une anomalie bloquante, un gate applicable rouge ou un arbitrage nécessaire empêche la clôture du PV/GO.
La [qualification du SHA exact](validation-costs.md) et les [conditions MEP-035](../backlog/tracking/mess-jalon.md)
restent distinctes du passage d'un scénario ou du pourcentage d'avancement.

La [revue documentaire et DoD MEP-030](functional-acceptance-review.md) porte sur la complétude du cahier.
