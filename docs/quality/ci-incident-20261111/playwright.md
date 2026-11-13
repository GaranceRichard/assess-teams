# Incident A — Installation Playwright et conséquence globale

> État de la phase d’audit initiale avant GO. Voir la [qualification du 12 novembre](qualification-20261112.md) et la [correction approuvée](correction.md) pour la suite.

[Logs et étapes E2E 1/2](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629075),
[logs et étapes E2E 2/2](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130617629053).
Les extraits et leurs lignes d’archive sont dans [la provenance](provenance.md).

## Chaîne réellement observée

1. Checkout du candidat, installation Python/backend, Node et `npm ci` réussissent.
2. Étape 7 : `npx playwright install --with-deps --only-shell chromium`, depuis `frontend`.
3. Playwright commence les dépendances système, élève les privilèges et lance APT.
4. APT lit `file:/etc/apt/apt-mirrors.txt`. L’accès aux dépôts Microsoft réussit.
5. Les index Ubuntu noble, updates, backports et security ne sont pas récupérés :
   `Temporary failure resolving 'azure.archive.ubuntu.com'`.
6. APT conserve ses anciens index, puis tente neuf nouveaux paquets ; leurs téléchargements
   échouent avec la même résolution. Les deux jobs ne peuvent pas installer les dépendances.
7. Playwright rapporte un sous-processus d’installation de code **100** ; l’étape shell
   GitHub se termine avec le code **1**. Ce sont deux niveaux de codes distincts.
8. Aucun début de téléchargement Chromium n’est présent. Inventaire E2E et exécution
   applicative/démo sont marqués non exécutés (`skipped` par GitHub, aucun skip ajouté).
9. L’upload `always()` échoue faute de fichiers E2E produits.

Les neuf paquets refusés sont `fonts-ipafont-gothic`, `fonts-freefont-ttf`,
`fonts-tlwg-loma-otf`, `fonts-unifont`, `fonts-wqy-zenhei`, `xfonts-encodings`,
`xfonts-utils`, `xfonts-cyrillic`, `xfonts-scalable`.
Les bibliothèques déjà présentes ne prouvent pas la disponibilité des polices manquantes.
Les URLs affichées sous `security.ubuntu.com` et le nom `azure.archive.ubuntu.com`
coexistent dans la résolution APT par miroir. Les logs ne livrent pas la chaîne DNS complète.

## Chronologie UTC du 11 novembre

| Événement | E2E 2/2 | E2E 1/2 |
| --- | --- | --- |
| Début commande installation | 15:26:14.237 | 15:26:21.457 |
| Premier refus d’index DNS | 15:28:34.854 | 15:28:42.661 |
| Échec installation (APT 100) | 15:36:19.777 | 15:36:34.900 |
| Échec upload faute de fichiers | 15:36:19.970 | 15:36:35.107 |

Le shard backend 4 affiche son échec à 15:28:09, avant la fin des installations E2E.
Il tourne sur une VM distincte : aucune causalité entre le DNS E2E et SQLite n’est démontrée.

## Verdict et limites

**Incident d’infrastructure démontré**, sur l’accès/résolution du miroir Ubuntu depuis
ces runners, avant le navigateur et les tests. Ce n’est pas un échec de parcours métier.
Le succès des accès GitHub/npm/PyPI/Microsoft exclut une absence générale de connectivité,
mais pas une panne DNS sélective, un problème du résolveur, du miroir ou de sa configuration.
Le composant responsable au-delà du message APT reste indéterminé.
Le rétablissement après le 11 n’a pas été vérifié ; « transitoire et résolu » serait prématuré.

La [documentation Playwright CI](https://playwright.dev/docs/ci) distingue préparation
du navigateur/dépendances et lancement des tests. Les [runners hébergés GitHub](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
sont des instances éphémères : leurs téléchargements nécessitent une connectivité effective.
Ces références expliquent le mécanisme ; elles ne prouvent pas un incident global fournisseur.

## Incident C — Gate global

[Job 130624418533](https://github.com/GaranceRichard/assess-teams/actions/runs/43048132030/job/130624418533) :
à 15:37:28.985, consolidation impossible (`ENOENT` sur `.cache/e2e/blobs`) ;
à 15:37:29.169, rapport absent ; à 15:37:29.230, refus explicite `backend, e2e`.
L’étape de preuve du candidat est non exécutée. La couverture backend globale est également
non exécutée après l’échec d’une partition. Ces conséquences gardent les gates effectifs.
Aucun troisième défaut produit ni correctif de l’agrégateur n’est démontré.
