# MEP-049 — Protection de l'historique navigateur

Élargissement du 2026-11-02 après la [qualification initiale](results.md).
La première publication a été arrêtée avant push ; le commit de qualification `d220680`
n'a donc jamais été présenté comme une livraison complète sur main.

## Défaut reproduit et correction

Coach fictif Taking E2E, 390×844, tactile Chromium, clair/Vert, zoom 100 % :
Tableau de bord → Évaluations → ouvrir la passation → choisir 5 → refus de sauvegarde 400 → Retour.
Avant correction, l'URL devient `/dashboard`, la modale se démonte et la note refusée est perdue.
L'assertion attendait `/evaluations` et a échoué sur `/dashboard` : vrai échec de conservation.
La preuve initiale `MEP-049-history-before.log` est conservée hors worktree.

`useProductNavigation` reprend la responsabilité de l'historique auparavant intégrée à App.
Chaque entrée du shell conserve son index, y compris après rechargement ; les autres métadonnées restent présentes.
Le dialogue de passation expose exactement sa protection existante `saving || unsaved` dans
`data-navigation-protected`. Une traversée Retour/Avance est inversée sans changement de page React,
donc sans démontage du dialogue ni perte de sa note. Les navigations applicatives sont également refusées.
Une entrée historique non indexée est restaurée à l'URL courante ; ce repli peut remplacer sa branche Avance.
Le cas normal indexé conserve Retour et Avance. Après sauvegarde, aucune protection supplémentaire ne subsiste.

Le rechargement, la fermeture ou une sortie du document protégé demandent la confirmation native
`beforeunload`. Annuler conserve la saisie ; quitter explicitement peut la perdre après confirmation.
Les navigateurs mobiles peuvent ne pas émettre cet événement lors d'une fermeture forcée du système :
aucune garantie de récupération après arrêt du processus n'est ajoutée, et aucun stockage local des notes.
Les politiques d'annulation des autres formulaires ne changent pas. Aucun composant ni preuve MEP-048 modifié.

## Non-régression exécutée

`mobile-history.spec.ts` étend l'assertion initialement refusée aux cas suivants :

| État / action | Attendu et observé | Verdict local |
| --- | --- | --- |
| Sauvegarde retenue, Retour puis Avance | URL restaurée, même modale visible ; aucune perte de note | Passé |
| Réponse refusée 400, Retour | Route `/evaluations`, modale et note 5 conservées | Passé |
| Rechargement, annuler le dialogue natif | Confirmation `beforeunload`, note 5 et dialogue conservés | Passé |
| Réessai réel 204, fermer, Retour puis Avance | Tableau de bord puis Évaluations accessibles ; reprise avec note 5 persistée | Passé |

La campagne ciblée passe **1/1**, 18 secondes, dont 9 secondes de scénario.
Le rechargement annulé n'émet aucun nouvel événement load : son attente Playwright est bornée à 2 secondes,
avec refus des erreurs autres que l'annulation ou le délai attendu ; la confirmation et la saisie sont vérifiées.
Capture `history-protected.png` et vidéo conservées. Le test initial avant correction échoue sur la même
attente de route ; la version finale ajoute l'attente en cours, Avance, reload et reprise après sauvegarde.

React : **4 fichiers / 30 tests passent**, sélection `useProductNavigation.test.ts App.test.tsx EvaluationTakingDialog.test.tsx`.
Le hook couvre traversées ±1, navigation protégée/autorisée, entrée non indexée, position après remontage,
remplacement d'URL, métadonnées conservées, confirmation de sortie et suppression des listeners.
Le plan obligatoire du lot complet passe : documentation/200 lignes, lint, formatage, typecheck,
**23 fichiers / 127 tests React**, **121 E2E applicatifs** (18,7 minutes) et **10 E2E démo** (39,8 secondes).
Le build frontend final passe, avec le seul avertissement existant de chunk >500 kB.
Les seuils globaux de coverage ne sont pas revendiqués par la sélection React partielle.

## Archive du correctif final

`MEP-049-correctif-20261102.zip`, conservée dans le dossier temporaire utilisateur hors worktree.
SHA-256 : `928327f9e87d477d4bc434d3afe43dae12f6b0171a928ac56619cf6abf1ce6bb`.
Le manifeste contient les empreintes des sources et de chaque artefact, le refus avant correction,
le succès après correction, le rapport qualité complet et le build. Les recaptures du correctif final
passent **9/9** : **33 PNG**, **9 vidéos WebM**, **68 cibles atteintes** dans leurs six variantes.
Elles sont distinctes des images initiales antérieures au correctif et de la capture ciblée d'historique.
La relance visuelle est nécessaire car la campagne démo nettoie le dossier commun des captures applicatives.

## Limites et revue

Le tactile physique, le clavier virtuel d'un téléphone et la recette MESS restent non exécutés.
Les vidéos sont du tactile émulé ; aucun statut canonique n'est clôturé automatiquement.
README annoncé avant correction ; documentation du shell et des dialogues mise à jour ;
contrats API, droits, calculs, modèle de données, snapshots et protections de fermeture existants conservés.
Backend/migrations non applicables au changement frontend. Les gates et la CI du SHA exact restent bloquants.
