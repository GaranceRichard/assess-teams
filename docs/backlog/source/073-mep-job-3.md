# FEAT-044 — UI/UX

Feature de [EPIC-011 — Préparation de la mise en production MESS](07-pre-mep.md), job 3.

- **Intention / valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.
- **Acteurs :** Coach, Admin, Viewer dans son périmètre et responsable produit.
- **Description :** points pré-MEP à vérifier puis compléments avérés du socle livré ; acquis référencés sans réouverture.
- **Qualification initiale :** réutiliser les preuves existantes, vérifier les constats et traiter uniquement les écarts confirmés ; aucun intitulé d’audit ne prouve à lui seul une anomalie.
- **Priorité :** P1 selon la nomenclature existante (après le premier parcours) ; vague obligatoire avant GO.
- **Dépendances de lancement :** FEAT-043 achevée, avec tous les travaux du job 2 satisfaits.
- **Critères de Feature :** critères de tous ses PBIs satisfaits, refus démontrés selon la DoD existante.
- **Suivi :** statuts et dates exclusivement dans le [registre canonique](../tracking/pbis.md).
- **Parallélisme :** conception/préparation simultanées après la vague précédente ; dépendances de livraison ci-dessous requises avant validation et clôture.

## MEP-013 — Ergonomie de la passation et du curseur de notation

- **Identifiant / Feature parente / job :** MEP-013 / FEAT-044 — UI/UX / 3.1.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux compléter les frictions de passation au-delà de la note explicite traitée en 1.7.
- **Intention / description :** Compléter les frictions de passation au-delà de la note explicite traitée en 1.7.
- **Acquis et frontière :** PASS-001, EVAL-004 et corrections de modale/repères passifs/focus du curseur acquis.
- **Critères d’acceptation :** Question, progression, note choisie, repère descriptif et état de sauvegarde compris ; navigation stable et reprise fiable ; curseur entier 0–10 conservé au clavier/tactile ; repères uniquement définis et version exacte.
- **Vrais cas de refus :** Navigation perdant une note, description inventée, score implicite ou révision non attribuée refusés.
- **Dépendances de livraison / priorité :** PASS-001, EVAL-004, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-014 — Lisibilité et compréhension des résultats

- **Identifiant / Feature parente / job :** MEP-014 / FEAT-044 — UI/UX / 3.2.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux clarifier la lecture des observations et de leurs limites sans ajouter de calcul métier.
- **Intention / description :** Clarifier la lecture des observations et de leurs limites sans ajouter de calcul métier.
- **Acquis et frontière :** RESULT-001/002 et séparation Analyse/Restitution livrés ; dates uniformisées.
- **Critères d’acceptation :** Organisation, équipe, version, date et provenance visibles selon les droits ; absence distincte de zéro ; récence et continuité par lignée expliquées ; vocabulaire compréhensible.
- **Vrais cas de refus :** Absence présentée comme zéro, tendance non calculée ou comparaison de données incompatibles refusées.
- **Dépendances de livraison / priorité :** RESULT-001, RESULT-002, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-015 — Ergonomie du radar et des comparaisons

- **Identifiant / Feature parente / job :** MEP-015 / FEAT-044 — UI/UX / 3.3.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux améliorer sélection, légende et exploration des comparaisons sur le socle livré.
- **Intention / description :** Améliorer sélection, légende et exploration des comparaisons sur le socle livré.
- **Acquis et frontière :** Radar, longitudinal, switch et retrait du menu Historique par critère déjà livrés.
- **Critères d’acceptation :** Équipes/séries identifiables sans dépendre seulement de la couleur ; sélection et filtres conservés ; labels lisibles ; détail accessible et alternative tabulaire cohérente.
- **Vrais cas de refus :** Filtre perdu, série ambiguë, données rognées ou agrégat interorganisation implicite refusés.
- **Dépendances de livraison / priorité :** RESULT-001, RESULT-002, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-016 — Simplification du vocabulaire et des indicateurs de pilotage

- **Identifiant / Feature parente / job :** MEP-016 / FEAT-044 — UI/UX / 3.4.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux clarifier libellés, aides et indicateurs existants pour orienter l’accompagnement collectif.
- **Intention / description :** Clarifier libellés, aides et indicateurs existants pour orienter l’accompagnement collectif.
- **Acquis et frontière :** STEER-001 couvre couverture et échéances sans score ; vision produit déjà explicite.
- **Critères d’acceptation :** Évaluation, résultat, accompagnement et pilotage distingués ; couverture/retard expliqués par leurs faits sources ; langage homogène ; aucun nouvel indicateur de performance individuelle.
- **Vrais cas de refus :** Classement personnel, surveillance individuelle ou score de pilotage sans décision produit refusés.
- **Dépendances de livraison / priorité :** STEER-001, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-017 — Responsive et ergonomie tactile

- **Identifiant / Feature parente / job :** MEP-017 / FEAT-044 — UI/UX / 3.5.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux compléter les parcours sur petits écrans, zoom et interactions tactiles.
- **Intention / description :** Compléter les parcours sur petits écrans, zoom et interactions tactiles.
- **Acquis et frontière :** Shell fixe, pagination, scroll interne et vérifications mobiles ciblées acquis.
- **Critères d’acceptation :** Navigation, modales, curseur, tableaux et graphiques utilisables aux viewports retenus en recette ; cibles tactiles et focus visibles ; aucune action dépendante du survol ; scrolls maîtrisés.
- **Vrais cas de refus :** Action inaccessible, contenu important masqué ou débordement empêchant le parcours refusé.
- **Dépendances de livraison / priorité :** PASS-001, RESULT-001, DASH-001, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-018 — Cohérence des interactions, états vides, erreurs et chargements

- **Identifiant / Feature parente / job :** MEP-018 / FEAT-044 — UI/UX / 3.6.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux harmoniser les états et interactions des parcours existants.
- **Intention / description :** Harmoniser les états et interactions des parcours existants.
- **Acquis et frontière :** Gestion locale d’erreurs, reprises et réponses obsolètes existe déjà.
- **Critères d’acceptation :** Chargement, vide, absence de droits, échec et succès distingués ; actions et confirmation cohérentes ; reprise possible après erreur ; réponses obsolètes ignorées ; feedback accessible.
- **Vrais cas de refus :** Double mutation, perte de saisie, faux succès ou ancienne donnée présentée comme actuelle refusés.
- **Dépendances de livraison / priorité :** AUTH-001, PASS-001, RESULT-001, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.

## MEP-019 — Cohérence visuelle des thèmes, contrastes et typographie

- **Identifiant / Feature parente / job :** MEP-019 / FEAT-044 — UI/UX / 3.7.
- **User story :** en tant que Coach, Admin, Viewer dans son périmètre et responsable produit, je veux compléter les écarts de lisibilité et de cohérence sans refaire la direction artistique.
- **Intention / description :** Compléter les écarts de lisibilité et de cohérence sans refaire la direction artistique.
- **Acquis et frontière :** Thèmes clair/sombre, dix palettes et corrections visuelles récentes acquis.
- **Critères d’acceptation :** Contrastes, focus, hiérarchie typographique et états lisibles dans les deux thèmes et dix palettes ; préférences conservées ; composants homogènes ; zoom supporté.
- **Vrais cas de refus :** Texte/action illisible, information portée seulement par couleur ou préférence perdue refusés.
- **Dépendances de livraison / priorité :** DASH-001, FEAT-043 (vague précédente entièrement achevée) / P1.
- **Valeur :** Rendre les parcours d’évaluation et de restitution compréhensibles et utilisables sans transformer le produit en surveillance individuelle.
