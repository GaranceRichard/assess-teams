# Décider le prochain travail UX — justification de l’ordre

[Trajectoire](trajectoire.md) · [Natures A–F](actions.md) · [Anomalie transitions](anomalie-transitions.md).
Ordre de préparation proposé, sans modifier les dépendances canoniques ni l’ordre historique archivé.
Une sélection nécessite delta, entrées, risque et sortie vérifiés ; la position d’une ligne ne suffit pas.

## MEP-047 et MEP-015 : maintien conditionnel de 047 avant 015

L’ordre antérieur 015→047 était un choix de cohérence visuelle, pas un arc technique.
047 dépend de RESULT-001/002 ; 015 de RESULT-001. Ces acquis sont réalisés. Aucun des deux
ne requiert le développement de l’autre, et les trois PBI déjà couverts ne sont pas des chantiers applicatifs.

| Dimension | MEP-047 : sélection/compatibilité | MEP-015 : radar |
| --- | --- | --- |
| Nature restante | A : quatre critères et trois familles de refus à tracer ; aucun delta applicatif démontré. | A : compléter la lecture des labels/légende/alternative et les cellules de preuve visuelle manquantes ; correction seulement sur échec. |
| Preuves disponibles | API scopes/lignée/snapshots et tests React/E2E retour/archives ; changement récent b112c72. [Sortie 047](sortie-mep-047.md). | Géométrie 12 labels longs, 0/1/N séries, styles différenciés et tableau ; les assertions ne valent pas appréciation visuelle. |
| Volume réellement restant | Rapprochement borné des quatre critères sur le SHA retenu ; l’existence d’un grand nombre de tests ne prouve pas leur réutilisation exacte. | Matrice de formats/états UX-09, texte complet accessible et identification sans couleur ; lecture humaine plus large que la seule navigation. |
| Risque / valeur | Éviter filtres perdus, mauvaise version et données étrangères ; fixer le contexte exact du jeu de preuve partagé. | Éviter labels coupés, séries ambiguës et valeurs inaccessibles ; ne pas confondre le tracé avec les calculs. |
| Justification du premier passage | Courte revue des preuves déjà présentes, sans modifier le radar ; elle fournit version/équipes/critère stables au relevé visuel suivant. | Peut avancer en parallèle sur la même référence ; ne pas attendre la clôture officielle 047 pour inspecter un défaut de lisibilité. |
| Condition de passage | Critères/refus tracés et verdict des quatre issues de sortie ; si manque visuel local, transmettre à 015 sans faux succès 047. | Matrice des cellules nécessaires observée ; anomalies localisées et responsabilités arrêtées avant tout patch. |

**Conclusion :** conserver 047→015 comme recommandation de revue de preuves, pas comme priorité
absolue de développement ou dépendance. Un défaut de lisibilité reproduit qui empêche de lire les
valeurs passe devant ; faute de tel constat, ne pas replanifier un radar neuf avant de constater ce qui existe.
Un défaut de scope/perte de sélection découvert en 047 devient une correction localisée prioritaire.
La qualification doit s’arrêter sur un verdict, jamais repartir en boucle parce que le titre dit « améliorer ».

## MEP-016 et MEP-048 : dissocier inventaire lexical et lecture des faits

- Le choix antérieur 016→048 reste pertinent pour **recueillir les occurrences** à vérifier ensemble.
  Les deux dépendent seulement de DASH-001/STEER-001, déjà livrés ; aucun arc 016→048 n’est créé.
- 048 possède déjà définitions des cinq cartes, date de référence, absence et liens Results ; son
  dossier de sortie peut être traité immédiatement, en parallèle de l’inventaire lexical 016.
- 016 ne devient correction que si un terme précis est trompeur. Il peut se conclure sans changement
  si les trois critères de sa fiche sont satisfaits ; nouvelle signification métier → C09.
- Un terme qui empêche d’interpréter un indicateur doit être résolu dans le verdict 048 concerné ;
  un renommage futur sans rapport ne maintient pas 048 ouvert. [Sortie 048](sortie-mep-048.md).
- Valeur/risque : éviter faux indicateur de performance individuelle ou nouveau droit suggéré, tout en
  conservant les calculs. Sortie : terme→fait→rôle + tableau attendu/observé et décision bornée sur 048.

## F08 — cinq propriétaires, qualification par risque

Le rang historique 017→049→018→050→051 n’impose pas de prérequis technique entre ces PBI.
Les sources visent des aspects différents ; un même défaut n’est corrigé qu’une fois puis référencé.

| PBI | Objet précis / preuves déjà disponibles | Risque et action de sélection | Sortie / suite |
| --- | --- | --- | --- |
| MEP-017 | Régions/tableaux/modales ; product-shell, taking/results-layout, typographie et zoom existants | Action masquée/débordement : mesurer d’abord viewport/scroll/zoom, sans redesign. | Cellule avec dimensions et action atteignable ou défaut localisé ; consommateur 069/070. |
| MEP-049 | Menu/focus/tactile ; sidebar et dialogues testés, tactile notation déjà prouvé | Action au survol seul, cible recouverte, focus perdu : vidéo du menu/formulaire hors notation. | Parcours tactile/clavier avec mêmes droits/saisie ; défaut géométrique renvoyé à 017. |
| MEP-018 | Chargement/obsolescence ; usePagedCollection/ResultsSelectionRace/PlanningLoading | Ancienne organisation affichée ou double effet : retarder/inverser les réponses, risque de confidentialité/intégrité prioritaire. | Mauvaise réponse ignorée et commande occupée sûre ; preuve d’attente, distincte de 050/051. |
| MEP-050 | Vide valide/filtre/refus/erreur ; shell-states/ResultsPageErrors/SteeringPage | Vide masquant erreur ou zéro inventé : comparer les quatre réponses et leurs actions autorisées. | Messages discriminants et absence sans divulgation ; pas de CTA Viewer ajouté. |
| MEP-051 | Erreur/reprise ; formulaires, palette et file SMTP ; note propriétaire 045 | Saisie perdue/faux succès : formulaire Planification et panne SMTP, avant toute harmonisation cosmétique. | Saisie conservée, erreur annoncée, réessai sans doublon ; 045 consommé sans nouvelle correction de note. |

**Règle opérationnelle :** intégrer d’abord le défaut démontré de confidentialité/perte de saisie ou action
inatteignable. À défaut de défaut connu, une session commune d’états 018/050/051 évite trois recueils
de mêmes réponses ; puis 017/049 partagent formats et vidéos. Ce regroupement mutualise l’observation,
sans fusionner les PBI, ajouter des arcs ou leur attribuer automatiquement les transitions.
L’[anomalie de transitions refusées](anomalie-transitions.md) suit son propre portage à décider et n’est
pas noyée dans cette session ; elle n’autorise pas à déclarer F08 conforme visuellement.

## Porte de sélection commune

Avant chaque lancement : nommer le critère et l’état manquants, l’entrée disponible, le résultat attendu,
le refus et le consommateur. Si ces champs manquent : investigation circonscrite ou arbitrage.
Si le comportement et la preuve sont déjà suffisants : proposer la clôture après DoD, sans développement.
Si le test ou le visuel refuse le résultat : préparer la correction minimale et son cas de non-régression.
Une exigence nouvelle est isolée pour décision ; elle ne prolonge pas artificiellement un PBI couvert.
