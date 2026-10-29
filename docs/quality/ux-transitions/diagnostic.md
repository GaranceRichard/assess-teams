# Diagnostic avant correction — 2026-10-27

Base : `3e6fb70` (inclut le chantier `37ea6d7`).
Branche `fix/ux-transitions-continuity`, worktree isolé hors du checkout principal.

- `ProductShell` indexe tout le viewport par `path` : le commit React retire immédiatement
  l'ancien contenu. Le nouveau part à opacité zéro ; aucun chevauchement ni sortie.
- `EvaluationTakingDialog` indexe même les métadonnées par `question_id` : elles sont remontées
  avec la question. `useQuestionTransition` ne conserve que direction et focus, jamais l'ancien rendu.
- Le mouvement de question existe uniquement après changement effectif d'identifiant.
  Sauvegarde et erreurs ne le relancent pas ; le remontage le relance à chaque navigation rapide.
- 6 px / 180 ms pour pages et modales, 12 px / 230 ms pour questions : entrées rapides et seules.
  Augmenter leur durée ne rétablit pas le raccord manquant entre deux contenus.
- `useModalFocus` appelle immédiatement `close()` au démontage. Aucune sortie possible ;
  le fond passe instantanément à son assombrissement final à l'ouverture.
- Les styles ne sont actifs que sous `prefers-reduced-motion: no-preference`.
  La recette doit forcer cette préférence puis lire sa valeur effective dans Chromium ;
  la préférence du poste ne doit pas être déduite du CSS ou des anciens résultats.
- Les pages chargent leurs données après montage : une entrée peut se terminer sur un état
  de chargement. La recette doit regarder les vrais écrans et les réponses retardées.
- Les preuves précédentes ne suivent que le nouveau DOM : événement d'entrée, durée,
  translation et opacité. Elles n'exigent ni ancien contenu visible, ni fermeture animée.

La correction doit préserver un rendu sortant purement visuel, inerte et sans identifiants
accessibles dupliqués, pendant que React rend et rend interactif le nouveau contenu.
Le dimensionnement intrinsèque MEP-013/044 reste responsable de la hauteur de passation.
Une fermeture refusée ne doit jamais déclencher de sortie ; le cycle natif et le focus restent protégés.

## Défaut complémentaire reproduit pendant la recette

Le test de géométrie existant, étendu à l’action « Enregistrer la note », échoue
avant sa stabilisation : sa coordonnée Y passe de 445,406 à 496,563 px lorsque
le repère apparaît (écart 51,156 px). Le cadre et le pied étaient déjà stables.
Le contenu utilise désormais la hauteur intrinsèque réservée pour maintenir cette action
en bas ; en faible hauteur elle reste ancrée dans le scroll de corps existant.
Aucune hauteur de dialogue ou nouvelle région de scroll n’est imposée.

Le rejeu des effets de StrictMode peut arriver après une frame : un simple drapeau
« déjà peint » n’empêche pas une fausse sortie. La copie n’est donc présentée qu’après
vérification que le dialogue original a réellement disparu ou été fermé, et non rouvert.
