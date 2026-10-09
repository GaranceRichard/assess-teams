# Repères d’appréciation par question

## Règles métier

Un repère associe un texte libre non vide à un score entier de 0 à 10, pour une question
d’une version exacte. Aucun niveau ni repère n’est obligatoire. Un texte peut être affecté
à plusieurs niveaux : chaque niveau possède alors son propre repère, sans interpolation.
Deux repères au même niveau de la même question sont refusés.

Seuls Superadmin et Admin de l’organisation éditent les questions de brouillons.
Le cycle reste `DRAFT → VALIDATED → ARCHIVED` ; les versions validées ou archivées sont
immuables. Une nouvelle version copie exactement les repères, puis peut évoluer indépendamment.
La présence de repères ne change aucune note, borne, finalisation, projection radar ou longitudinale.

## Contrat et persistance

Les routes de questions existantes acceptent et retournent `appreciation_markers`,
une liste ordonnée de `{ "score": 8, "text": "Objectifs partagés" }`.
POST accepte son omission (liste vide). PUT remplace la liste fournie ; omission conserve
les repères, et `[]` les supprime tous. Le nom reste obligatoire dans ces écritures.
Les entiers hors bornes, flottants, booléens, chaînes, doublons, textes vides et structures
invalides produisent `400` sans écriture partielle. Les champs supplémentaires d’un repère sont refusés.
Session et CSRF restent obligatoires : fonction interdite `403`, ID hors organisation `404`.

`Question.appreciation_markers` est un JSONField de liste, cohérent avec ce petit ensemble
borné à onze valeurs. La validation des niveaux et de l’unicité est faite par les serializers
backend, sous les verrous transactionnels organisation/version déjà employés par les questions.
Aucune ressource, route ni dépendance supplémentaire n’est nécessaire.
Les changements de repères utilisent l’activité `QUESTION_UPDATED` existante, sans journaliser le texte.

`EvaluationRunQuestion.appreciation_markers` conserve la copie au démarrage, avec texte,
ordre et lignée. Les réponses GET/démarrage/finalisation/révision lisent uniquement ce snapshot,
jamais la dernière version ni la question source. Reprise, archive et révision préservent
les repères et la provenance de complétion. Une attente non démarrée ne possède pas encore de questions.

La migration `0015` ajoute deux listes vides, sans reconstruire un passé inconnu.
Les questions et snapshots existants restent sans repères. IDs, FK, notes, résultats,
dates et auteurs ne sont ni recalculés ni modifiés.

## Interface et démo

`QuestionAppreciation` ajoute la section repliable à chaque question : consultation,
ajout d’un texte sur plusieurs niveaux libres, modification et suppression en brouillon.
Les niveaux occupés sont indisponibles à l’ajout ; aucune sélection par défaut n’est imposée.

`AppreciationScale` complète le range existant avec onze points discrets régulièrement espacés,
sans chiffres visibles ni second rail. Le point sélectionné est agrandi et cerclé.
Les cibles conservent une hauteur de 44 px et une largeur minimale de 24 px dès 320 px de viewport.
Survol et focus affichent la note réelle et son descriptif au-dessus du niveau.
Le popover natif utilise la top layer au-dessus de la modale, avec position bornée au viewport,
largeur adaptée et hauteur limitée à l’espace disponible. Le survol et le défilement du texte
maintiennent l’infobulle. Scroll/resize repositionnent un repère
au focus, sinon le retirent ; Échap ferme l’infobulle sans fermer la passation.
Les textes longs se lisent aussi dans le bloc persistant après sélection.
Les boutons sont utilisables au clavier et au toucher ; le range conserve ses interactions,
ses sauvegardes ordonnées et annonce l’appréciation de sa valeur accessible.
Pour une note intermédiaire, le descriptif provient de la borne inférieure renseignée la plus proche :
6 reprend le texte de 5 si les repères suivants sont 5 et 7. Cette recherche commune aux infobulles,
au bloc persistant et à la valeur accessible du range ne modifie jamais la note sélectionnée ou enregistrée.
Sans borne inférieure, aucun descriptif n’est ajouté ; l’infobulle affiche uniquement la note.
L’espace descriptif reste réservé, même vide, et les textes longs y défilent au clavier.
En consultation, explorer ne modifie aucune note.
Les tokens sémantiques suivent mode clair/sombre et palette personnelle.

La démo Pages propose des repères fictifs sur Clarté des objectifs et Communication.
Son brouillon v2 permet l’édition locale ; la v1 et les snapshots de passation restent indépendants.
Reset restaure les fixtures ; aucun appel API n’est ajouté au build statique.

## Vérifications et revue documentaire

Les tests backend couvrent créations/remplacements/suppressions, omission, refus atomiques,
scopes, copie de chaque statut, historique commencé/finalisé/révisé, migration et OpenAPI.
React couvre les niveaux libres, conflits, lecture seule, erreurs de sauvegarde,
hover/focus/Échap, borne inférieure, absence de texte inventé et conservation du curseur et des notes.
Playwright couvre édition v1/v2, passation historique, reprise, finalisation, consultation,
infobulles au-dessus des niveaux, bornes du viewport, thèmes/palettes, mobile et démo sans API.

Revue : README, contrats backend/modèles/passation, versionnement, démo, backlog,
index d’architecture, stratégie et inventaire des parcours sont actualisés.
Les règles agents, charte qualité et DoD restent applicables sans changement de politique.
Le chantier ergonomique révise aussi la passation et la stratégie de tests ; modèles, contrats API,
OpenAPI et architecture de données restent inchangés après revue.

## Réconciliation des chantiers

Les branches `feat/question-appreciation-markers` et `feat/question-score-guides` ont été
comparées puis réunies dans un historique de fusion. Le contrat unique retenu est
`appreciation_markers`, avec JSON borné à onze repères sur la question et son snapshot.
La variante relationnelle `QuestionScoreGuide` et le champ `score_guides` ne sont pas publiés :
aucune de ces deux migrations concurrentes n’avait été livrée sur main.
Cette décision évite deux sources de vérité et conserve les validations backend atomiques.
Les garanties complémentaires du second chantier sont reprises : infobulle survolable,
défilement de son texte, fermeture différée annulable et Échap depuis tout contrôle.
`AppreciationTooltip.test` protège ces interactions, y compris le démontage et le changement
rapide de niveau. Les deux suites historiques, de contrat, de versionnement et de migration
ont été comparées ; la suite retenue conserve leurs invariants applicables au contrat unique.
