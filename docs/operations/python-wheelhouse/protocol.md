# Protocole de contrôle MEP-059

[Préparation](README.md) · [preuves et verdict](qualification.md).
Exécuter depuis la racine du checkout publié ; Python de préparation 3.12+ avec pip disponible.
Le contrôle utilise uniquement le packaging vendored de pip ; rien à installer sur le poste hors ligne.
Le banc de cette preuve emploie Python de préparation 3.12.10 et pip 25.0.1.

## Pièces livrées et contrôle sans réseau

`distribution/python/ref-win-01/requirements.txt` reprend exactement les quinze pins et SHA-256 de
[MEP-057 au commit 6aec11f](../distribution-inventory/python.md).
`distribution/python/ref-win-01/wheels/` contient les quinze archives originales, 10 588 058 octets au total.
Les URLs immuables, licences, transitives, notices et imports PE restent dans cet inventaire propriétaire.
Aucun runtime Python, pip, outil de build, source sdist, extra ou dépendance développeur n’est livré ici.
Les wheels incluent les textes intégraux et attributions, y compris les ressources Django.

```powershell
backend/.venv/Scripts/python.exe scripts/distribution/python_wheelhouse.py verify
backend/.venv/Scripts/python.exe -m unittest discover -s scripts/distribution -p test_python_wheelhouse.py -v
```

`verify` refuse un verrou divergent, une directive ou entrée non épinglée, une liste d’archives inexacte,
une empreinte incorrecte, des tags fichier/WHEEL incohérents, Requires-Python incompatible,
une transitive absente/hors contrainte, un composant hors graphe ou un texte de notice absent/altéré.
Les marqueurs sont évalués pour Windows / CPython 3.13 standard : pas pour le Python de préparation.
`typing_extensions` est ainsi exclu de la cible ; Waitress reste la quatrième racine avec les trois requirements applicatifs.
La vérification du graphe précède pip : `--no-deps` ne masque donc pas une transitive manquante.

## Installation de qualification sur banc compatible

Préparer séparément un interpréteur privé Windows AMD64 CPython standard 3.13 et relever ses octets.
Pour reproduire exactement cette preuve ABI, l’archive et le SHA-256 du banc 3.13.17 figurent dans
[artifacts.md](../distribution-inventory/artifacts.md) ; contrôler aussi python.exe selon [runtime.md](../distribution-inventory/runtime.md).
Ce runtime refusé par I01 sert exclusivement au banc ; ne jamais l’intégrer à une distribution.
Le ZIP embarquable ne fournit pas pip : le script charge explicitement le pip du poste de préparation
à l’intérieur de l’interpréteur de banc. Il ne télécharge ni pip ni une dépendance cible.
Le probe final est un processus isolé sans ce chemin de préparation.

Exemple avec le runtime privé déjà présent et une destination **inexistante** :

```powershell
backend/.venv/Scripts/python.exe scripts/distribution/python_wheelhouse.py qualify `
  --python .cache/mep-059/runtime-qualification-only/python.exe `
  --destination .cache/mep-059/installation-neuve
```

Le script contrôle interpréteur, architecture et GIL standard, puis lance pip avec
`--isolated --disable-pip-version-check --no-cache-dir install --no-index --no-deps
--only-binary=:all: --require-hashes --no-compile --find-links <wheels> --target <destination> -r <verrou>`.
Les seuls candidats sont locaux et épinglés ; aucune résolution transitive ni compilation n’est permise.
Un audit hook interdit urllib.Request, connexions socket, DNS et envois réseau dans le processus pip.
Un accès implicite reste un échec même si pip intercepte l’exception : le compteur doit rester à zéro.
Le nom d’hôte local et la création de socket sans connexion ne sont pas des téléchargements.
Ce garde de qualification contrôle ce processus Python ; il ne prétend pas isoler tout le système d’exploitation.

Le processus d’import ajoute seulement l’installation neuve à son chemin isolé, vérifie la provenance locale
des dix-sept modules, charge les deux extensions natives, exerce YAML/HashTrieMap/JSON Schema et lit Toronto via tzdata.
Les quinze versions de METADATA installées doivent correspondre exactement au verrou.
L’absence de pip dans le runtime de distribution reste une question d’assemblage MEP-024, non résolue ici.

## Rejouer les refus

Les dix tests copient les vraies archives dans un temporaire indépendant et retirent PyYAML,
altèrent un octet Waitress, substituent un nom cp312, ajoutent une archive inconnue ou divergent du verrou.
Ils retirent réellement la notice Waitress et vérifient également le graphe sans PyYAML ou avec asgiref trop ancien.
Le Python 3.12 réel est refusé pour le profil cp313 ; sur CI Linux 3.13, le refus porte sur l’OS réel.
Un urllib.request vers une URL HTTPS est bloqué avant connexion, sans dépendre d’un réseau indisponible.
La substitution de nom cp312 teste les tags ; elle ne prétend pas être une archive cp312 téléchargée.
La preuve d’incompatibilité d’interpréteur utilise un véritable exécutable distinct.
Le gate repository lance ces mêmes tests en pré-push et CI ; la CI Linux ne rejoue pas les imports natifs Windows.
