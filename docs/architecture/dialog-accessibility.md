# Accessibilité des dialogues — Job 1.5 / MEP-005

## Périmètre et comportement

Les douze dialogues partagent le cycle modal natif `showModal()` / `close()` : utilisateurs,
confirmation de désactivation, nom de modèle/question, suppression de modèle/question,
validation/archivage, suppression/renommage/membres d’organisation, équipe/suppression,
édition de planification et passation/consultation/révision. La démo réutilise les mêmes composants.
Les styles et parcours métier existants sont conservés ; le curseur de notation reste hors périmètre.

`Modal` enveloppe les dialogues administratifs sans remplacer leur présentation.
`useModalFocus` est aussi utilisé directement par le dialogue natif de passation.
Le navigateur rend l’arrière-plan inerte pour la souris, le clavier et les technologies d’assistance.
Le parcours Tab/Maj+Tab reboucle explicitement dans le dialogue, sans atteindre le navigateur.

| Dialogue | Focus initial | Fermeture sur le fond |
| --- | --- | --- |
| Formulaires de nom, utilisateur, équipe, organisation et planning | Premier champ disponible | Seulement utilisateur, selon le comportement existant |
| Confirmations de suppression, désactivation, validation/archivage | Annuler | Seulement désactivation, selon le comportement existant |
| Membres d’organisation | Première case modifiable, sinon Annuler | Aucune |
| Passation, consultation et révision | Titre, sans déplacer le curseur | Aucune |

Le titre visible fournit le nom accessible. Les confirmations associent leur court message
à `aria-describedby` ; les formulaires conservent les libellés de leurs champs et la passation
sa structure par question. Les erreurs API sont rendues avec `role="alert"` dans le dialogue actif,
y compris pour les formulaires partagés par la démo, afin de rester accessibles dans le fond inerte.

## Fermeture et conservation des saisies

Échap appelle la même fermeture autorisée que le bouton Annuler/Fermer. Le comportement natif
est toujours intercepté pour respecter les gardes métier : aucun démontage pendant un enregistrement
ou une suppression, aucun abandon de note en cours de sauvegarde ou après une sauvegarde refusée.
Les protections existantes de passation restent actives jusqu’à la réussite d’une nouvelle tentative.
Une annulation explicite de révision reste autorisée selon le parcours existant.
Les formulaires ne réinitialisent pas les valeurs lors d’une navigation clavier, d’une confirmation
de suppression de planning ou d’un refus API. Un refus permet une correction et une nouvelle tentative.

Après fermeture, le focus revient au déclencheur encore disponible. Une ouverture asynchrone
capture ce déclencheur avant sa désactivation pendant le chargement. Si une action le supprime,
le titre de la collection reçoit le focus ; à défaut, une commande de la région courante le reçoit.
Le `tabindex` temporaire du titre est restauré lorsqu’il perd le focus. Une modale suivante conserve
la priorité du focus, y compris sous React StrictMode. La disparition ou la désactivation d’une
commande active dans une modale replace le focus sur un élément disponible de cette même modale.
Le clic autorisé sur le fond empêche le focus souris par défaut de remplacer ce retour.

## Preuves et revue documentaire

`DialogAccessibility.test.tsx` inventorie les onze dialogues administratifs et la consultation :
ouverture native, nom/description, placement initial, Tab/Maj+Tab et annulation autorisée.
`DialogPending.test.tsx` couvre fermeture refusée pendant l’écriture, messages d’erreur internes,
saisies conservées et suppression du planning indisponible pendant sa mise à jour.
`ModalLifecycle.test.tsx` protège StrictMode, ouvertures répétées, remplacement de modale,
déclencheur supprimé, contenu dynamique, absence de commandes actives et contrôles masqués.
`TakingFocus.test.tsx` couvre le déclencheur capturé avant désactivation asynchrone ; les tests
existants de passation conservent leurs preuves de sauvegarde, reprise, finalisation et révision.

Les nouveaux parcours `dialog-accessibility.spec.ts` et `dialog-taking-accessibility.spec.ts`
utilisent Chromium et Django réels : clavier, inertie native, noms/descriptions accessibles,
clics de fermeture, retour au déclencheur ou au titre après suppression, confirmation de planning,
refus API sans perte de saisie et fermeture de passation bloquée puis autorisée après reprise.
Ils complètent les parcours CRUD, versionnement, passation et démo du gate E2E existant.
Les assertions automatisées vérifient la sémantique accessible ; elles ne remplacent pas
une évaluation manuelle complète avec tous les lecteurs d’écran.

Le test d’inventaire de désactivation échoue avec le composant antérieur à ce chantier,
qui expose une section ARIA sans modalité native, et passe avec le dialogue harmonisé.
README, fondamentaux, stratégie et inventaire des tests référencent ce contrat.
Les règles agents, charte et DoD restent applicables ; le backend/API/OpenAPI et les migrations
ne changent pas. `quality:full`, pre-push et CI conservent tous leurs contrôles bloquants.

Référence : [modèle de dialogue modal W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## Transitions visuelles

Les [transitions partagées](../quality/ux-transitions/README.md) ajoutent une entrée CSS courte
sans attente ni changement de géométrie. Les questions seules glissent selon la navigation ;
le shell et les dialogues conservent leur focus et leurs protections. La préférence
`prefers-reduced-motion: reduce` rend ces changements immédiats.
