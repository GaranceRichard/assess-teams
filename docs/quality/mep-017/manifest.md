# Manifeste MEP-017

Base Git : `76f486a0b84168f28229476cf04dffe094ffd81d`.
Candidat : cette base et les huit sources identifiées dans le [relevé SHA-256](manifest.csv).
Les empreintes lient chaque capture/mesure aux octets conservés ; aucun cookie, profil ou base livré.
Windows, Node 24.20.0, Python 3.12.10, Playwright 1.63.0, Chromium complet 153.0.8010.12.
Données fictives seulement, palette Vert, thèmes changés par la commande produit réelle.

| Ensemble | Résultat / provenance |
| --- | --- |
| `baseline/collections-{day,night}.jsonl` | 64 cellules sur le CSS initial ; deux refus, Planification 1280×480, centre masqué |
| `baseline/reproduction.txt` | Sortie rouge ; sonde des cellules avec thèmes réels, CSS initial restauré temporairement puis correctif remis |
| `baseline/*planning.png` | Rendu initial au format refusé, clair/sombre |
| `final/collections-{day,night}.jsonl` | 64 cellules vertes ; défilement clavier, centres et pages 1→2→1 |
| `final/dialogs-{day,night}.jsonl` | 20 cellules vertes ; cinq dialogues, petit écran/faible hauteur, focus et commandes |
| `final/native-users.jsonl` | 12 mesures vertes : deux thèmes × trois étapes × collection/dialogue |
| `final/native-results.jsonl` | 24 mesures vertes : deux thèmes × trois étapes × quatre restitutions |
| `final/*.png` | 26 captures représentatives : listes/dialogues et 200 % natif ; contrôle visuel complémentaire |

La campagne ciblée finale passe ses quatre tests. Les deux recettes natives passent séparément.
Le test de non-régression refuse le centre masqué avant correction et l'accepte après ;
le contrôle supplémentaire du défilement horizontal mobile conserve le comportement existant.
Les tableaux de mesures contiennent les dimensions et le verdict des actions exercées, sans données réelles.
Le rapport distingue les acquis antérieurs, les cellules exécutées et les limites de la qualification locale.
Les sources partagées inchangées restent identifiées par la base Git ; les huit sources du candidat sont hachées.

Les sorties complètes locales seront conservées dans
`C:/Users/garan/Desktop/Projets/Assess-teams-MEP-017-evidence`, sans les profils ni les bases de test.
Les captures/mesures utiles sont aussi versionnées ici ; leur présence distante ne dépend pas de cette archive locale.
Les gates et la CI restent obligatoires et indépendants de ces preuves de recette.
