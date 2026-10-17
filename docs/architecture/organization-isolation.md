# Isolation organisationnelle — MEP-011

Audit du socle `20d9ad3`, Feature FEAT-049 ; [preuves API et validation](organization-isolation-validation.md).
Une permission de rôle autorise une capacité ; elle ne donne aucun accès global aux objets.
Le backend applique le scope avant consultation, recherche, pagination et mutation.

## Autorités et règles appliquées

| Repère | Source canonique et règle |
| --- | --- |
| R1 | [Décisions Organisation](../backlog/source/00-arbitrages-organisations.md), cloisonnement : aucun partage interorganisation déduit ; identifiant connu sans droit = refus. |
| R2 | Même registre, ARB-ORG-001/011/015 et [ORG-005/006](../backlog/source/05-organisations.md) : rattachement courant unique ou absent ; Admin dans son organisation, jamais administrateur de ses pairs. |
| R3 | [COACH-001](../backlog/source/02a-accompagnement-equipes.md) : Coachs courants d’équipe dans la même organisation ; affectation d’équipe distincte de l’assignation d’une passation. |
| R4 | [Passations](../backlog/source/03a-passations.md) et [contrat](evaluation-taking.md) : organisation historique du run ; Coach assigné ET membre courant, Admin dans son organisation, Superadmin global. |
| R5 | [Résultats](results-api.md) et ARB-ORG-012 : Viewer sur les COMPLETED de son organisation ; Coach sur ses COMPLETED assignées ; aucune mutation Viewer. |
| R6 | ARB-ORG-006 et [lifecycle](user-lifecycle.md) : aucun transfert implicite ni réécriture des faits ; noms snapshotés et références conservés. |
| R7 | [Planification](evaluations-api.md) : organisation, équipe active, modèle VALIDATED et responsable actif cohérents ; Superadmin peut se désigner lui-même. |
| R8 | [Journaux](journals-api.md) : Admin dans son organisation historique ; Superadmin global, lui seul voit les Logs sans organisation. |
| R9 | [AUTH-001](../backlog/source/01-identites.md), [permissions API](api-permissions.md) : authentification/session active et CSRF ; rattachement lu en base à chaque requête. |

## Matrice vérifiable

A et B sont deux organisations réellement persistées. « Équipe quelconque » ne donne aucun droit
supplémentaire. Les autorisations ci-dessous restent soumises aux invariants métier (état, complétude,
dernier Admin actif, unicité locale) et à la hiérarchie fonctionnelle existante.

| Rôle | Organisation courante | Équipe / assignation | Propriétaire | Action | Décision | Règle |
| --- | --- | --- | --- | --- | --- | --- |
| Superadmin | aucune | quelconque | A ou B | Administrer organisation, membres, équipes, modèles, questions, planning | Autorisé dans les capacités existantes | R1/R2/R7 |
| Superadmin | aucune | quelconque | A ou B | Lire, compléter ou réviser passation ; lire Results/Dashboard/Journal/Logs | Autorisé, sans exemption des invariants | R4/R5/R8 |
| Superadmin | aucune | équipe A, modèle B | A/B | Créer/modifier planning ou affecter Coach B à équipe A | Refus même global | R1/R3/R7 |
| Superadmin | aucune | planning A | A | S’auto-affecter / affecter un autre Superadmin | Autorisé / refus 404 | R7 |
| Superadmin | aucune | historique commencé | A | Supprimer organisation protégée | Refus 400 sans effet | R6 |
| Admin | A | quelconque | A | Lister/lire/renommer organisation ; gérer Coach/Viewer, équipes, modèles, questions, planning | Autorisé | R2/R3/R7 |
| Admin | A | quelconque | B | Lecture directe, liste d’équipes/questions, mutation avec ID B réel | Refus 404 ; aucune donnée ni effet | R1/R2 |
| Admin | A | quelconque | A | Filtre de collection `organization_id=B` | Vide si filtre supporté ; sinon paramètre ignoré sans élargir A | R1/R2 |
| Admin | A | aucune assignation nécessaire | A | Lire/compléter/réviser passation ; Results/Dashboard | Autorisé dans A | R4/R5 |
| Admin | A | quelconque | B | Utilisateur B recherché ; filtre Journal/Logs B | Collection vide, aucune révélation | R1/R8 |
| Admin | A | équipe A | A | Coach B dans corps ; équipe/modèle/responsable B dans planning | Refus 400 équipe / 404 planning | R1/R3/R7 |
| Admin | A | quelconque | A | Gérer Admin pair / créer ou supprimer organisation | Refus fonctionnel 403 (membres protégés : 400) | R2 |
| Coach | A | assigné au run A | A | Lire/démarrer/noter/finaliser passation ; Results COMPLETED | Autorisé | R4/R5 |
| Coach | A | membre d’équipe A, non assigné | A | Consulter passation ou résultat d’un autre assigné | Refus 404 ; liste sans ce run | R3/R4/R5 |
| Coach | A | ancien lien ou assignation B | B | Lecture, mutation ou résultat B | Refus 404 ; absent des listes | R1/R4/R5 |
| Coach | A | quelconque | A/B | Administration organisations/équipes/modèles/planning/Journal/Logs | Refus fonctionnel 403 | R2/R3/R8 |
| Coach | A | quelconque | A / B | Gérer Viewer local / Viewer B | Autorisé localement / refus 404 | R1/R2 et lifecycle |
| Viewer | A | aucune assignation requise | A | Lire Results COMPLETED et activité Dashboard autorisée | Autorisé en lecture ; auteurs Dashboard masqués | R5 |
| Viewer | A | quelconque | B | Results direct, famille, version, filtre ou historique | Refus 404 / absence des listes | R1/R5 |
| Viewer | A | quelconque | A/B | Passation et administration, toutes mutations métier | Refus fonctionnel 403 | R5 |
| Admin/Coach/Viewer | aucune | ancien lien conservé | A/B | Lire ressource d’ancien périmètre | 404 ou 403 selon capacité ; listes de données vides | R1/R2/R4/R5/R9 |
| Admin passé de A à B | B | session ouverte en A | A / B | Accès ancien / nouveau périmètre | A refusé, B autorisé ; historique A inchangé | R2/R6/R9 |
| Coach passé de A à B | B | ancien lien équipe/run A | A / B | Accès ancien / nouveau run assigné B | A refusé, nouveau run B autorisé | R3/R4/R6/R9 |
| Viewer passé de A à B | B | session ouverte en A | A / B | Résultats anciens / nouveaux | A refusé, COMPLETED B autorisées | R5/R6/R9 |
| Coach | A | équipe retirée, run toujours assigné | A | Consulter son run | Autorisé : l’équipe ne remplace pas l’assignation | R3/R4 |
| Coach | A | run NOT_STARTED réassigné à un collègue | A | Réutiliser ancienne session | Ancien assigné refusé ; nouveau autorisé | R4/R9 |
| Admin/Coach/Viewer | A | équipe/modèle archivés | A / B | Consulter COMPLETED historique | Même scope courant ; archive sans nouveau partage | R4/R5/R6 |
| Admin/Superadmin | A / aucune | ancien Coach d’équipe passé en B | A | Confirmer à nouveau cette référence | Refus 400 ; retrait explicite possible, aucun nettoyage automatique | R1/R3/R6 |
| Admin | A | responsable historique passé en B | A | Lire liens historiques / identité courante B | IDs et snapshots conservés ; nom/rôle courant planning et activation run masqués | R1/R6 |
| Admin | A | retrait explicite d’ancien Coach passé en B | A | Lire le Journal du retrait | Référence `#ID` sans recopier le nouveau nom B ; ancien historique conservé | R1/R3/R6 |
| Worker d’échéance | contexte A | responsable passé en B | A | Créer/réécrire attente, journaliser absence de destinataire | Aucun snapshot B créé dans A ; Log sans acteur étranger ; anciennes données conservées | R1/R6/R7 |

## Endpoints et mécanismes examinés

Tous les chemins ci-dessous sont préfixés par `/api/`. Les méthodes absentes ne sont pas inventées.

| Famille | Routes / méthodes existantes | Contrôle constaté |
| --- | --- | --- |
| Session, profil, Dashboard | `session/` GET/PATCH, login/logout POST, `dashboard/` GET | Django recharge l’identité ; préférences sans cible tierce ; profil/activité filtrés, paramètres forgés sans effet. |
| Identités | `users/` POST ; `admin/users/` GET/POST ; `{id}/` PUT/DELETE ; deactivate/reactivate POST | Création technique Superadmin ; scope membres avant cible ; hiérarchie puis transition atomique, recherche après scope. |
| Organisations | `admin/organizations/` GET/POST, `{id}/` GET/PUT/DELETE, `{id}/members/` PUT | `visible_organizations`, cardinalité, Admins protégés, transaction et verrou avant mutation de membres. |
| Équipes | `admin/organizations/{id}/teams/` GET/POST, `admin/teams/{id}/` PUT/DELETE | Organisation accessible, équipe active ; références Coach résolues dans l’organisation, données courantes filtrées à la restitution. |
| Modèles | `admin/evaluations/` GET/POST ; `{id}/` PUT/DELETE ; validate/archive/versions POST | `visible_evaluations`, verrou de brouillon/version, propriétaire conservé ; filtre de liste ajouté au scope. |
| Questions | `admin/evaluations/{id}/questions/` GET/POST ; `admin/questions/{id}/` PUT/DELETE | Parent et question filtrés par organisation ; pas de mutation d’une version immuable. |
| Planning | `admin/planning/` GET/POST ; `{id}/` PUT/DELETE | Cible scopée et chacune des quatre références validée, transaction conservée ; exception Superadmin limitée à soi. |
| Passations | `evaluations/` GET ; `{id}/` GET/POST ; responses PUT ; finalize POST ; revision PUT | Organisation historique + assignation Coach ; scope revérifié sur ligne verrouillée, questions du run uniquement. |
| Results | organizations/versions/families GET ; versions/{id}, families/{id}, criteria/{uuid} GET | Scope avant version, équipe, lignée et observations ; sélection mixte forgée refusée intégralement. |
| Pilotage | `steering/organizations/`, `steering/` GET | Organisation unique imposée à Admin, choisie explicitement par Superadmin ; pas d’agrégat implicite. |
| Journal/Logs | `admin/activity-journal/`, `admin/logs/` GET | Scope organisationnel avant filtres/pagination ; snapshots historiques, Logs globaux réservés au Superadmin. |
| Échéances existantes | Worker `deliver_due_schedule`, puis listes API planning/passations/Logs | Destinataires membres courants ; aucune attente créée/réécrite avec un assigné hors organisation, aucun nom courant étranger dans le diagnostic. |

Les routes publiques santé, schéma, docs, récupération, reset et invitation gardent les exceptions
justifiées de MEP-008. Les mutations personnelles de mot de passe ne prennent aucune ressource tierce.
Les tests d’inventaire MEP-008 et des mots de passe restent applicables.

## Arbitrages et frontières conservés

- ARB-ORG-006 : dates d’effet, traitement complet des liens métier courants, chronologie des
  rattachements et consultation d’un éventuel nouvel historique d’affectations restent à raffiner
  dans FEAT-003/008/009. Les M2M anciennes ne deviennent jamais un droit d’accès ni une propriété.
  Le contrôle du worker empêche de nouvelles données interorganisation ; il n’ajoute ni date d’effet,
  ni transfert, ni réaffectation automatique, ni nouvelle règle de lifecycle des planifications.
- ARB-ORG-007 : transfert d’équipe absent. Aucun endpoint ne change son organisation ; les champs
  étrangers non contractuels ne la déplacent pas. Pas de simulation d’un transfert métier non décidé.
- ARB-ORG-010/013 : partage de modèles, paramètres et vues interorganisation non livré/non décidé.
  Le CRUD local, les familles et les résultats n’accordent aucun partage.
- ARB-ORG-005 / ORG-004 : suppression d’organisation avec dépendances autres que passations
  commencées reste ouverte. La protection historique existante est testée, sans redéfinir les cascades.
- TEAM-006/007 : consultation générale des archives et réactivation non livrées ; seul le filtre
  existant des archives et les résultats historiques sont contrôlés ici.
- MEP-037 garde la matrice générale des rôles/navigation ; MEP-038 garde exports et accès indirects.
  Les filtres/relations déjà présents sont testés ici pour ne laisser aucune fuite démontrée.
- Les conflits d’unicité d’identité demeurent des validations globales de USER-004, sans révéler
  l’organisation d’un compte ; aucune recherche ou fiche hors scope n’est ajoutée.
- Aucun export, partage, migration, nouveau rôle ni nouvelle architecture d’autorisation.
