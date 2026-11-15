# Frontend de production, statiques et ressources locales

[Index](README.md) · [Swagger distinct](swagger.md) · [outillage séparé](build.md).

## Six composants npm incorporables au build normal

Provenance : champ `resolved` de [frontend/package-lock.json](../../../frontend/package-lock.json), exact et haché dans build.md.
Les quatre racines sont React, React DOM, Chart.js et react-chartjs-2 ; @kurkle/color et scheduler sont transitifs.
Toutes les archives sont identifiées par SRI SHA-512 ; les notices MIT installées ont été vérifiées avec l’export MEP-006.

| Composant | Version | Empreinte archive SRI | Licence | Texte : SHA-256 |
| --- | --- | --- | --- | --- |
| @kurkle/color | 0.3.4 | sha512-M5UknZPHRu3DEDWoipU6sE8PdkZ6Z/S+v4dD+Ke8IaNlpdSQah50lz1KtcFBa2vsdOnwbbnxJwVM4wty6udA5w== | MIT | LICENSE.md: 89ba0032731489153d552db918b727feb05128cf9eca20092875a9ad14147671 |
| chart.js | 4.5.1 | sha512-GIjfiT9dbmHRiYi6Nl2yFCq7kkwdkp1W/lp2J99rX0yo9tgJGn3lKQATztIjb5tVtevcBtIdICNWqlq5+E8/Pw== | MIT | LICENSE.md: 41a84aa2caba645f966a18d9c2056b73e6d3a81d80bc0046bc0011a2634d4cce |
| react | 19.3.0 | sha512-E8LUcbtBWt20bbl2YoHfx4ZDBdxVTfOKtCZn9cDSJ4l6/nuoApcpIBcj47t2wZoVX8g2ZHuMHbiShgCR1T5Sog== | MIT | LICENSE: da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93 |
| react-chartjs-2 | 5.3.1 | sha512-h5IPXKg9EXpjoBzUfyWJvllMjG2mQ4EiuHQFhms/AjUm0XSZHhyRy2xVmLXHKrtcdrPO4mnGqRtYoD0vp95A0A== | MIT | LICENSE: 0d18348c715c41254b8bc1d1b400ffc9e9f0fd21b106d85c7e504c45462f83e2; LICENSE.md: 3c8ae59bbd7b94c058614adc0a76571162fd9b2fd9433df2ab74d0c9b32b4054 |
| react-dom | 19.3.0 | sha512-JDk8dgif51OjFoDE70+OT9ICyYr+69HlmihNwp1+Nsfbna3t5sIiCa9ZJktDmQ4/1b/rn26hIAR2uYXDMr5r0Q== | MIT | LICENSE: da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93 |
| scheduler | 0.28.0 | sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw== | MIT | LICENSE: da6d3703ed11cbe42bd212c725957c98da23cbff1998c05fa4b3d976d1a58e93 |

## Assets propres au dépôt

| Chemin suivi | SHA-256 source |
| --- | --- |
| frontend/src/assets/assess-teams-logo.svg | 36ff641764b79d13221888c20eac3b8f048812ddf7bc49f1c6cbd01bafe95667 |

Aucune police distante : polices système ; aucun paquet de fontes à ajouter. Le logo original reste Apache-2.0.
Le build normal consomme frontend/index.html et frontend/src/main.tsx, et non les entrées de démonstration.
Les CSS, imports et ressources sont couverts par l’arbre source Git du candidat ; MEP-058 produira leurs fichiers de sortie et leurs empreintes.
Les sources tests/démo et les outils Node ne sont pas des artefacts cible. Aucun `dist` de développement n’est déclaré livré.

## Django, DRF, API et notices

La wheel Django 5.2.19 inclut 135 fichiers statiques ; DRF 3.16.1 en inclut 36.
Leurs chemins et empreintes fichier sont dans les RECORD des wheels exacts de python.md ; leurs notices figurent dans python-notices.md.
Inclure les arborescences Django admin et DRF fournies, sans dépendre d’un CDN ; collectstatic et STATIC_ROOT restent à leurs PBI.
drf-spectacular 0.28.0 apporte les templates Swagger, pas le bundle Swagger UI. Seule la route Swagger existe ; ReDoc n’est pas une dépendance obligatoire.
Le schéma OpenAPI local est généré par Django/DRF/Spectacular ; il n’exige aucun outil ni réseau additionnel sur cible.
MEP-006 fournit déjà scripts/legal/vite-legal.mjs, export-npm.mjs et python_inventory.py. Les réutiliser pour le candidat final.
Les licences, NOTICE, attributions et textes tiers doivent rester accessibles hors ligne ; l’inventaire ne les remplace pas par des liens Internet.
