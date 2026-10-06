# Palettes personnelles d’interface

## Audit du main de départ

L’audit de `origin/main` (`e900f3d`) a ciblé le profil, la session, les couleurs et les tests concernés.
Le modèle `identities.User` ne portait aucune préférence de couleur. `GET /api/session/` et la connexion
retournaient déjà le profil authentifié. Le mode jour/nuit était mémorisé dans le navigateur.
Les accents verts étaient codés en dur dans les styles communs, la navigation, le focus et la passation.
Le radar utilisait une liste de séries indépendante, avec formes et pointillés distincts.
Les suites ciblées initiales étaient conformes : 22 tests backend et 25 tests frontend.

Le premier gate complet a révélé une course préexistante dans le chargement de la planification :
la réponse d’un effet initial nettoyé par React StrictMode pouvait effacer une création réussie.
`PlanningLoading.test.tsx` reproduit l’échec avant correction. Le chargement ignore désormais les réponses
et erreurs de cet effet obsolète ; le parcours E2E de versionnement demeure inchangé.

La livraison a été resynchronisée sur `9bbe2ef`, qui ajoute l’historique longitudinal des résultats.
Ses courbes partagent les styles de séries indépendants du radar ; une vérification navigateur couvre
également leur dessin et leur légende lors des quatre changements de palette. Les deux évolutions coexistent.

## Usage

Le menu **Couleurs**, dans l’en-tête près de l’identité connectée, propose quatre pastilles nommées :
**Vert**, **Bleu**, **Rose**, **Rouge**. Les boutons radio se parcourent au clavier ; le choix est indiqué
autrement que par la couleur. La palette s’applique immédiatement, en mode jour comme en mode nuit.
Pendant l’enregistrement, les choix sont désactivés pour sérialiser les écritures. Un succès est annoncé ;
un échec rétablit la préférence précédente et présente un message accessible.

La palette est chargée avant l’affichage de l’espace authentifié et restaurée après rechargement,
reconnexion ou connexion depuis un autre appareil/navigateur. La déconnexion rétablit le vert.
Le choix jour/nuit continue à fonctionner séparément, avec son stockage navigateur existant.

## Stockage et contrat

`identities.User.interface_palette` est un `CharField` non nullable, avec choix fermés
`green | blue | pink | red` et défaut `green`. La migration `0004` initialise aussi les identités existantes
et ajoute une contrainte SQL d’appartenance à cette liste. Aucune nouvelle table ou dépendance.
Cette préférence ne porte ni organisation, ni rôle, ni permission et vaut aussi pour un Superadmin.

La connexion et `GET /api/session/` ajoutent `interface_palette` à la représentation produit.
`PATCH /api/session/` accepte exclusivement le JSON `{"interface_palette": "blue"}` et retourne `200`
avec la représentation complète actualisée. Le champ est obligatoire ; une valeur inconnue, CSS libre,
vide, nulle, de type invalide ou un champ supplémentaire retourne `400` sans mutation.
Une session Django active et son en-tête `X-CSRFToken` sont obligatoires, sinon `403`.
La cible est toujours `request.user` ; aucun identifiant utilisateur cible n’est accepté.
L’écriture limite `update_fields` à cette préférence. Le contrat OpenAPI décrit les trois opérations.

Le backend constitue la source de vérité. La palette n’est pas enregistrée dans `localStorage`.
Le frontend adopte la réponse serveur après sauvegarde ; une réponse tardive après déconnexion ne modifie
pas l’interface du compte suivant. Des sessions déjà ouvertes ailleurs actualisent leur palette à la
prochaine reprise/reconnexion ; aucun mécanisme de diffusion en temps réel n’est ajouté.

## Tokens et accessibilité

`palette.css` contient uniquement les valeurs des palettes et les règles communes. Les composants
consomment `--primary`, `--primary-hover`, `--on-primary`, `--accent-text`, `--focus`, `--selection`
et les tokens de navigation. Les mêmes valeurs de palette alimentent les pastilles de prévisualisation.
Les surfaces, dimensions et composants existants sont conservés ; les accents de nuit sont plus clairs.
Le focus de navigation sur fond sombre utilise l’accent clair, indépendamment du focus des surfaces.

Les couleurs de danger, d’avertissement et de statut métier restent sémantiques et indépendantes.
`resultRadarConfig.ts` et `resultHistoryConfig.ts` conservent les séries, formes et pointillés,
ainsi que le contraste jour/nuit du radar et des courbes longitudinales.
Les tests navigateur vérifient les contrastes des accents et libellés (≥ 4,5:1) et du focus (≥ 3:1)
dans les huit combinaisons palette/mode ; ils vérifient également les choix clavier et les états désactivés.

## Validation et revue documentaire

Les tests backend couvrent persistance, quatre palettes et quatre types d’identité, isolation, refus,
CSRF, contrainte SQL, migration historique et contrat OpenAPI. Les tests React couvrent restauration,
application immédiate, réponse serveur, échec, déconnexion et réponse tardive.
`palettes.spec.ts` vérifie le backend réel, rechargement, reconnexion, second compte, nouveau contexte
navigateur, contrastes, clavier et erreur d’enregistrement. `results.spec.ts` vérifie que changer de palette
ne modifie ni le dessin du radar ni les couleurs de sa légende ; `results-longitudinal.spec.ts` protège
de la même façon les courbes historiques.

README, contrat API, fondamentaux et stratégie de tests sont adaptés. Les règles des agents, la charte
qualité et la Definition of Done ont été revues : leurs exigences demeurent applicables sans modification.
