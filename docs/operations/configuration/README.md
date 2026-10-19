# MEP-036 — Inventaire des paramètres et défauts

Audit documentaire du 2026-10-14 sur `origin/main` à `fd6a533`, pour
[MEP-036 — Sécurité de production](../../backlog/source/mess/f01.md#mep-036--inventorier-les-paramètres-sensibles-et-les-valeurs-par-défaut).
Les sources relatives du présent dossier pointent vers les fichiers audités ; aucune valeur de configuration
réelle MESS, variable du processus, base métier, boîte mail ou fichier `.env` privé n'a été extraite dans l'inventaire.
Les valeurs ci-dessous sont exclusivement des constantes publiques ou des descriptions masquées.
Les lignes SQLite sont actualisées par la [qualification MEP-039](../sqlite/README.md) du 2026-10-15 ;
le rapport d’audit conserve ses constats historiques et indique les suites livrées.

## Lecture de l'inventaire

- [Django, authentification et SQLite](django.md).
- [HTTPS, cookies, TLS et frontières proxy](http.md).
- [SMTP, files et workers](email.md).
- [Scripts, environnement, frontend et CI](tooling.md).
- [Risques, couverture, refus et preuves](audit.md).

Chaque ligne précise source, défaut observé, sensibilité et obligation de production.
Les chemins sont relatifs au checkout, jamais des chemins d'installation MESS réels.
Une absence de variable n'est pas identique à une variable explicitement vide.
Les défauts hérités sont vérifiés dans les dépendances locales Django 5.2.18 / DRF 3.16.1 ;
ils ne constituent pas une nouvelle configuration ni une garantie pour une future version.

| Code | Sensibilité |
| --- | --- |
| S | Secret : valeur toujours omise, y compris le credential fictif de développement |
| I | Information interne ou personnelle : nom/chemin générique seulement |
| C | Paramètre de sécurité : valeur publique, changement pouvant affaiblir une protection |
| P | Paramètre technique public sans secret |

La colonne « Production » distingue l'obligation de disposer d'une valeur sûre de l'obligation
de fournir une variable. **Requis** : entrée explicite exigée par le démarrage actuel.
**Fixe** : constant applicatif conservé, aucune variable à fournir. **Défaut** : entrée facultative,
valeur calculée/héritée utilisée. **Conditionnel** : nécessaire selon la topologie ou le relais.
**Exploitation** : décision/provision indispensable à la production, pas contrôlé aujourd'hui.
**Interdit** : mécanisme de développement/test à exclure du service de production.

## Frontière de livraison

Le [contrat courant MEP-009](startup-security.md) et ses [preuves](startup-validation.md)
ajoutent désormais les contrôles de démarrage, la protection et la rotation des secrets.
Les tables MEP-036 ci-dessus restent l'instantané audité du 2026-10-14, avant ces corrections.
Le [contrat courant MEP-042](journal-retention.md) ajoute les deux variables de conservation
des journaux, leurs défauts sans échéance, refus, périmètres et responsabilités ;
ses [preuves](journal-retention-validation.md) sont distinctes de l'inventaire historique.

MEP-036 livre l'analyse et la traçabilité ; aucune correction de paramètre, validation de secret,
provisionnement, purge, migration, nouveau service ni configuration MESS n'est ajouté.
[MEP-009](../../backlog/source/mess/f01.md#mep-009--sécuriser-les-secrets-et-vérifier-la-configuration-au-démarrage)
consomme les risques R01–R06 ; les contrats uniques, SQLite et installation restent leurs PBI propres.
Les settings explicitement définis/importés, variables consommées et paramètres opérationnels sont
recensés. Les défauts génériques des bibliothèques sans usage propre au dépôt, les champs métier et
les arguments standards complets de npm/Git/Django ne sont pas des paramètres d'installation du produit.
Les héritages de sécurité et options SQLite pertinents sont toutefois explicités pour éviter les angles morts.
