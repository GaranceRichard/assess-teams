# Scénarios de décision et futurs critères S01–S11

[Retour au dossier](README.md). Chaque Then proposé dépend de l’approbation de R01–R09.
**Aucun scénario proposé n’a été exécuté dans ce mandat.** L/D/T : [définition et tests lus](diagnostic.md).

## Protocole commun pour la réalisation et la recette futures

Jeux fictifs isolés : organisation O, autre organisation P (dont une variante de même nom),
Superadmin root, Admin A, Coach C, Viewer V, Admin B de P. Identifiants inventoriés, aucun jeu réel.
Créer O par le parcours normal dans le nominal pour inclure activité de création et Logs administratifs,
et compléter par des fixtures ORM isolées pour les variantes impossibles à créer via l’API actuelle.
Session/CSRF valides, sauf variante explicite S08. La requête est DELETE `/api/admin/organizations/{O.id}/`.

**Observation REFUS** commune : HTTP 400 métier proposé avec motif intelligible ; comparer avant/après
Organisation, User, M2M membres/Coachs, familles/versions/questions/plans/runs/snapshots et notifications.
Comparer IDs, contenus, états, dates et provenance, pas seulement les comptes de lignes.
Journal métier inchangé, aucune ORGANIZATION_DELETED. Un Log HTTP de refus avec corrélation est admis ;
ce Log technique est exclu du snapshot métier, puis inspecté séparément. Aucun courriel créé/envoyé
par la tentative. Les écritures d’un worker concurrent autonome sont attribuées séparément en S10.

**Observation SUCCÈS** : 204 seulement après commit ; O et ses liens courants seuls disparaissent,
comptes/P/liens P intacts ; une activité ORGANIZATION_DELETED conserve identité d’origine, nom au moment
de la suppression, acteur/date. Les activités/Logs antérieurs gardent leur propre nom au moment du fait.
Relecture indépendante après transaction par DB et API ; contrôler accès et provenance R03/R04.
Les droits, codes et corps de réponse font aussi l’objet d’un contrat OpenAPI/React.

## Matrice Given / When / Then

| Cas | Given — état initial et variantes | When | Then actuel, niveau de preuve | Then proposé, après approbation |
| --- | --- | --- | --- | --- |
| S01 — Sans données métier | O et membres, ni équipe/famille/version/plan/run/snapshot/notification liée ; traces administratives présentes | root supprime O | T : 204 et comptes conservés ; D : traces SET_NULL, noms sans identifiant d’origine indépendant | SUCCÈS si provenance des traces assurée ; membres seuls admis, aucune perte du compte ni d’un autre rattachement |
| S02 — Équipe active | O, équipe active E, zéro puis plusieurs Coachs, aucune évaluation | root demande DELETE | D : CASCADE E/M2M possible ; aucune règle d’admissibilité générale | REFUS `équipes présentes`, E et affectations conservées même sans évaluation |
| S03 — Équipe archivée | E archivée par TEAM-005 ; variante sans run puis avec complétion | root demande DELETE | D : archive seule cascade possible ; T : complétion protectrice entraîne 400 et rollback | REFUS dans les deux variantes ; archive n’autorise pas une destruction historique |
| S04 — Référentiel | Famille seule ; puis version DRAFT, VALIDATED, ARCHIVED, questions et repères ; plusieurs versions | root demande DELETE | D : cascade si aucune référence protectrice ; T : référence commencée peut produire 400 | REFUS pour chaque fixture, y compris brouillon/famille sans version ; référentiel intégral conservé |
| S05 — Plans/NOT_STARTED | Plans immédiat/fixe/mensuel/trimestriel, avec/sans attente, assigné NULL/reassignment ; notifications liées | root demande DELETE | L/D : NOT_STARTED supprimés explicitement ; cascade du reste possible si aucun run conservé | REFUS ; aucune annulation/suppression/replanification/réaffectation implicite ni transition d’intention |
| S06 — Commencées/terminées | Run IN_PROGRESS avec notes partielles ; COMPLETED avec révision ; attente coexistante ; snapshots | root demande DELETE | T : 400 après démarrage ; T : complétion + attente et archives, snapshot métier conservé ; D : PROTECT conserve références | REFUS métier explicite pour chaque état ; données/provenance/accès légitimes conservés, indépendamment du garde-fou ORM |
| S07 — Traces/notifications | Traces seules ; puis notification liée dans chaque état ; variante liens indirects et organisation homonyme | root demande DELETE, accepté ou refusé selon la variante | T ORM : traces/noms gardés, liens NULL, root peut lire ; D/L : notifications gardées, éventuelle annulation ultérieure par worker | Traces seules : SUCCÈS sous R03/R04 ; toute notification liée : REFUS R05 ; aucun droit résiduel implicite pour ancien membre |
| S08 — Autorisation | O vide puis dépendante ; Admin/Coach/Viewer/anonyme ; root sans CSRF ; cible inconnue | Acteur envoie DELETE direct, sans dépendre du bouton | T : Admin/Coach/Viewer 403 ; anonyme 403 par inventaire ; root cible inconnue 404 | Mêmes refus ; pas de mutation métier ni exposition des dépendances ; CSRF 403 ; root cible inexistante 404 |
| S09 — Refus métier | Combiner équipe archivée, versions, plans, NOT_STARTED et IN_PROGRESS/COMPLETED, traces/intentions ; variante dépendance unique | root demande DELETE | T : rollback du graphe mixte COMPLETED/NOT_STARTED ; absence de refus général sur autres dépendances | REFUS avant effets ; aucun succès Journal ; tous états/liaisons conservés ; motif par catégorie sans accès de contournement |
| S10 — Concurrence | Connexions/processus distincts : suppression contre création équipe, plan, démarrage ; variantes worker/traces | Faire chevaucher les opérations aux frontières lecture/contrôle/commit | L : atomicité, pas de verrou explicite prélecture dans DELETE ; aucune preuve de ces courses identifiée | Ordre sérialisable métier : dépendance commise → DELETE refuse ; DELETE commis → création échoue proprement ; jamais de dépendance commise détruite avec un succès annoncé |
| S11 — Confirmation | root ouvre la confirmation ; O admissible ou devenue dépendante entre ouverture et validation | Lire, annuler ou confirmer ; simuler attente/refus puis réponse réelle | L : annonce définitive/comptes ; T mock : bouton root, erreur garde dialogue ; pas de conditions de dépendances | R09 visible, annulation sans requête DELETE ; refus API compréhensible garde O/dialogue, succès seul retire O ; aucune promesse d’archivage ou de suppression garantie |

## Observations et tests spécifiques par scénario

Ces vérifications s’ajoutent au protocole commun ; leur présence ne constitue pas l’autorisation de coder.

| Cas | DB / API / Journal à observer | Tests nécessaires après approbation ; refus ou limites à inclure |
| --- | --- | --- |
| S01 | Relire comptes, rôles/is_active, M2M de O/P, profil/session, activité de suppression unique, traces au même nom et à noms antérieurs | API/ORM nominal via création réelle ; variante liens multiples historiques injectés sans réautoriser la multi-appartenance ; assert explicite du lien P ; échec forcé en transaction annule suppression et activité |
| S02 | PK/nom/is_active/organization d’E et M2M Coachs inchangés ; autre organisation P inchangée | Tests API avec E seule, sans aucun run ; variante zéro Coach ; un 500 ORM n’est pas le refus métier attendu |
| S03 | État archivé, IDs, Coachs et provenance inchangés ; accès selon droits courants | API sans run protecteur, puis avec run ; non-régression TEAM-005 sans rouvrir son périmètre ni exiger TEAM-006/007 |
| S04 | Family.next_version, identifiants/version/status/index, questions, lineage_id et JSON intacts | Paramétrage de chaque état et famille seule ; variantes identiques de nom dans P ; pas de simple test avec COMPLETED qui masquerait le défaut sans PROTECT |
| S05 | Mode/first_due_date/next_due_date/assignee/requires_reassignment, attentes/liens et états EmailNotification avant/après | API par mode et état d’assignation ; plan seul par fixture technique ; attente seule au sens aucun run commencé ; corps/destinataire/tentatives inchangés, transport espion sans envoi réel |
| S06 | organization/team/evaluation/schedule, notes/snapshots, noms/dates de complétion/révision, IDs sources et lignées ; Results/radar/longitudinal en lecture | API IN_PROGRESS/COMPLETED et graphe mixte ; vraies réponses partielles/finales ; répéter les lectures légitimes et les refus hors scope sans nouveau droit |
| S07 | Traces gardées, origine stable distincte entre homonymes ; ancien nom inchangé après renommage ; notification liens/contenu/état gardés lors du refus | API/ORM succès traces seules ; chaque état notification en refus ; liens organization NULL mais team/evaluation/schedule de O présents ; notification seulement personnelle admise ; root lit, ancien Admin et autres rôles refusés |
| S08 | Zéro mutation de toutes tables métier, Log refus permis sans donnée étrangère ; même corps refus rôle pour cible connue/inconnue | Matrice rôles + anonyme, CSRF absent/invalide, acteur inactif ; appel direct API avec O dépendante et identifiants devinés ; aucune liste de dépendances donnée au non-Superadmin |
| S09 | Comparer graphe complet et M2M, Journal sans ORGANIZATION_DELETED ; Log WARNING séparé ; O toujours consultable selon scope initial | Non-régression d’un vrai refus pour chaque catégorie isolée puis mixte ; injection d’exception après activité pour démontrer rollback du nominal ; aucun « nettoyage » préalable pour faire passer le test |
| S10 | État final relu après fin des deux transactions ; réponses des deux côtés, Logs/corrélations, Journal, intents et absence d’orphelins | Intégration SQLite fichier/multiprocessus avec barrières, deux ordres, démarrage contre état NOT_STARTED ; délais/erreurs contrôlés ; doublon DELETE → au plus un succès ; worker SMTP simulé, pas d’envoi réel |
| S11 | Nombre de requêtes, erreur lisible, état de la liste après rechargement, activité uniquement après succès ; R04 expliqué | Vitest et E2E backend réel : annuler, attendre/double clic, 400, 403/404, erreur technique, dépendance apparue après ouverture ; clavier/focus et formats du cahier UX applicables |

## Détails d’accès S07 à ne pas omettre

Après succès, root doit retrouver les traces et leur organisation d’origine malgré la FK NULL.
A sans rattachement reçoit le refus actuel de contexte Admin ; A ensuite rattaché à P ne voit pas
les traces de O ; B ne les voit jamais. Coach, Viewer et anonyme n’obtiennent pas l’API Journal/Logs.
Ni le même nom de P, ni un identifiant deviné, ni l’identité conservée ne constituent une autorisation.
Lors d’un refus, O existe toujours et les accès autorisés avant la tentative restent inchangés.

Une provenance manquante/incohérente sur une trace encore reliée doit empêcher le succès tant que
R03 n’est pas garanti. Ne pas reconstruire un identifiant depuis un nom ; les lignes déjà détachées
avant le futur changement restent explicitement signalées comme telles.

## Preuve de recette attendue

Une ligne par scénario, rôle, état et ordre concurrent : candidat SHA complet/package/empreinte,
environnement et configuration expurgée, opérateur/date, données/IDs initiaux, requête/réponse,
observations DB/API/Journal/Logs/intentions, attendu/observé, verdict et réserves.
Les états non préparés donnent Bloqué ; une erreur technique inattendue donne Échoué, pas refus conforme.
Les appuis automatisés locaux ne sont ni un PV MESS ni une décision GO.
