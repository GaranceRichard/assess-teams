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

`AppreciationScale` complète le range existant avec des points passifs uniquement pour les
repères dont le descriptif est explicitement renseigné. Leur position proportionnelle tient compte
de la largeur du curseur aux deux extrémités. Les valeurs intermédiaires ne portent aucun point.
Aucun effet visuel, infobulle, descriptif, focus clavier ou sélection n’est ajouté au survol/clic.
Le curseur reste l’unique contrôle de saisie : toutes les notes entières 0–10 sont disponibles au
clavier, à la souris et au toucher, avec les mêmes sauvegardes et permissions.
Le descriptif persistant sous le curseur et sa valeur accessible utilisent le repère inférieur
renseigné le plus proche : 6 affiche le texte de 5 entre les repères 5 et 7, tout en enregistrant 6.
Sans borne inférieure, aucun descriptif n’est inventé. La note proposée suit la même présentation.
Le [dimensionnement intrinsèque de la modale](evaluation-taking.md) suit ses contenus réels et
stabilise les actions sans hauteur fixe ; un seul contenu actif peut défiler en faible hauteur
ou pour des textes réellement longs. Les tokens suivent les modes clair/sombre et la palette.

La démo Pages propose des repères fictifs sur Clarté des objectifs et Communication.
Son brouillon v2 permet l’édition locale ; la v1 et les snapshots de passation restent indépendants.
Reset restaure les fixtures ; aucun appel API n’est ajouté au build statique.

## Vérifications et revue documentaire

Les tests backend couvrent créations/remplacements/suppressions, omission, refus atomiques,
scopes, copie de chaque statut, historique commencé/finalisé/révisé, migration et OpenAPI.
React couvre les niveaux libres, conflits, lecture seule, erreurs de sauvegarde,
absence de hover et de points intermédiaires, borne inférieure, absence de texte inventé et conservation du curseur et des notes.
Playwright couvre édition v1/v2, passation historique, reprise, finalisation, consultation,
alignement des seuls repères, absence d’infobulles, bornes du viewport, thèmes/palettes, mobile et démo sans API.

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
Les anciennes interactions d’infobulle sont remplacées par les indicateurs passifs demandés.
`AppreciationTooltip.test` protège désormais l’absence de contenu au survol/focus/clic.
Les suites de contrat, versionnement et migration conservent leurs invariants applicables.
