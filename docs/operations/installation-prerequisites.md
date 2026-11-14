# MEP-055 — Prérequis et profil de référence

Référence courante du 2026-11-14, selon le mandat de remise en cohérence du backlog.
[Source F11](../backlog/source/mess/f11.md) · [contrôles et limites](installation-prerequisites-validation.md).
Les neuf approbations externes D01–D09 ne sont pas un processus produit demandé et ne conditionnent
plus le développement. Leurs analyses restent accessibles dans le [dossier historique](installation-prerequisites-arbitration.md).
Le profil ci-dessous est une **convention technique du projet à réaliser et qualifier**, pas un choix
homologué par MESS, une preuve d’installation ou une clôture de MEP-055.

## Contraintes acquises

- Hébergement on-premise, SQLite permanente ; aucun Docker, Node/npm, Vite ou build frontend sur cible.
- Installation et usage sans Internet ; réseau interne pour clients, DNS, temps et SMTP permis.
- Build normal React et dépendances préparés ailleurs ; aucun CDN, police ou script distant obligatoire.
- Même fichier SQLite local pour API et workers sur un hôte ; ni SMB/NFS, dossier synchronisé ni multi-hôte.
- DELETE/FULL, timeout 5 s, DEFERRED, CONN_MAX_AGE=0 et FK actives selon les [preuves SQLite](sqlite/README.md).
- HTTPS, sessions/CSRF, origine exacte et pairs de proxy selon le [contrat HTTP](../architecture/http-security.md).
- Secrets forts hors sources, package et preuves ; aucun compte ou seed développeur sur cible.
- LICENSE/NOTICE et droits de redistribution conservés ; inventaire fermé avant package.

## Profil technique de référence REF-WIN-01

Ce profil reprend Windows Server comme banc technique ; l’ancienne proposition n’est pas transformée en
accord MESS. Il peut évoluer sur incompatibilité démontrée, avec version du profil et requalification
explicites. Les versions complètes, binaires et empreintes sont figés par MEP-057 avant MEP-058/059/024 ;
les séries ci-dessous ne sont pas un verrou de distribution ni une promesse de support de tout correctif.

| Axe historique | Convention testable du projet | Preuve ou limite à conserver |
| --- | --- | --- |
| D01 — hôte | Windows Server 2022 x64, un hôte API/workers/SQLite ; banc isolé de 2 vCPU, 4 Gio RAM, disque local de 40 Gio | Relever édition/build/correctifs et espace réellement libre ; ressources du banc, aucun minimum ni dimensionnement MESS garanti |
| D02 — runtime | CPython standard 3.13 x64 privé à l’application ; sqlite3, TLS et tzdata locaux | MEP-057 fige correctif/ABI/SQLite et provenance ; MEP-059 prouve les wheels natives et l’installation sans résolution réseau |
| D03 — HTTP | Waitress WSGI 3.x sur 127.0.0.1:8000 ; Caddy 2.x local pour TLS, assets React/Django et proxy API/admin | Versions corrigées, droits et intégration à vérifier par MEP-057/025/034 ; aucune pile déjà livrée ou compatible affirmée |
| D04 — confiance | Origine de banc `https://assess-teams.test:8443`, certificat/clé privés fournis localement, chaîne de test installée sur clients/Python | Aucune demande ACME Internet ; contrôle chaîne/nom/expiration et renouvellement local ; PKI réelle du site distincte |
| D05 — flux | Client→frontal TCP 8443 ; frontal→API loopback 8000 ; SMTP interne de test TCP 587 STARTTLS ; aucun sortant Internet | DNS ou résolution locale de test, temps interne ; backend fermé aux clients, liste exacte des pairs et captures expurgées |
| D06 — identités | Compte de service non admin pour API/workers ; installation habilitée distincte ; frontal sans accès base/secrets applicatifs | ACL positives/négatives à vérifier ; secret injecté en privé, Superadmin Django initial créé explicitement par MEP-062 |
| D07 — persistance | `C:\AssessTeams\releases` et `runtime` ; `C:\ProgramData\AssessTeams\config`, `data`, `logs`, `tmp`, `backups` | Racines paramétrables, SQLite dans data ; ACL répertoire et journal rollback ; backup protégé, séparé du remplacement du code |
| D08 — courriel | Relais interne de recette avec TLS reconnu, expéditeur fictif autorisé et boîte de test ; hôte/credentials injectés | Aucun relais MESS présumé disponible ; panne persistée sans annuler le succès métier, remise incertaine jamais rejouée aveuglément |
| D09 — exécution | Planificateur Windows : deux workers de remise chaque minute sans chevauchement, échéances quotidiennes à 02:00 America/Toronto | Commandes existantes réutilisées ; fréquence paramétrable, état/codes visibles, reprise bornée ; services/tâches à livrer par MEP-063 |

Les choix de serveur constituent une piste d’intégration de référence. [Waitress](https://docs.pylonsproject.org/projects/waitress/en/stable/)
documente Windows et CPython 3.13 ; [Caddy](https://caddyserver.com/docs/caddyfile/directives/tls) permet les
certificats fournis localement. Cela ne prouve pas leur assemblage Assess Teams : le pair transport réel,
Host avec port, X-Forwarded-Proto unique et CSRF doivent être éprouvés, sans contourner les protections.

Pour le banc, les certificats et la confiance sont préparés hors ligne, sans désactiver la vérification TLS.
Les ports/noms/chemins sont des valeurs de référence remplaçables et validées au préflight, pas des
paramètres déjà consommés par l’application. Aucun mécanisme de chargement n’est développé dans ce mandat.
Le backup sur le même disque ne protège pas contre sa perte ; une cible réelle doit disposer d’une copie
séparée protégée. Les essais de destruction/reprise utilisent exclusivement des clones fictifs.

## Configuration et points d’intégration restant à livrer

| Capacité | Existant conservé | Delta attribué |
| --- | --- | --- |
| Configuration | Variables/settings et validateurs MEP-036/009/042 | Schéma et précédence MEP-054 ; chargement commun API/workers/scripts et chemin SQLite MEP-021 |
| Runtime/serveur | WSGI/ASGI sélectionnent la production ; aucun serveur de production dans requirements | Inventaire/version/ABI MEP-057, wheels MEP-059, package MEP-024 et services MEP-063 |
| Frontend/statiques | Build React normal et STATIC_URL ; STATIC_ROOT non configuré | Build/statiques locaux MEP-058, configuration MEP-021 et assemblage MEP-024 |
| Swagger hors ligne | CDN par défaut drf-spectacular 0.28.0 déjà constaté ; schéma local seul insuffisant | Inventorier assets MEP-057, préparer avec MEP-058, assembler MEP-024, configurer MEP-021 ; vérifier MEP-025/068 |
| Persistance | Base actuelle sous backend ; journal rollback et transactions acquis | Répertoires MEP-060, bootstrap/migrations MEP-062, upgrade MEP-026 ; aucun déplacement implicite |
| Notifications/purge | Files durables et commandes existantes ; purge bornée et simulation | MEP-022 décrit les opérations ; MEP-063 les supervise ; aucune autorisation de purge métier créée |

## Objectifs d’exploitation — C11

MEP-022 définit le protocole de référence et des **rôles opératoires**, sans devoir obtenir un RACI signé
par une organisation externe. Installer, surveiller, intervenir et autoriser une restauration sont des
responsabilités à rendre explicites ; les personnes du site réel seront attribuées avant son exploitation.

- Charge : jeux fictifs FON/TEC, nombre d’acteurs/écrivains, mix, paliers, durée, répétitions et instruments
  fixés avant mesure ; invariants d’intégrité et refus sûrs obligatoires, débit/latence/limites publiés.
- Disponibilité : observer processus, health et codes, mesurer les interruptions du banc ; aucun SLA MESS déduit.
- Sauvegarde : inclure base cohérente, version/schéma et références de configuration privée ; vérification
  d’intégrité et restauration indispensables ; fréquence/conservation technique paramétrables, aucune purge métier par défaut.
- Reprise : mesurer durée entre déclenchement et contrôles de service réussis, point récupéré et jalons
  post-backup non récupérés ; restaurer un clone au point explicitement choisi, jamais accepter une perte réelle par défaut.
- Les éventuels objectifs contractuels de charge, disponibilité, RPO/RTO et conservation du site restent
  **à décider s’ils sont requis** ; leur absence interdit de promettre ces garanties, sans bloquer les outils du projet.

## Compatibilité réelle et qualification

MEP-055 produit le contrat de prérequis ; MEP-057/059 vérifient composants et ABI, MEP-025 le diagnostic,
MEP-032/068 puis MEP-034/071/072 produisent les PV du candidat sur l’environnement effectivement testé.
Une VM de référence qualifiée prouve cette VM ; elle ne qualifie pas un site MESS absent.
Le GO MESS exige l’accès à l’environnement réel, les responsabilités d’exploitation et la comparaison
profil/site : versions, ressources, réseau, certificats, SMTP, ACL, persistance et reprise.
Toute différence non éprouvée reste non démontrée. Aucune approbation D01–D09 ni recette globale n’est inventée.
