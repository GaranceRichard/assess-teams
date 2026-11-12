# MEP-031 — Installation, autonomie et gates

[Index](technical-acceptance.md) · [P0, jeux G, R0 et PV](technical-acceptance-protocol.md).

## TEC-01

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-01 — Poser un candidat exact sans dépendance Internet ni effet destructif sur environnement hors contrat. |
| Références | [MEP-032](../backlog/source/mess/f18.md), [prérequis et refus C01–C10](../operations/installation-prerequisites-validation.md), MEP-024/060/061/062/025/028. |
| Préconditions | P0 ; exploitant installation habilité D06, responsable recette ; cible vierge attestée, profil approuvé, package/manifeste et guide définitifs. Installateur/préflight/diagnostic encore absents : finalisation bloquée sur leurs propriétaires. |
| Données | Répertoire vierge inventorié ; configuration fictive privée ; compte initial explicite, puis G-A. Clone distinct pour chaque défaut. |
| Procédure | 1. Comparer OS/ABI/Python/SQLite et empreintes au manifeste approuvé. 2. Bloquer Internet, vérifier les flux internes D05. 3. Exécuter préflight puis pose selon les commandes MEP-060/061 livrées. 4. Initialiser migrations/compte par MEP-062 ; inspecter `showmigrations --plan`. 5. Contrôler statiques, lien profond React, `/admin/`, `/api/health/`, `/api/schema/`, `/api/docs/`, API et workers avec le diagnostic MEP-025. 6. Relancer selon le contrat d'idempotence définitif et comparer données/configuration. |
| Injection | Rejouer séparément avec package altéré, ABI incompatible, prérequis absent et répertoire SQLite non inscriptible ; sélectionner les mécanismes OS approuvés D01/D06, sans modifier le package nominal. |
| Attendu | Pose locale complète sur profil conforme ; même SQLite persistante API/workers ; initialisation explicite, pas de seed/démo ni serveur de développement. Diagnostic par composant, aucune réussite globale sur succès partiel. |
| Seuil | Conformité exacte du manifeste et du profil ; aucune sortie Internet, Node/npm, Docker ou compilation frontend requise. Durée/capacité/limite d'espace : `À définir — C11 / MEP-022`, D01/D07 ; aucune durée maximale déduite du bootstrap développeur. |
| Refus | Préflight refuse le défaut nommé avant écrasement/migration/bootstrap ; comparer fichiers, schéma, comptes et configuration avant/après. Téléchargement nécessaire, intervention ad hoc ou faux succès partiel = échec de recette. Le code/diagnostic final du refus reste à fixer par MEP-060/025 avant exécution. |
| Preuves | Manifeste/empreintes, inventaire vierge, profil/décisions, commandes/sorties/codes, migrations, contrôles par composant, trace des flux et comparaison avant/après des refus. Aucun secret. |
| Remise en état | R0 ; conserver la cible en échec isolée ; repartir d'un clone vierge pour chaque variante, sans toucher à l'installation nominale. |
| Consommateur / verdict | MEP-032 — **Non exécuté**. |

## TEC-02

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-02 — Détecter toute ressource externe nécessaire au runtime, documentation ou exploitation. |
| Références | [MEP-068](../backlog/source/mess/f18.md), [MEP-055 C02/C03/C05](../operations/installation-prerequisites-validation.md), [FON](functional-acceptance.md), [services MEP-063](../backlog/source/mess/f14.md). |
| Préconditions | P0 ; TEC-01 et prérequis canoniques MEP-068 satisfaits ; exploitants réseau/service, recette et acteurs G-A ; D05/D08/D09 approuvées, instrumentation réseau choisie. |
| Données | G-A/G-S/G-N ; navigateur à cache froid et profil neuf pour éviter une dépendance CDN masquée par le cache. État initial services nominaux, queues relevées. |
| Procédure | 1. Appliquer le blocage Internet sur clone et client ; attester que les services internes autorisés restent distincts. 2. Charger connexion et liens profonds, assets/polices/notices, admin et Swagger. 3. Exercer les parcours FON par rôle puis les commandes workers/échéance du protocole. 4. Redémarrer les services par la procédure MEP-063 livrée. 5. Corréler requêtes navigateur, résolution et flux serveur pendant la fenêtre approuvée. |
| Injection | Internet effectivement indisponible, caches navigateur vidés ; garder SMTP/DNS/temps internes selon D05. Tester SMTP séparément dans TEC-11, sans interpréter « hors Internet » comme « sans réseau interne ». |
| Attendu | Parcours, assets, contrats/docs, workers et opérations locales fonctionnels ; aucune requête externe nécessaire ni tentative de sortie Internet. Le Swagger CDN actuel est un écart à résoudre par MEP-058/024, pas une exemption de recette. |
| Seuil | Zéro dépendance ou requête sortante Internet ; fenêtre, périmètre d'observation et volumes : `À définir — C11 / MEP-022` avec D05. |
| Refus | Asset CDN, installation pip, service externe ou téléchargement requis : refuser la conformité et identifier le parcours incomplet ; aucun succès déclaré sur écran vide/cache chaud ni remplacement manuel d'asset. Absence d'effets interdits : aucun contournement réseau, aucune mutation du package pour finir l'essai. |
| Preuves | Règles/référence réseau expurgées, test de blocage, cache initial, observations des parcours, flux client/serveur et erreurs d'assets, PID et états des queues avant/après. |
| Remise en état | R0 ; retirer seulement les règles de test autorisées, fermer le profil jetable, vérifier flux internes et files sans renvoi incertain. |
| Consommateur / verdict | MEP-068 — **Non exécuté**. |

## TEC-17

| Champ | Contenu |
| --- | --- |
| Identifiant / objectif | TEC-17 — Empêcher la promotion d'un candidat sans qualification exhaustive distante exacte, sans confondre publication et recette. |
| Références | [CI et limites du push direct](ci.md), [validation/qualification](validation-costs.md), [vérificateur](../../scripts/quality/qualification.mjs), [jalon MEP-035](../backlog/tracking/mess-jalon.md). |
| Préconditions | P0 ; responsable dépôt/recette sur poste de contribution authentifié, checkout isolé propre ; run exhaustif existant et artefact accessibles. Ce scénario n'exige ni modification de test/workflow ni push d'un candidat volontairement rouge. |
| Données | SHA complet candidat ; un run exhaustif réussi correspondant ; variantes avec run rouge existant, run sélectif et preuve d'un autre SHA. Si ces témoins n'existent pas, préparer le protocole avec le responsable dépôt, variante Bloquée ; ne pas créer un échec sur main. |
| Procédure | 1. Relever SHA, plan et conclusion CI indépendante de la publication réelle. 2. Lire workflow/run/artefact exhaustifs ; confronter provenance, runId et SHA de `qualification.json`. 3. Exécuter sur poste `npm run quality:promote -- SHA_COMPLET RUN_ID` avec le nominal puis chacun des témoins de refus. 4. Consigner l'autorisation de qualification seulement ; vérifier séparément les PV et décisions GO. |
| Injection | Désigner un run rouge, un run sélectif ou une preuve d'un autre SHA ; ne pas altérer le dépôt ni les artefacts distants. |
| Attendu | Promotion autorisée seulement pour qualification GitHub exhaustive réussie du SHA exact et artefact correspondant. CI sélective indépendante, nightly d'un autre SHA et succès local insuffisants. |
| Seuil | Identité exacte SHA/run/provenance, conclusion `success`, preuve `exhaustive=true` ; aucun SLA CI inventé. Un gate requis rouge interdit validation et promotion. |
| Refus | Code non nul, diagnostic explicite et absence de `[PASS] Promotion autorisee` pour chaque témoin invalide ; aucun déploiement ou GO déclenché. `publish` ayant déjà poussé si la CI échoue, livraison non terminée : aucun force-push ni gate affaibli. |
| Preuves | SHA, commandes/codes, URL du run exact, conclusions/jobs requis, artefact/empreinte et rapprochement avec le package ; aucune conversion en PV MESS. |
| Remise en état | R0 ; aucune promotion effective ni publication rouge provoquée. Retirer seulement les téléchargements locaux du clone selon la politique de preuve. |
| Consommateur / verdict | MEP-032 (candidat qualifié), contrôle avant MEP-035 (GO) — **Non exécuté**. |
