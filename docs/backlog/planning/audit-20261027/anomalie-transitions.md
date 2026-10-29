# Anomalie UX connue — transitions refusées visuellement

Signalement utilisateur reçu dans la demande de consolidation du 2026-10-28.
**Hors des 96 PBI : aucun nouvel identifiant canonique, parent ou statut créé.**
[Trajectoire](trajectoire.md) · [C21](contradictions.md) · [Frontières](structure.md).
Base historique : `3e6fb70094e13e3566505fd2ccc5a8ff11ed5af6` ; premier contrôle du 2026-10-29 encore
identique. **Contrôle final après publication concurrente : `origin/main` à
`eede63120a2b6fdc949d9e30de63d562a20f1002`, correctif technique intégré ; acceptation visuelle non acquise.**
La formulation « aucune refonte UX générale justifiée » demeure ; elle n’efface pas cette correction localisée.

## Signalement et comportement à la base auditée

L’utilisateur refuse le résultat visuel livré : animation trop peu perceptible, disparition immédiate de
l’ancien contenu et continuité insuffisante entre pages, questions et modales. Ce refus est une preuve
d’acceptation négative déclarée par l’utilisateur, pas une hypothèse tirée du titre d’un PBI.

| Surface | Chemin exécuté à la base auditée | Constat historique reproductible par lecture |
| --- | --- | --- |
| Pages | [ProductShell](../../../../frontend/src/ProductShell.tsx), viewport `key={path}` et branche conditionnelle de route | Au changement de chemin, l’ancien viewport est démonté et remplacé ; aucune surface sortante n’est maintenue. |
| Questions | [EvaluationTakingDialog](../../../../frontend/src/EvaluationTakingDialog.tsx), contenu indexé par question ; [useQuestionTransition](../../../../frontend/src/useQuestionTransition.ts) | La question précédente est remplacée ; le hook fixe direction et focus de la nouvelle, sans orchestration de sortie. |
| Modales | [Modal](../../../../frontend/src/Modal.tsx), [useModalFocus](../../../../frontend/src/useModalFocus.ts) | `showModal` à l’ouverture ; `close` au nettoyage et restauration du focus. Pas de phase de fermeture animée. |
| Mouvement | [transitions.css](../../../../frontend/src/transitions.css) | Commentaire explicite « no exit phase » ; entrées verticales de 6 px/180 ms, horizontales de 12 px/230 ms, fondu depuis 0. Ces chiffres décrivent l’existant, pas la cible à conserver. |

La présence de keyframes/mesures ne démontre ni mouvement suffisamment perceptible à vitesse réelle
ni raccord visuel accepté. Les [rapports techniques](../../../../docs/quality/ux-transitions/README.md)
et [238 mesures](../../../../docs/quality/ux-transitions/mesures.md) restent des preuves historiques
de mouvement et stabilité, distinctes du refus esthétique communiqué ici.
Le chantier livré est identifiable par `37ea6d7` et ses correctifs `6c3a608`/`483c962`, ancêtres du main audité.
Aucun de ses anciens critères ou résultats de tests n’est réécrit dans ce dossier.

## Correctif publié depuis la base

Le commit `c7efd22` et ses suites `618e9a8`/`0544f1e`/`eede631` sont désormais dans main.
La [documentation du correctif](../../../quality/ux-transitions/README.md) et sa
[recette technique/visuelle](../../../quality/ux-transitions/recette-correctif.md) remplacent la description
d’entrée seule pour le produit courant, sans invalider le diagnostic historique ci-dessus.

- Pages/questions : [TransitionSurface](../../../../frontend/src/TransitionSurface.tsx) capture avant mutation
  React une copie visuelle sortante inerte, puis raccord entrant/sortant ; 320 ms et déplacements 12/20 px
  décrivent le correctif livré, sans devenir de nouveaux seuils d’acceptation produit.
- Dialogues : [dialogTransition](../../../../frontend/src/dialogTransition.ts) retient une copie de peinture
  après fermeture autorisée ; ouverture/fermeture progressives, sans seconde interface active.
- Tests et [vidéo à vitesse réelle](../../../quality/ux-transitions/continuite-desktop.webm), avec frames
  début/milieu/fin, sont disponibles dans le chantier livré. Cette finalisation les référence sans rejouer
  les suites ni déclarer une nouvelle recette navigateur ou une approbation utilisateur.

**Reste à faire : A+D**, comparer le candidat et recueillir un verdict visuel attribué par produit/UX
avec l’utilisateur. Ne plus prescrire la construction d’un raccord déjà publié. Si le rendu reste refusé,
nommer le défaut résiduel et préparer seulement sa correction minimale. CI et mesures ne valent pas ce verdict.

## Preuve et protocole de reproduction

**Acquis dans cette consolidation :** signalement utilisateur explicite + chemin de remplacement immédiat
vérifié dans le code ; archive vidéo technique déjà versionnée
[zoom-200.webm](../../../../docs/quality/ux-transitions/zoom-200.webm).
**Non effectué par cet audit :** nouvelle exécution navigateur ou nouveau film ; la vidéo du correctif
est une preuve fournie par le chantier UX, distincte de l’acceptation visuelle utilisateur attendue.
La vidéo existante documente la livraison technique, pas une acceptation visuelle par l’utilisateur.

Reproduction courte à joindre au futur dossier de correction, avec SHA/navigateur/format/thème consignés :

1. Préférence `no-preference`, Admin autorisé : Dashboard → Utilisateurs → Dashboard à vitesse normale.
   Relever quand le texte/les cartes sortants disparaissent par rapport à l’entrée des nouveaux.
2. Coach sur passation à deux questions, première note déjà persistée : Suivant puis Précédent.
   Relever remplacement du texte, direction et continuité ; ne pas confondre délai de sauvegarde et animation.
3. Ouvrir puis fermer un dialogue autorisé, une fois par bouton puis par Échap ; noter l’entrée et la
   disparition à la fermeture. Refaire sans fermeture autorisée lorsque la note n’est pas sauvegardée.
4. Filmer les séquences sans ralentissement ; identifier le raccord abrupt dans les images si besoin,
   mais demander le jugement visuel sur la vitesse réelle. Comparer l’ancien et le candidat dans le même état.
5. Refaire desktop/mobile et deux thèmes des parcours concernés ; vérifier aussi `reduce` sans animation.

Le défaut initial était étayé statiquement ; le correctif publié doit maintenant être confronté au même
protocole et aux preuves disponibles. Toute capture encore nécessaire est explicitement attribuée au
candidat observé, sans présenter comme exécutée une campagne de cet audit.

## Attendu et critères proposés pour décision visuelle

- L’utilisateur perçoit le changement et sa direction à vitesse réelle, sans devoir examiner des frames
  pour constater que l’animation existe. La durée/amplitude retenue reste un choix UX à valider,
  sans nouveau seuil arbitraire en millisecondes ou pixels.
- L’ancien contenu ne s’efface pas instantanément sans raccord : une progression visuelle identifiable
  relie ancien et nouveau. Séquence/chevauchement éventuel à montrer et approuver ; aucune architecture
  de double DOM, capture ou bibliothèque n’est prescrite ici.
- Ouverture/fermeture des modales et aller/retour des questions doivent présenter le raccord retenu,
  sans flash vide ni saut brutal de géométrie ; le shell et les actions stables restent à leur place.
- Un contenu sortant conservé à l’image ne reste pas une seconde interface active : pas de double focus,
  double mutation ni données protégées conservées à l’écran après perte d’autorisation.
- Focus, contrôles de rôle, sauvegarde serveur, Échap protégé, notes explicites et snapshots demeurent ;
  la réduction des animations conserve son comportement immédiat accessible.

**Vrais refus :** tests de mouvement verts mais refus visuel utilisateur ; ancien contenu disparu sans
raccord ; mouvement visible seulement au ralenti ; action bloquée/perdue, focus double, saisie perdue ou
animation imposée sous reduce. Chacun interdit de déclarer l’anomalie visuellement acceptée.

## Responsabilité proposée et impact

- **Propriétaire de décision proposé :** responsable produit/UX avec l’utilisateur ayant refusé le rendu ;
  confirmer les surfaces, démonstration et verdict attendus sur le correctif publié.
- **Propriétaire technique proposé :** frontend shell/transitions/dialogues ; liens aux consommateurs
  notation et Results pour non-régression. Aucun rattachement automatique à MEP-017/018/049/050/051.
- **Nature actuelle :** A acceptation visuelle à établir + D portage/périmètre de candidat ; B seulement
  pour un défaut résiduel reproduit. Le correctif technique publié n’est pas un développement restant.
- **Passage :** candidat/preuves identifiés → comparaison à vitesse réelle selon attendu → verdict
  visuel attribué ; si refus, défaut résiduel et portage de la correction minimale explicités séparément.
- **Trajectoire :** faire apparaître ce travail à côté des qualifications UX. Il ne bloque pas D01–D09,
  l’inventaire ou les guides ; son inclusion requise au candidat/GO est une décision produit/MESS explicite.
  S’il est requis au candidat, sa correction et son acceptation précèdent la convergence et les PV UX affectés.
- Aucun PBI réalisé n’est rouvert ni reclassé par ce signalement ; aucune clôture existante ne vaut
  acceptation de cette esthétique. Les agrégats 96 et 47/20/22/2/5 restent inchangés.
