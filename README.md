# Assess Teams

**Comprendre la progression des équipes pour mieux les accompagner.**

Assess Teams est une application open source pour évaluer les équipes, suivre leur évolution
et éclairer les décisions d’accompagnement. Elle s’adresse aux organisations, aux Coachs et aux
personnes autorisées à organiser ou consulter les évaluations. L’évaluation est un moyen
d’observation collective, sans mesure de performance individuelle.

**[Essayer la démo interactive](https://GaranceRichard.github.io/assess-teams/)** — données fictives,
sans compte ni serveur applicatif. Explorez une passation, ses résultats et le pilotage du dispositif.

<a id="vision-produit"></a>

## Pourquoi Assess Teams ?

Une évaluation ponctuelle décrit une situation ; elle explique moins bien comment une équipe évolue.
Assess Teams cherche à donner de la continuité à ces observations : identifier le référentiel utilisé,
conserver le contexte des passations et relire les résultats dans le temps pour orienter l’accompagnement.

La [vision produit](docs/product/vision.md) précise cette ambition et la distingue du socle livré.
Les résultats soutiennent le jugement des acteurs ; une note isolée ne suffit pas à caractériser une équipe.

<a id="socle-technique"></a>
<a id="périmètres-livrés--identités-et-accès"></a>
<a id="périmètre-livré--gestion-des-organisations-et-équipes"></a>
<a id="périmètre-livré--modèle-dévaluation"></a>
<a id="périmètre-livré--passation-des-évaluations-planifiées"></a>

## Ce que permet Assess Teams

Les capacités ci-dessous sont livrées dans l’application, sous réserve des droits et limites indiqués.
La démo en représente une partie dans un scénario local décrit plus bas.

| Usage | Capacités disponibles |
| --- | --- |
| **Évaluer** | Créer des modèles et leurs questions avec repères d’appréciation, valider et versionner les modèles, planifier une évaluation immédiate, ponctuelle ou récurrente. Répondre explicitement de 0 à 10, reprendre une passation sauvegardée et la finaliser. |
| **Comprendre** | Lire les résultats par version exacte, y compris archivée, sur un radar ou dans les données détaillées. Explorer les observations d’un critère dans le temps ; la continuité entre versions exige une lignée explicite. |
| **Accompagner** | Donner aux Coachs des résultats contextualisés sur les passations auxquelles ils ont accès pour préparer la discussion et comprendre la progression collective. Aucun parcours dédié de plan d’accompagnement n’est livré. |
| **Piloter** | Pour Admin et Superadmin, consulter les équipes actives, la couverture, les complétions et les retards, puis ouvrir les résultats accessibles. Aucun score global ni classement individuel. |
| **Administrer** | Gérer organisations, équipes, utilisateurs, invitations et désactivation/réactivation des identités selon le périmètre autorisé. Consulter séparément le Journal d’activité métier et les Logs techniques. |

Les [contrats fonctionnels et techniques](docs/README.md#architecture) décrivent les règles détaillées.

## À qui s’adresse le produit ?

Les **organisations** structurent l’évaluation de leurs équipes, qui bénéficient des constats collectifs.
Les responsabilités sont réparties entre trois rôles métier et une fonction technique :

| Profil | Périmètre actuel |
| --- | --- |
| **Admin** | Organise et administre son organisation : membres Coach/Viewer, équipes, modèles, planification et Pilotage. Ne gère pas les Admins pairs. |
| **Coach** | Réalise les passations qui lui sont assignées et consulte les résultats autorisés pour éclairer l’accompagnement. Peut gérer les Viewers de son organisation sans changer leur fonction ; ne crée pas de compte, ne gère pas les équipes ni Pilotage. |
| **Viewer** | Consulte les résultats des évaluations complétées de son organisation et son tableau de bord personnel ; aucun droit de passation ou d’administration. |
| **Superadmin** | Assure l’administration technique globale explicitement prévue, sans appartenance organisationnelle. Gère notamment les Admins ; ce n’est pas un quatrième rôle métier. |

Les accès restent soumis au rattachement, à l’activation du compte et aux
[permissions effectives](docs/architecture/role-permissions.md).

## Explorer la démonstration

**[Essayer la démo interactive](https://GaranceRichard.github.io/assess-teams/)**

Le scénario propose le profil Admin fictif de Camille, dans l’Atelier Horizon, avec trois équipes :

1. Découvrir le tableau de bord, les équipes et les préférences d’apparence.
2. Modifier les questions et repères d’un brouillon de modèle.
3. Effectuer une passation préparée, puis retrouver ses notes dans les résultats.
4. Explorer radar, données détaillées et observations dans le temps, puis couverture et échéances dans Pilotage.

La démo utilise les composants du produit avec des **données fictives en mémoire**, sans compte,
sans serveur applicatif et sans appel à l’API Django. Les observations préchargées sont des simulations ;
les nouvelles notes sont celles de votre passation. Actualiser la page recharge les données initiales ;
« Réinitialiser la démo » restaure aussi le thème et le tableau de bord.

**Limites :** Utilisateurs, Organisation, Planification, Journal et Logs sont des aperçus sans opérations.
Validation/versionnement, révision des scores, invitations, notifications et administration ne sont pas simulés.
Le réordonnancement des questions y est une commande locale de démonstration, sans capacité de production annoncée.
Cette démo statique n’est pas une installation complète de production.
[Architecture, commandes et limites de la démo](docs/architecture/public-demo.md).

<a id="cadre-actuel"></a>
<a id="état-actuel"></a>

## État actuel du projet

Le socle disponible couvre modèles versionnés, planification, passations persistantes, restitutions,
pilotage initial et administration cloisonnée par organisation.

Des limites demeurent : la révision Admin remplace les notes et conserve seulement le dernier réviseur,
en plus de l’auteur et de la date initiaux ; l’historique complet des révisions et affectations n’est pas livré.
La réactivation des équipes n’est pas disponible. Certains droits Coach et traitements de suppression
restent à arbitrer ; aucun partage interorganisation ne découle des résultats.

Le développement du socle et la préparation de l’exploitation **MESS** restent distincts :
la démo et les capacités livrées ne constituent ni une installation cible qualifiée ni un GO MESS.
Consulter la [synthèse du backlog](docs/backlog/synthese.md), le
[registre canonique](docs/backlog/tracking/pbis.md) et les
[prérequis d’installation](docs/operations/installation-prerequisites.md) pour le suivi faisant autorité.

<a id="lancement-en-développement"></a>
<a id="installation-en-développement"></a>

## Installation et contribution

Prérequis de développement : **Python 3.12 ou 3.13, Node.js 22 ou 24, npm et PowerShell**,
sous Windows, macOS ou Linux. Depuis un clone du dépôt :

```powershell
npm run dev:all
```

Sous Windows, utiliser `npm.cmd` si la politique PowerShell l’exige.
Le lancement prépare les dépendances et l’environnement Python, applique les migrations locales,
puis démarre Django sur `http://127.0.0.1:8000` et React/Vite sur `http://127.0.0.1:5173`.
Le [guide de développement](docs/development-environments.md) décrit comptes fictifs, bootstrap,
commandes séparées et configuration. Le backend utilise SQLite ; l’interface est en React/TypeScript.

Pour contribuer, lire [AGENTS.md](AGENTS.md) et les [règles détaillées](docs/quality/agent-rules.md) :
branche et worktree dédiés depuis `origin/main`, préparation dans le document propriétaire, contrôles selon
l’impact, puis `npm run publish`. La contribution et la publication suivent le circuit direct vers `main`.

<a id="approche-quality-first"></a>
<a id="commandes-qualité"></a>
<a id="tests-et-coverages"></a>
<a id="validations-proportionnées"></a>

La [qualité et ses commandes](docs/quality/validation-costs.md), la
[DoD](docs/quality/definition-of-done.md) et les [tests](docs/quality/test-commands.md) restent bloquants :
fichiers maintenus de 200 lignes maximum, couverture backend/frontend d’au moins 90 % pour les campagnes
complètes, sécurité et documentation cohérentes. `npm run quality:targeted` calcule le plan local.

<a id="documentation"></a>
<a id="licence-et-réutilisation"></a>

## Documentation et licence

- [Index documentaire](docs/README.md) : produit, architecture, exploitation, qualité et backlog.
- [Vision produit](docs/product/vision.md) et [fondamentaux architecturaux](docs/architecture/fundamentals.md).
- [Stratégie de tests](docs/quality/test-strategy.md) et [CI](docs/quality/ci.md).
- **[Apache License 2.0](LICENSE)**, [NOTICE](NOTICE) et [licences tierces](docs/legal/third-party.md).
- [Conditions de réutilisation, fork et redistribution, notamment au MESS](docs/legal/redistribution.md).
