# Shell et collections produit

## Géométrie partagée

Au-dessus de 760 px, `ProductShell` ajoute `product-active` au document et le retire à son démontage.
Le document et la racine ne scrollent pas. Le shell en grid occupe exactement `100dvh` ; la sidebar
reste dans sa colonne et le workspace flex sépare un header non rétractable du viewport de page.
`min-height: 0`, `min-width: 0` et les pistes `minmax(0, …)` annulent les minima intrinsèques.

La navigation de `ProductSidebar` occupe l’espace flex restant entre marque et bouton non rétractables.
Le bouton reste à 1,5 rem du bord inférieur du viewport desktop, quel que soit le rôle ou l’état.
Seule la navigation scrolle verticalement en faible hauteur ; ses liens ont un minimum de largeur nul.
En mode réduit, le padding laisse la place aux icônes et au logo. Les infobulles de `SidebarLink`
sont créées uniquement au survol/focus dans un portail fixe hors du scroll, puis retirées au départ,
à la navigation, au scroll ou au redimensionnement : aucun pseudo-élément invisible ne déborde.

`product-layout.css` définit `product-page`, `page-content` et `CollectionFrame` ;
`product-panels.css` adapte les panneaux fonctionnels, sans hauteur spécifique à une route.
La zone compacte de titre/actions/filtres précède le contenu flex occupant l’espace restant.
`CollectionFrame` contient une région scrollable accessible au clavier, un header de tableau sticky
et une pagination séparée du scroll. Loading/empty/error gardent cette enveloppe.
Les tableaux larges scrollent horizontalement dans la région fonctionnelle.
Les formulaires, questions, profil, sélection Results et observations scrollent dans leurs panneaux.
Une page trop compacte (zoom/hauteur réduite) conserve un repli de scroll interne accessible,
avec un minimum commun de huit rem pour garder une région interactive visible, sans hauteur par route.
Les modales sont bornées par `100dvh - 2rem` et gardent leurs actions accessibles par scroll interne.

Sous 761 px, le document retrouve son flux naturel ; panneaux empilés, menu avec retour à la ligne sans scroll horizontal,
contenus sans découpe et tableaux à scroll interne. La pagination reste sticky dans sa collection.
Le dark mode conserve son rendu ; le [mode clair](interface-palettes.md) associe bandeaux clairs perceptibles,
fond central subtilement teinté par la palette et cartes blanches, sans modifier les régions de scroll.

## Collections et contrats

Les collections Utilisateurs, Équipes, Modèles, Planning et Évaluations demandent `page` au serveur.
`CollectionPagination` retourne 20 éléments au maximum après application du scope et des filtres ORM.
`search` filtre identifiant/mail des Utilisateurs ; `organization_id` filtre Modèles et Planning avant pagination. Le tri est stable avec tie-break PK.
Le contrat est `{count, next, previous, results}` ; sans `page`, les consommateurs de sélecteurs
existants conservent la réponse tableau. OpenAPI décrit explicitement les deux variantes.
Page invalide : 400 ; page absente du jeu : 404 ; droits et mutations restent inchangés.
Les liens next/previous conservent les query params. Aucun gros dataset n’est découpé dans ces pages React.

Endpoints concernés : `/api/admin/users/`, `/api/admin/organizations/{id}/teams/`,
`/api/admin/evaluations/`, `/api/admin/planning/`, `/api/evaluations/`.
`/api/steering/?page=N` garde sa projection et son résumé organisationnel complets, puis borne les
lignes transmises par le serveur et ajoute `pagination: {count, page, pages}`. Le calcul existant
reste global à l’organisation pour préserver le tri métier et les indicateurs, sans nouveau score.
Journal et Logs réutilisent leur pagination backend existante de 20 éléments.

Les petites collections ne montrent pas de pagination. Le Dashboard conserve son contrat métier
limité aux dix événements récents, dans une zone bornée. Results conserve les jeux complets nécessaires
aux comparaisons et courbes ; les sélections et observations sont consultables par scroll interne.
Les sélecteurs Analyse (Radar / Dans le temps) et Restitution (Graphique / Données détaillées) sont indépendants
et partagent une sélection unique. Radar et longitudinal utilisent la hauteur
disponible du panneau avec `min-height: 0` et un canvas responsive ; le tableau détaillé est dans
une région clavier à scroll interne, avec dates de complétion et en-tête sticky.
Le longitudinal réserve critère, axes et légende ; sa restitution détaillée remplace le canvas par
le tableau historique, avec une seule région de scroll. Les deux builds partagent ces composants.
Les sélecteurs des formulaires gardent leurs collections complètes pour ne rendre aucun choix inaccessible.

`usePagedCollection` conserve page/scope, remet la page à 1 lors d’un changement de filtre, ignore les
réponses obsolètes, protège les mutations locales, recharge les grandes collections après mutation et recule après suppression de la dernière page.
La pagination montre précédent/suivant, page/pages et total, et refuse de naviguer pendant un chargement.

## Preuves et revue documentaire

Tests API/ORM : pages disjointes, LIMIT SQL, filtres avant pagination, permissions, refus de page,
compatibilité des consommateurs et résumé Pilotage invariant. Contrats OpenAPI des deux variantes.
Tests React : navigation, bornes, petites collections, requêtes réelles, filtre/scope, échec réseau,
retry, réponse obsolète et mutation pendant un chargement. Playwright protège le document, header,
sidebar, scroll interne, pagination visible et géométrie stable sur plusieurs viewports et sur mobile.
`sidebar-layout.spec.ts` mesure les deux états à 900/480 px, avec menus Admin et Viewer : marge basse,
absence de débordement, centrage, orientation, clavier et conservation du repli à la navigation.
La démo applique les mêmes assertions au build Pages. Les captures sont inspectées pour le mode clair et le mode sombre.

README, fondamentaux, API et stratégie de tests sont mis à jour. Agent-rules, charte qualité et DoD
restent applicables sans changement. `quality:full`, pre-push et CI restent bloquants.
