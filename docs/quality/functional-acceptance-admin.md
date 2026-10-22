# MEP-030 — Accès et administration : FON-01 à FON-07

Retour au [cahier et aux verdicts](functional-acceptance.md) ; [jeux G0 à G6 et méthode API](functional-acceptance-data.md).
État de chaque nominal/refus : **Non exécuté**. PV consommateur : MEP-033 ; refus de scope aussi MEP-034.
Les noms de suites ci-dessous désignent `frontend/e2e/<nom>.spec.ts` ; leur présence n'atteste aucun nouveau succès.

## FON-01 — Connexion, menus et déconnexion par rôle

- **PBI / préconditions :** AUTH-001, MEP-001/008/037 ; G0 actif, contextes séparés, compte inconnu `rec-inconnu` et compte en attente.
- **Actions :** ouvrir `/` sans session ; tenter un mot de passe erroné ; connecter successivement Admin, Coach, Viewer et Superadmin.
  Vérifier Dashboard, menus et accès directs selon la [matrice des routes](../architecture/role-permissions.md#correspondance-navigation-et-actions).
  Recharger pour vérifier la reprise de session ; se déconnecter et relire `GET /api/session/`.
- **Attendu vérifiable :** succès login 200, identité/rôle exacts ; Viewer n'a que Dashboard/Résultats ; Coach a Utilisateurs/Évaluations
  sans administration des équipes/modèles ; Admin a ses menus locaux ; Superadmin global sans organisation personnelle.
  Après déconnexion, session 403 et aucun objet métier visible.
- **Vrais refus :** inconnu/inactif/en attente ou mauvais mot de passe : 401 générique identique sans shell ; Viewer sur `/users`,
  `/teams`, `/planning`, `/evaluations`, `/steering` : page non autorisée et API de session correspondante 403 sans données.
  Sur clone séparé, atteindre le seuil configuré d'échecs (défaut : cinquième compte, fenêtre 15 min) : 429/Retry-After,
  bon mot de passe également refusé pendant la fenêtre, accès possible après expiration réelle. Ne pas attendre un délai de test abrégé sur la cible.
- **Preuves :** captures menus/session puis refus ; codes/corps expurgés, seuil/configuration et chronologie du délai ; suites
  [bootstrap](../../frontend/e2e/bootstrap.spec.ts), `permissions`, `login-restriction` ; backend `test_product_session.py`, `test_login_limits.py`.

## FON-02 — Récupérer puis modifier son mot de passe

- **PBI / préconditions :** AUTH-002/003 ; G0, email actif unique, boîte de recette et worker disponibles, deux sessions de `rec-viewer-a`.
  Appliquer aussi le changement personnel pour Admin, Coach et Superadmin sur leurs comptes fictifs.
- **Actions :** « Mot de passe oublié ? » → adresse active → ouvrir le lien reçu → saisir/confirmer un nouveau secret fictif conforme.
  Se connecter avec ce secret ; depuis Mon profil modifier le mot de passe avec l'actuel correct ; contrôler les deux sessions.
- **Attendu vérifiable :** demande 202 générique ; reset réussi sans connexion automatique ; ancien secret inutilisable et toutes les
  sessions antérieures invalidées au prochain contrôle. Changement personnel : session courante conservée, autre session 403 au prochain GET.
  Identité, rôle, appartenance et résultats inchangés. Le lien est retiré de l'URL visible après ouverture.
- **Vrais refus :** adresse absente = même 202/corps, aucun message reçu pour ce destinataire ; lien déjà consommé = 400 sans second changement.
  Mauvais mot de passe actuel, confirmation différente ou nouveau trop court = 400 sans changement ni invalidation des sessions.
  Expiration : variante avec lien réellement au-delà de la durée configurée (défaut récupération 1 h), refus 400 ; sinon laisser cette variante Non exécutée.
- **Preuves :** accusés expurgés, vérifications des sessions et absence d'effet, réception datée sans contenu secret/token ;
  [passwords](../../frontend/e2e/passwords.spec.ts), backend `test_password_recovery.py`, `test_password_reset.py`, `test_password_change.py`.
  Respecter la [politique](../architecture/password-management.md) ; aucune trace navigateur avec credentials jointe au PV.

## FON-03 — Accueil personnel et préférences

- **PBI / préconditions :** DASH-001, AUTH-001 ; G0/G3 avec une complétion puis sa révision et une attente assignée ; noter leurs IDs/date/auteur.
- **Actions :** ouvrir Dashboard pour chaque rôle ; comparer profil, activité récente et raccourcis ; choisir Bleu dans Apparence,
  changer de page, recharger, reconnecter dans un nouveau contexte ; basculer clair/sombre indépendamment.
- **Attendu vérifiable :** nom/prénom s'ils existent sinon identifiant ; contexte courant exact ; dix événements maximum, complétion
  et dernière révision issus des runs, dates/snapshots cohérents. Coach = assignations locales ; Viewer = COMPLETED locales sans auteur ;
  Superadmin = activité globale contextualisée. Compteur personnel seulement Admin/Coach, sans créer d'attente à la lecture.
  Palette personnelle restaurée ; changer le mode ne modifie pas la palette et le choix n'affecte pas un autre compte.
- **Vrais refus :** `GET /api/dashboard/` anonyme = 403 ; sous Viewer, paramètres étrangers ne révèlent pas Beta ni auteurs.
  `PATCH /api/session/` avec `interface_palette=invalid` = 400 ; relecture conserve la précédente, aucun succès affiché.
- **Preuves :** captures par rôle, tableau événements attendus/observés, session palette avant/après ;
  [dashboard](../../frontend/e2e/dashboard.spec.ts), `palettes` ; backend `test_dashboard.py`, `test_dashboard_security.py`, `test_session_palette.py`.
  Le [contrat Dashboard](../architecture/dashboard-api.md) ne livre aucun score ou classement individuel.

## FON-04 — Invitation, hiérarchie et lifecycle d'identité

- **PBI / préconditions :** USER-001 historique, USER-004, MEP-037 ; G0/G3. USER-002/003 restent ouverts.
  Pour le dernier Admin, utiliser un clone Alpha avec un seul Admin actif ; conserver un run complété par le Coach et un planning ouvert.
- **Actions :** Superadmin invite un Admin non rattaché ; Admin Alpha invite un Viewer local puis active son lien reçu.
  Coach Alpha ouvre la liste et modifie le mail d'un Viewer local via l'édition existante, sans changer la fonction.
  Admin désactive `rec-coach-a` pendant que sa session est ouverte, puis le réactive ; recharger listes, planning et historique.
- **Attendu vérifiable :** compte En attente avant activation, identifiant stable après ; invitation n'ouvre aucune session.
  Admin n'administre pas les Admins pairs ; Coach n'administre que Viewer local. Désactivation conserve ID/liens/notes/auteur/date,
  bloque la session existante (403), réactivation autorise une nouvelle connexion ; planning ouvert reste à réaffecter explicitement.
  Répéter désactivation/réactivation est idempotent sans nouvelle activité de transition à état identique.
- **Vrais refus :** Superadmin désactive le dernier Admin actif : 400, Admin toujours actif ; Admin crée un Admin ou modifie son pair : 403.
  Coach invite un compte : 403 ; mutation sur cible Beta : 404 ; Viewer lit Utilisateurs : 403. Rejouer un lien d'invitation consommé : 400.
  Sur chaque refus : identité, rattachement, activité de succès et intention de notification inchangés (attestation exploitant pour la file).
- **Preuves :** captures état avant/après, IDs/provenance, codes de chaque acteur et relecture autorisée ; `bootstrap`, `permissions`,
  [user-lifecycle](../../frontend/e2e/user-lifecycle.spec.ts) ; backend `test_managed_user_permissions.py`, `test_managed_user_invitations.py`,
  `test_user_lifecycle.py`, `test_user_lifecycle_history.py`, `test_user_lifecycle_access.py`.

## FON-05 — Organisation, renommage et rattachements courants

- **PBI / préconditions :** ORG-001/003/005/006, MEP-011 ; G0/G1 et Admin/Coach non encore rattachés pour une nouvelle organisation.
  ORG-002 est partiel ; ORG-004 est Bloqué, aucune suppression avec dépendances comme nominal admis.
- **Actions :** Superadmin crée `Recette Gamma` avec un Admin actif et un Coach ; Admin Gamma renomme cette organisation,
  ajoute/retire un Coach courant ; relire la fiche sous Admin et Superadmin, puis vérifier les sessions des membres retirés.
- **Attendu vérifiable :** création 201 atomique ; renommage conserve ID/membres ; remplacement membres conserve les Admins pour l'Admin,
  au moins un Admin actif et une seule organisation par identité. Retrait = ancien scope perdu au prochain appel, snapshots historiques inchangés.
- **Vrais refus :** création par Admin = 403 ; création sans Admin actif ou avec membre déjà dans Alpha, ou Superadmin comme membre = 400,
  aucune organisation ni rattachement partiel. Admin retire un pair via `PUT .../members/` = 400 ; renommage de Beta par Admin Alpha = 404.
  Coach/Viewer sur API Organisation = 403 selon socle actuel ; cela ne valide pas la consultation Coach non livrée.
- **Preuves :** inventaire ID/membres avant/après, sessions conservées pour vérifier le retrait, réponses expurgées ;
  [organizations](../../frontend/e2e/organizations.spec.ts), `indirect-access` ; backend `test_organizations.py`, `test_organization_rename.py`,
  `test_admin_organization_scope.py`, `test_isolation_sessions.py` ; [arbitrages 005/006](../backlog/source/00-arbitrages-organisations.md).

## FON-06 — Équipe, Coachs courants et archivage partiel

- **PBI / préconditions :** TEAM-001/004, COACH-001 ; TEAM-002/005/006 partiels, TEAM-003/007 absents ; G0/G1, résultat déjà complété sur A.
- **Actions :** Admin Alpha crée `Équipe Recette` avec deux Coachs locaux ; renomme, retire un Coach et recharge.
  Superadmin refait le nominal dans Beta ; Admin archive A via l'action existante et consulte son résultat historique.
- **Attendu vérifiable :** rattachement unique, noms/Coachs persistés ; Coach voit ses équipes actives au Dashboard sans menu Équipes.
  Archivage retire A de la liste active et du Pilotage, conserve son résultat COMPLETED accessible ; aucun bouton de réactivation supposé.
- **Vrais refus :** création ` équipe recette ` après `Équipe Recette` = 400 (casse/espaces ignorés), même après archivage ;
  un nom identique dans Beta reste autorisé. Coach Beta dans la création Alpha = 400, équipe/affectations inchangées.
  Admin Alpha modifie une équipe Beta = 404 ; Coach/Viewer sur API Équipes = 403 ; aucun succès Journal après refus.
- **Preuves :** listes avant/après, affectations/organisation/IDs, résultat conservé et refus API ;
  [teams](../../frontend/e2e/teams.spec.ts), backend `test_teams.py` et [isolation](../architecture/organization-isolation-validation.md).
  Ne pas noter TEAM-005 entièrement accepté : restitution archivée dédiée et second refus explicite restent ouverts.

## FON-07 — Journal métier et Logs techniques cloisonnés

- **PBI / préconditions :** JOURNAL-001/002, MEP-011/037/038 ; G6, événements Alpha/Beta repérés, accès Superadmin pour le global.
- **Actions :** Admin ouvre Journal d'activité puis Logs ; retrouve création/finalisation/révision par date, acteur et équipe.
  Dans Logs combine organisation, utilisateur, équipe, évaluation, Du/Au, méthode, niveau, source et statut ; paginer si >20 lignes.
  Superadmin change d'organisation ; vérifier la remise à zéro des filtres dépendants et les événements sans organisation.
- **Attendu vérifiable :** succès métier dans Journal ; requêtes réussies/refusées dans Logs avec statut/corrélation, sans faux succès métier.
  Bornes temporelles inclusives et tri décroissant ; Admin voit Alpha seulement, organisation imposée, aucun log système global.
  Détail sans body, cookie, token, secret ni traceback ; en lecture seule.
- **Vrais refus :** Coach/Viewer/anonyme sur les deux API = 403. Admin Alpha sur `GET /api/admin/logs/?organization=<Beta>` = 200,
  `count=0`, aucune donnée Beta ; filtre `status_code=999` = 400. Ces lectures ne modifient aucun objet métier.
- **Preuves :** captures des deux journaux, ligne de succès et ligne 400 corrélée au refus, filtres/compteurs et corps expurgés ;
  [journals](../../frontend/e2e/journals.spec.ts), `http-logs` ; backend `test_activity_journal.py`, `test_http_logs.py`, `test_logs_api.py`.
  Purge/rétention opérationnelles hors scénario ; [contrat des journaux](../architecture/journals-api.md).
