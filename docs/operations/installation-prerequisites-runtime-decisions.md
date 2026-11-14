# MEP-055 — Fiches D01–D03 : hôte, runtime et serveur

Fiches d’atelier du 2026-11-14. [Synthèse et validation](installation-prerequisites-arbitration.md).
Toutes les recommandations ci-dessous sont **proposées, non approuvées**. Le
[contrat initial](installation-prerequisites.md) reste la source des contraintes.

## D01 — OS, édition, build, architecture et capacité

- **Besoin opérationnel :** disposer d’un hôte maintenable pour API, workers et fichier SQLite permanent.
- **Obligatoire :** infrastructure MESS on-premise, fonctionnement sans Internet, sans Docker/Node/Vite ;
  processus accédant à SQLite sur le même hôte et stockage local avec verrouillage fiable.
- **Proposition du contrat :** Windows Server 2022 x64 ; aucun choix d’édition, build ou capacité approuvé.
- **Options pertinentes :** ce profil s’il est homologué MESS ; sinon un OS serveur x64 réellement pris en
  charge par MESS, avec nouvelle confrontation D02/D03. Linux n’est pas une décision déjà disponible.
- **Avantages, limites et risques :** Windows permet d’étudier l’ordonnanceur natif prévu, mais les services,
  composants HTTP et binaires Python restent à qualifier. Un autre OS peut réutiliser un socle exploité par
  MESS ; il change les wheels, ACL, chemins, supervision et preuves. La CI Ubuntu ne le qualifie pas.
- **Recommandation motivée :** demander d’abord le profil homologué MESS ; conserver Windows Server 2022
  x64 comme candidat de discussion seulement. Éviter de construire un package avant cette réponse.
- **Incompatibilités à vérifier :** D02/D03, durcissement, antivirus/EDR et verrouillage SQLite, droits
  d’installation hors ligne, redémarrages/patching, espace journal/temporaire/backup et capacité D07.
  CPU, RAM, disques et espace libre doivent être relevés ; aucun minimum ni débit garanti n’est démontré.
- **Responsable attendu :** infrastructure et exploitation MESS ; produit pour les usages/volumes C11.
- **Décision précise :** quel OS, édition, build/correctifs, architecture, profil CPU/RAM/volumes et mode de
  maintenance MESS autorise-t-il ? Qui fournit l’hôte et valide les réserves de capacité avec C11 ?
- **Preuve attendue :** fiche de profil approuvée, référence accessible, date, approbateur habilité et réserves
  explicites ; relevé matériel/volumes. Ni inventaire de poste développeur ni capture de CI ne suffisent.
- **Entrées aval après approbation :** MEP-057/059/060 et protocole de charge MEP-071 ; leurs autres
  prérequis demeurent. Les objectifs C11/MEP-022 restent à décider séparément.

## D02 — Python, SQLite lié, ABI et dépendances système

- **Besoin opérationnel :** exécuter Django et les commandes avec un runtime reproductible hors ligne.
- **Obligatoire :** SQLite permanent, runtime identique API/workers, aucune résolution réseau nécessaire
  sur cible ; bibliothèques TLS/confiance et données de fuseau disponibles localement.
- **Proposition du contrat :** CPython 3.13.x x64 privé à l’application, version complète et provenance à
  choisir ; requirements par intervalles, sans verrou de distribution ni wheelhouse cible.
- **Options pertinentes :** CPython 3.13 standard x64 comme candidat ; 3.12 seulement si le support MESS
  ou les composants retenus le justifient. Les deux sont annoncés en développement ; aucune n’est qualifiée
  MESS. Ne pas substituer une ABI libre de GIL, ARM64 ou 32 bits sans nouvelle qualification.
- **Avantages, limites et risques :** 3.13 rejoint la série de la CI exhaustive mais pas son OS/binaire.
  3.12 est une alternative de compatibilité, avec inventaire et validation propres ; un succès local ne
  démontre pas le support MESS. Chaque option conserve le risque de wheel native manquante.
- **Recommandation motivée :** retenir pour arbitrage CPython standard 3.13.x x64, puis figer le correctif,
  l’ABI et le binaire approuvés avec D01. Django 5.2 déclare Python 3.13 compatible ; cela ne qualifie ni
  DRF, ni les transitives, ni l’ensemble cible ([notes Django](https://docs.djangoproject.com/en/5.2/releases/5.2/#python-compatibility)).
- **Incompatibilités à vérifier :** version SQLite réellement liée (`sqlite3.sqlite_version`), extensions
  requises et PRAGMA ; Django 5.2 demande SQLite >= 3.31.0, plancher de compatibilité et non choix MESS
  ([SQLite/Django](https://docs.djangoproject.com/en/5.2/ref/databases/#sqlite-notes)). Inventorier `_ssl`,
  runtime système éventuel, `tzdata`, PyYAML et `rpds-py` transitif de jsonschema : wheels et tags exacts
  OS/CPU/ABI à vérifier dans MEP-057/059. Aucun manque de wheel cible n’est actuellement démontré.
- **Responsable attendu :** exploitation/infrastructure MESS, avec contributeur pour l’inventaire technique.
- **Décision précise :** quel binaire Python complet, ABI, SQLite lié, provenance, empreinte, mode de
  maintenance et dépendances système MESS autorise-t-il ? Qui assure leur patching et transfert hors ligne ?
- **Preuve attendue :** profil runtime approuvé daté, référence/approbateur, liste des composants et réserves
  de qualification ; manifeste et installation du wheelhouse exact à produire par MEP-057/059.
- **Entrées aval après approbation :** MEP-057/059 puis MEP-024/061 ; MEP-054/021 consomment les chemins
  du runtime. Un accord de profil ne remplace pas les essais de distribution et d’installation.

## D03 — Serveur WSGI/ASGI, frontal et topologie

- **Besoin opérationnel :** servir le build React local, l’API, l’admin et les statiques sous une origine HTTPS.
- **Obligatoire :** serveur de production compatible D01/D02, aucun Vite/runserver en exploitation,
  `/api/` et `/admin/` distincts du repli SPA ; Host public conservé, non-cache API, sessions/CSRF inchangés.
  Le contrôle Django doit recevoir le véritable pair transport et un protocole frontal non falsifiable.
- **Proposition du contrat :** WSGI derrière frontal TLS, un hôte API/workers/SQLite ; aucun produit/version
  de serveur ni frontal fourni. HTTPS direct reste une possibilité soumise à qualification distincte.
- **Options pertinentes :** préciser ce profil avec Waitress WSGI et un frontal homologué MESS ; frontal
  local si autorisé, frontal interne distant si la politique réseau l’exige. ASGI n’a pas de besoin
  opérationnel démontré dans ce mandat : le seul point d’entrée existant ne justifie pas une pile de plus.
- **Avantages, limites et risques :** Waitress annonce CPython Windows/Unix et une implémentation Python,
  ce qui motive son étude pour Windows ; il ne fournit pas TLS. Le frontal local réduit les flux ; un
  frontal distant permet une terminaison centralisée mais ajoute pair réseau, protection du lien et ACL.
  Aucun de ces assemblages n’a été essayé sur la cible ([Waitress](https://docs.pylonsproject.org/projects/waitress/en/stable/),
  [TLS et proxy](https://docs.pylonsproject.org/projects/waitress/en/stable/reverse-proxy.html)).
- **Recommandation motivée :** étudier Waitress derrière le frontal TLS effectivement homologué par MESS,
  sous réserve de la preuve d’intégration ci-dessous ; préférer loopback si les deux sont sur le même hôte.
  Ne pas sélectionner Gunicorn pour Windows natif : son positionnement est UNIX
  ([éditeur](https://gunicorn.org/)). Aucun IIS/module, wrapper ou service Windows n’est présumé accepté.
- **Incompatibilités à vérifier :** produit/version/modules/licence/maintenance et distribution hors ligne ;
  paramètres de confiance Waitress qui peuvent retirer `X-Forwarded-Proto` ou réécrire `REMOTE_ADDR`
  ([arguments](https://docs.pylonsproject.org/projects/waitress/en/stable/arguments.html)). Les exemples proxy
  génériques ne valent pas configuration Assess Teams : tester Host avec port, pair réel, proto unique,
  faux en-têtes refusés, TLS/LOGIN et CSRF avant de retenir l’assemblage. Ne pas élargir la confiance
  universellement ni modifier le middleware pour contourner un refus ; arbitrer une autre pile si nécessaire.
- **Responsable attendu :** exploitation MESS pour serveur/frontal, infrastructure et sécurité pour la topologie.
- **Décision précise :** quels serveur/frontal, versions/modules, emplacement, pair transport, ports,
  propriétaire de maintenance et mécanisme de lancement sont autorisés, avec quelles réserves d’intégration ?
- **Preuve attendue :** schéma et nomenclature approuvés datés, référence/approbateurs ; réserves de
  proxy explicites, à lever avant présentation de compatibilité comme démontrée. Essais candidat dans
  MEP-025/034/068 ; aucune tâche ni configuration serveur livrée par MEP-055.
- **Entrées aval après approbation :** MEP-054/057/058/024/063 ; les autres dépendances restent applicables.
