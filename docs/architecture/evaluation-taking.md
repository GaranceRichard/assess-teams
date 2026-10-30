# Passation des évaluations planifiées

La route React `/evaluations` est ouverte aux Admins et Coachs selon la navigation existante.
Le backend applique la session Django et le CSRF aux mutations ; il décide toujours du périmètre.

## Données conservées

`EvaluationRun` référence la planification source et sa date d’échéance, son organisation,
son équipe, son modèle et son assigné. Les questions figent aussi leur lignée UUID explicite au démarrage
pour la compatibilité longitudinale, indépendamment des modifications ultérieures du référentiel. L’unicité `(schedule, due_date)` évite les doublons.
Après complétion ponctuelle, replanifier le même modèle pour la même équipe crée une nouvelle
planification et une passation indépendante ; les anciennes passations et leurs snapshots sont conservés.
La première passation attendue est créée à la planification ; les échéances récurrentes le sont
par le traitement de notifications existant, avant l’avancement de `next_due_date`.
La migration reprend les planifications existantes ayant un assigné, sans inventer leurs cycles passés.

L’état vaut `not_started`, `in_progress` ou `completed`. Au démarrage, un modèle local non vide
au statut `VALIDATED` est contrôlé et verrouillé, puis ses questions exactes, textes et index sont
copiés dans `EvaluationRunQuestion`. Les modèles validés sont déjà immuables grâce à `EVAL-002`.
L’archivage interdit un nouveau démarrage, mais ne bloque ni reprise, ni complétion, ni révision
d’une passation commencée. Le snapshot garantit la provenance avec la FK de version exacte.
Le [versionnement](evaluation-versioning.md) conserve les runs existants et ajoute en lecture
`family_id`, `family_name`, `evaluation_version` ; le nom historique du run reste conservé.
Une réponse appartient à une seule passation, référence la question source protégée et porte
une note entière `0..10` ou `null` avant réponse. Contraintes DB : état, provenance cohérente,
unicité échéance, question/index uniques et index positif, notes entières et bornées même sous SQLite.

Les noms d’organisation, équipe, modèle, assigné, auteur initial et dernier réviseur sont figés.
Les comptes supprimés rendent leurs FK nulles sans supprimer ces noms historiques.
`completed_by`/`completed_at` sont fixés à la première finalisation. `revised_by`/`revised_at`
décrivent uniquement la dernière révision, sans changer la complétion initiale.
Les modifications ultérieures du planning ne transfèrent pas une passation déjà commencée.
La suppression d’un modèle, question, planning ou organisation utilisé par une passation commencée
est refusée avec `400` ; les attentes jamais commencées peuvent être retirées avec leur source.

## Ordre de la liste

Le tri SQL de `GET /api/evaluations/` s’applique après le scope d’accès et avant
la pagination optionnelle (`page`, 20 lignes). Il ne change ni filtres ni format de réponse.
Les `not_started` et `in_progress` partagent le premier bloc, par `created_at` croissant :
ce champ existe et aucune date d’assignation n’est enregistrée. `due_date` est une échéance,
pas une date de création. Le second bloc regroupe les `completed` par `completed_at` décroissant,
sans utiliser `revised_at`. Toute égalité est départagée par `pk` croissant dans chaque bloc.
Les dates absentes sont placées en fin de leur bloc, puis départagées par `pk` ; les contraintes
actuelles interdisent toutefois `created_at=null` et une complétion sans `completed_at`.
Les dates de complétion/révision nulles des passations actives restent normales et sans effet sur le tri.
Après complétion dans la modale, React recharge la page depuis le serveur pour rétablir l’ordre
global et compléter la page avec les bonnes lignes, sans trier un sous-ensemble local.
La démo suit les mêmes blocs ; ses créations fictives sont départagées par leur identifiant séquentiel.
Les tests couvrent états mixtes, dates égales/optionnelles absentes, contraintes sur les dates requises,
ajout, complétion/refus, périmètres Coach/Admin et frontières de pagination.
Revue documentaire : README, règles agents, charte, DoD, stratégie, fondamentaux et contrat API ;
seule cette description de passation et le README sont affectés. Aucun modèle ni migration modifié.

## API minimale

| Méthode / chemin                                         | Effet / réponse                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `GET /api/evaluations/`                                  | Tableau accessible, `200` liste                                                 |
| `GET /api/evaluations/{run_id}/`                         | Contexte, questions ordonnées et réponses, `200`                                |
| `POST /api/evaluations/{run_id}/`                        | Démarrage ou reprise idempotente, aucun payload, `200`                          |
| `PUT /api/evaluations/{run_id}/responses/{question_id}/` | JSON `{ "score": 0 }`, sauvegarde, `204`                                        |
| `POST /api/evaluations/{run_id}/finalize/`               | Finalisation atomique, aucun payload, `200`                                     |
| `PUT /api/evaluations/{run_id}/revision/`                | Toutes les réponses `{ "answers": [{ "question_id": 1, "score": 10 }] }`, `200` |

Liste et détail exposent modèle, organisation, équipe, assigné original, auteur réel de complétion,
date initiale, état, date d’échéance et dernière révision. Les IDs de provenance sont également exposés.
`is_assignee` et `can_revise` alimentent l’interface, sans remplacer la permission backend.
Avant démarrage, le détail contient une liste de questions vide ; `POST` fige ensuite les questions.
La finalisation exige toutes les notes ; sa répétition ne change ni date/auteur ni Journal d’activité.
La [qualification MEP-040](../operations/sqlite/critical-conflicts.md) vérifie ces invariants avec
processus distincts : upgrade concurrent refusé sans mutation partielle, note tardive refusée,
répétition idempotente et copie de modèle compatible, sans changer le contrat de finalisation.
La révision exige exactement toutes les questions, une seule fois, et ne sauvegarde rien en cas de refus.

`400` refuse les notes hors bornes, flottantes, booléennes, chaînes, nulles ou structures invalides,
les questions étrangères, les champs de contexte forgés, le modèle vide ou non validé, l’équipe archivée au démarrage,
les réponses manquantes et la modification d’une complétion hors révision Admin.
`403` refuse Viewer, anonyme, CSRF manquant et révision par Coach ; `404` masque tout ID hors périmètre.
Le schéma DRF/Spectacular est généré par `/api/schema/` et testé avec sa validation complète.

## Permissions, interface et activités

Un Coach membre de l’organisation lit/remplit seulement ses assignations, puis les consulte après validation.
Un Admin lit toutes les attentes et complétions de son organisation, peut répondre à la place de l’assigné
et réviser les complétions. Le Superadmin conserve son périmètre global. Aucun droit Viewer n’est ajouté.
Les scopes se basent sur l’organisation historique de la passation, jamais sur un ID fourni dans le payload.
Après changement de rattachement, la même session perd l’accès à l’ancien périmètre ; les noms
snapshotés restent inchangés. `assignee_active` est null si l’assigné a quitté l’organisation,
hors Superadmin global. La [matrice MEP-011](organization-isolation.md) et ses preuves couvrent ces cas.
Le scope de lecture est aussi utilisé par les mutations : après verrouillage de la passation courante,
le service revérifie l’assignation et l’appartenance à l’organisation dans sa transaction. Si ce contexte
a changé depuis la première lecture HTTP, la mutation retourne `404`, sans réponse modifiée ni activité métier.

Une même modale native sert passation, consultation et révision : question X/N, range entier accessible
au clavier, note affichée, précédent/suivant, sauvegarde ordonnée, erreurs et reprise après interruption.
Sa largeur responsive est bornée à 38 rem ; sa hauteur intrinsèque suit les textes réels et reste
bornée au viewport dynamique. Le titre et les actions restent fixes ; seul le contenu actif défile
si nécessaire, sans défilement propre à la question ou au descriptif.
La finalisation attend la confirmation des sauvegardes ; une révision est validée atomiquement.
« Échelle entière de 0 à 10 » reste visible et fait partie de la description accessible du curseur,
même avant toute sélection. Une question sans réponse affiche « Aucune note sélectionnée », sans poignée ni descriptif sélectionné.
Le range natif conserve une position technique médiane, sans valeur métier : seul un geste de sélection
(clic/toucher sur la piste ou sur un nombre, déplacement ou flèches clavier) enregistre une note.
Les onze nombres 0–10 restent visibles au-dessus de la piste, alignés sur le centre de la poignée ;
le nombre choisi est souligné, renforcé et signalé par `aria-pressed`. Les points de repère restent passifs.
Le curseur demeure l'entrée clavier unique : Home choisit 0, End choisit 10 et les flèches ajustent la note.
Entrée/Espace sur le curseur, le focus, l'ouverture et la fermeture ne choisissent aucune note.
Une réponse absente reste `null` à la reprise ; les notes enregistrées, dont zéro, sont restaurées.
« Enregistrer la note » et « Suivant » restent désactivés sans réponse explicite à la question courante.
Dans cette modale uniquement, les boutons désactivés gardent un pointeur normal (`cursor: default`),
sans indicateur d'attente, et leur opacité réduite signale leur indisponibilité en clair comme en sombre.
`evaluation-disabled-cursor.spec.ts` vérifie le survol, les clics inertes, le parcours clavier sans réponse
implicite et la réactivation après sélection explicite ; le test échoue sur `wait` avant correction.
Ce garde d'interface ne modifie pas les validations métier ou API. La navigation et la fermeture
attendent les sauvegardes explicites ; un refus conserve la saisie et exige une nouvelle sauvegarde.
Pendant `saving` ou `unsaved`, le dialogue empêche Échap dès `keydown` : un `cancel` natif répété peut ne plus être annulable.
Après sauvegarde, `onCancel` conserve la fermeture React, sa transition et la restitution du focus.
Les deux tests `evaluation-taking-escape.spec.ts` couvrent cinq appuis en attente/refus, puis réessai 204 et fermeture autorisée.
La finalisation reste indisponible et refusée par l’API si une question n’est pas renseignée.
Le tableau distingue « Assigné à » de « Rempli par » et indique « Révisé par [ADMIN] le [date/heure] ».

Le Journal d’activité existant enregistre `evaluation_completed`, `evaluation_completed_by_admin`
et `evaluation_revised` dans la transaction métier. GET, sliders, sauvegardes et navigation n’y créent rien.
Le gestionnaire commun des erreurs couvre aussi `/api/evaluations/`, avec son contexte d’organisation,
sans nouvelle infrastructure, stockage de payload ni journalisation HTTP spécifique.

Les passations inachevées liées à une planification à réaffecter restent consultables mais leurs mutations
sont refusées (400), même après réactivation. Aucune COMPLETED n’est modifiée par désactivation.
Voir le [lifecycle User](user-lifecycle.md).

## Repères d’appréciation

Les questions du détail ajoutent `appreciation_markers`, copie exacte figée au démarrage.
Le range conserve toutes les notes entières 0–10 et leurs sauvegardes. Seuls les niveaux avec un
repère explicite portent un point passif, précisément aligné avec le centre du curseur à ce score.
Aucun survol, focus ou clic sur un point ne produit de contenu ou de sélection.
Le descriptif persistant utilise le repère inférieur renseigné le plus proche, sans changer la note ;
le libellé « Repère N / 10 » donne la valeur réelle du repère utilisé (5 pour une note 6).
Sans borne inférieure, aucun texte n’est ajouté. Révision et reprise lisent uniquement le snapshot.
Voir [persistance, migration et interface](appreciation-markers.md).

Le curseur exclut le contour global `input:focus` : aucun rectangle ne s’affiche au clic ou au focus.
Pour une note sélectionnée, `:focus-visible` ajoute un anneau de 2 px, décalé de 2 px autour de la poignée ronde,
pour conserver un focus clavier visible en clair et sombre. Les pistes grises, points de repère,
dimensions et actions restent identiques. Les styles du curseur sont isolés dans `evaluation-rating.css`. Sans note, le focus clavier signale
la piste sans afficher de poignée à une valeur particulière.

La modale possède une hauteur intrinsèque, bornée par le viewport, et une largeur responsive.
Des copies de dimensionnement invisibles et inertes représentent les questions et leurs descriptifs :
la taille dépend des textes réels de la passation et reste stable pendant la navigation, sans hauteur fixe.
Les copies ne sont ni lisibles par les technologies d’assistance ni interactives.
Les erreurs remplacent le statut de sauvegarde dans sa zone dédiée ; elles ne créent pas de zone vide.
`TakingStatusSizing` réserve dans cette zone la taille intrinsèque des messages réels, avec
copies invisibles/inertes : aide, enregistrement refusé et validation refusée. Le texte actif
reste seul annoncé ; bouton de note et pied de dialogue restent stables au refus et au réessai.
Seul le contenu actif défile verticalement lorsque nécessaire ; titre et actions restent visibles.
Questions et descriptifs s’écoulent naturellement sans ascenseur propre. La zone de contenu est
remontée au changement de question. Les contenus ordinaires tiennent sans défilement sur desktop.
Après Précédent/Suivant, le titre de la nouvelle question reçoit le focus ; Tab rejoint le
curseur sans sélectionner de note. Son contour clavier est visible, sans changer la géométrie.
L'ouverture garde le focus initial de la modale ; noter/sauvegarder conserve celui du curseur.
L'[audit MEP-013 et ses preuves UX-07](../quality/mep-013/README.md) qualifie clavier,
souris/tactile, reprise, formats UX et zoom navigateur natif, avec snapshots MEP-044 conservés.

## Preuves de notation explicite — MEP-007

`EvaluationTakingNavigation.test.tsx` reproduit l’attribution implicite avant correction : absence
sémantique, focus/navigation/fermeture sans écriture, choix clavier, gestes annulés, reprise de 0/5,
modification volontaire et complétude. Les tests de modale conservent erreurs, file et révisions.
`evaluation-explicit-rating.spec.ts` vérifie avec Django réel les choix souris/tactiles de 5 et 0,
les `null` après navigation et rechargement, la modification et le refus API de finalisation incomplète.
Le contrat `number | null`, les modèles, migrations, permissions, snapshots et OpenAPI ne changent pas.
Revue effectuée : README, règles agents, charte, DoD, stratégie, architecture et contrat backend/API ;
seules les descriptions de passation/repères, leurs preuves et le suivi de MEP-007 sont affectés.

## Clarification des notes — MEP-044

L’[audit et ses preuves UX-07](../quality/mep-044/README.md) distinguent échelle, note sélectionnée,
absence et repère inférieur. Les tests existants de notation explicite, sauvegarde, navigation,
consultation et versionnement restent la référence ; les seuls ajouts vérifient l’échelle visible et
accessible, la valeur réelle du repère, les contrastes et les captures vierge/0/5/10/reprise.
Les modèles, API, snapshots, calculs et mécanismes de sélection/persistance sont inchangés.

## Transitions visuelles

Les [transitions partagées](../quality/ux-transitions/README.md) raccordent les rubriques et
questions par un fondu croisé de 320 ms, avec copie sortante purement visuelle et inerte.
Les questions seules glissent de 20 px selon le sens de navigation ; le shell, les métadonnées
et les actions restent fixes. Les dialogues s’ouvrent en 240 ms et se ferment en 220 ms,
avec fond progressif ; fermeture native, focus et protections sont conservés.
Le nouveau contenu reste utilisable immédiatement. La préférence
`prefers-reduced-motion: reduce` rend ces changements immédiats.
