# MEP-048 — résultat de la qualification complémentaire

> Historique de qualification : les réserves et restrictions de cette phase sont conservées.
> Voir le [rapport consolidé](rapport.md) pour la correction et la proposition actuelles.

**2026-11-02 — Codex — décision proposée : écarts résiduels reproductibles, sans clôture.**
La navigation réelle, les refus d’accès, les valeurs, les absences et les distinctions par rôle sont démontrés.
Deux problèmes de lecture restent observés : la note des états sort du cadre au clavier sur mobile ;
à 1280×720, définitions ouvertes, la zone du tableau masque la ligne sans résultat.
Aucune correction ni modification de statut n’a été réalisée.

## Candidat et périmètre

- SHA : `826cc51063ab1120ddc052f2a01bb4b77479c4b0`, récupéré sur origin/main au démarrage.
- Branche `audit/mep-048-indicateurs-20261101`, worktree
  `C:/Users/garan/Desktop/Projets/Assess-teams-mep-048`, avancé exclusivement en fast-forward.
- [Référence canonique FEAT-055 / MEP-048](../../source/mess/f07.md),
  [dossier de sortie](../audit-20261027/sortie-mep-048.md),
  [rapport initial conservé](rapport-initial.md).
- [Exécutions et observations complémentaires](complement.md) ;
  [reproduction des écarts](ecarts-residuels.md) ; [inventaire des preuves](preuves-complement.md).
- Qualification locale limitée ; ni acceptation MESS, ni promotion, ni GO/NO-GO.
  Aucun code/test versionné, calcul métier, statut ou date canonique modifié. Aucun commit/push.
  Le checkout principal et les autres chantiers sont restés intacts.

## Preuves réutilisées

Les 46 tests backend, 27 assertions React et 9 E2E du 2026-11-01 restent des résultats réels sur
`2d9b6c3c5c960e94630c93ce6c523bbcc6a0badd` ; voir [validations initiales](validations.md).
Aucune de ces suites n’a été rejouée. Entre ces candidats, aucun backend ni composant Dashboard/Pilotage
n’a changé. Les changements applicatifs concernent le radar Results, qualifié ici par les parcours connectés.
Il n’est pas prétendu que l’ensemble des entrées transitive/runtime d’un cache qualité soit identique :
les anciens résultats ne sont pas renommés en campagnes exhaustives du nouveau SHA.

Le jeu J1 est repris dans une copie : D=02/11/2026, A2/A3 dues D−1 et A4 D+1 ;
valeurs **4 actives / 2 avec résultat / 2 sans résultat / 2 retards**, dernière complétion A2
au 31/10/2026 à 10:00 Toronto. La révision A1 du 01/11 reste distincte de sa complétion du 30/10.
A2 est réassignée à un autre Coach fictif pour vérifier réellement le scope personnel.
Un jeu séparé contient une équipe en seule v1 et une autre en v2 : aucune pollution des comptes J1.

## Matrice attendu / observé / preuve / verdict

Q1 : lecture stabilisée ; Q2 : source/refus connecté ; Q3 : absences et rôles.
B01/B02 : observations locales, sans création de PBI ni changement canonique.

| Critère ou refus canonique | Attendu | Observé final | Preuve | Verdict |
| --- | --- | --- | --- | --- |
| Couverture reliée aux faits | Actives du scope ; COMPLETED accessible ; archives exclues ; absence distincte de 0 | J1 4/2/2 ; J2 0/0/0 et aucune complétion ; J3 1/0/1 et aucune complétion ; définitions ouvertes, huit combinaisons taille/thème | Q1, Q3 ; inputs.json ; captures cartes/définitions/messages | Valeurs conformes ; lecture détaillée J3 affectée par B02 |
| Complétions reliées aux sources | Date initiale/version/run ; révision distincte ; Dashboard selon scope et bornage | Liens A1/A2 réels : org/famille 1, v1, runs 1/2 ; dates initiales 30/10 et 31/10 ; notes [0,0] et [7,3]. Dashboard distingue révision et complétion ; bornage déjà acquis non rejoué | Q2-source-A1/A2 ; Q3-dashboard ; B1/B2 initiaux | Conforme dans la sélection observée |
| Retards reliés aux échéances | Attentes strictement avant D ; jamais évaluée prioritaire ; aucune qualité déduite de À jour | 2 retards, A2 En retard, A3 Jamais évaluée malgré attente échue, A4 Jamais évaluée future ; définitions des cartes lisibles ; note des états perdue au clavier mobile | Q1 ; mobile-diagnostic.json et captures avant/après | Calcul conforme ; interprétation à l’écran non conforme dans B01 |
| Explications actionnables vers Results, sans nouveau calcul | Source autorisée exacte ou message d’absence ; aucune équipe implicitement substituée | A1/A2 sélectionnées par lien clavier. Ancienne seulement : message d’absence sur v2, zéro équipe cochée. Appels étrangers 404 ; URL forgée Admin revient au contexte propre sans modèle sélectionné ni donnée étrangère | Q2-source, Q2-old-version-absence, Q2-foreign-access ; captures et HTTP réels | Navigation/refus conformes ; lecture conjointe reste affectée par B01/B02 |
| Refus classement individuel | Aucun classement ou performance Coach | Les quatre Dashboard montrent activités/assignations/scopes ; Coach sans A2 réassignée ; Viewer sans auteurs ; Superadmin global explicite. Pilotage trie des états d’équipe | Q3-dashboard des quatre rôles, clair/sombre ; lecture des textes et acquis initiaux | Refus respecté dans le périmètre observé |
| Refus score global Pilotage | Aucune note/moyenne globale ni qualité inférée | Cinq cartes : quatre comptes et une date ; états expliqués ; aucun score global ajouté | Q1 cartes/définitions ; acquis projection et tests initiaux | Refus respecté ; B01 concerne la disponibilité de l’explication |
| Refus indicateur sans provenance | Organisation/date/faits/sources identifiables ; nulls explicites ; droits conservés | D lisible ; contexte et snapshots exacts ; messages J2/J3 ; Coach/Viewer Pilotage 403 et page non autorisée ; Superadmin choisit une organisation sans agrégation/fuite | Q1–Q3 ; HTTP et captures ; B1/B2 initiaux | Provenance et droits conformes ; disponibilité de certains textes limitée par B01/B02 |

## Sortie des cellules initialement manquantes

| Cellule | Résultat final | Suite bornée |
| --- | --- | --- |
| Q1 | Superposition de transition levée ; cartes/définitions lisibles dans les deux thèmes aux quatre formats. B01 reproduit en mobile ; B02 reproduit à 1280×720 | Ne pas déclarer Q1 globalement passée. Décider du traitement des deux écarts de lecture |
| Q2 | Liens A1/A2, ancienne version sans équipe substituée, refus 404 et contexte forgé réellement contrôlés | Réserve de preuve levée ; aucune répétition demandée hors impact d’une évolution ultérieure |
| Q3 | Absences explicites, scopes/auteurs/assignations des quatre rôles, refus Coach/Viewer et choix Superadmin observés | Sémantique/rôles conformes ; ligne J3 masquée avec définitions ouvertes : B02 |

## Décision motivée

**Pas de clôture proposée à ce stade.** Le manque de preuve de navigation et de rôles est résolu ;
le résidu est désormais reproductible et localisé dans la présentation/collection partagée.
Il ne justifie ni un calcul supplémentaire ni une reconstruction de Dashboard/Pilotage.

Proposer une décision ultérieure sur **B01 et B02**, décrits dans [les écarts](ecarts-residuels.md).
Responsabilité technique à confirmer : présentation Pilotage et shell/CollectionFrame partagé ;
aucune attribution canonique de PBI ou de correctif n’est effectuée.
Une éventuelle correction autorisée devra couvrir ces reproductions par des non-régressions,
puis seulement requalifier les cellules affectées et ses impacts réels.

Les autres constats ne sont pas annulés par ces défauts d’affichage. Si les deux écarts sont levés
et la DoD applicable démontrée, une clôture pourra être proposée au suivi.
Aucun statut n’a changé et aucune acceptation métier MESS n’a été présumée.
