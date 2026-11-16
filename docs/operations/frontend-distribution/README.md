# MEP-058 — Frontend compilé et ressources locales

## Préparation du changement — 2026-11-15

- Périmètre : produire le build normal et les ressources Swagger locales depuis les entrées MEP-057 au commit `6aec11f`, sans assembler le package MEP-024.
- Objectif : fournir des octets frontend utilisables sans Node ni téléchargement sur cible, avec provenance, versions, notices et empreintes vérifiables.
- Effets attendus : séparer application compilée et statiques Swagger reconstruits, avec un manifeste contrôlable et un contrat de routage pour leur intégration ultérieure.
- Risques : refuser le précompilé Swagger I02, les ressources manquantes, la démonstration substituée au produit et les composants incorporés sans version ou droit établi.
- Vérification : reconstruire depuis les verrous, examiner les modules réellement incorporés, contrôler les notices et exercer le navigateur avec accès Internet refusé.
- Fichier : `scripts/distribution/swagger-build.cjs`
- Fichier : `scripts/distribution/swagger-notices.mjs`
- Fichier : `scripts/distribution/swagger-inputs.mjs`
- Fichier : `scripts/distribution/frontend-artifact.mjs`
- Fichier : `backend/config/settings_production.py`
- Fichier : `backend/tests/test_swagger_local_assets.py`

La préparation précède les scripts du lot. Le premier build normal de l'existant a réussi sans modification.
Les métadonnées manquantes du verrou upstream seront reprises des tables MEP-057 et confrontées aux archives exactes.
Les textes par référence conserveront leurs attributions originales avec les termes complets déjà établis par cet inventaire.
Le rendu Swagger de production doit consommer ces fichiers locaux et désactiver son validateur distant ;
ces options existantes de Spectacular seront fixées sans ajouter de serveur, de bibliothèque ni de paramètre d'installation.
La vérification portera sur le HTML réel et sur le refus du rendu CDN actuel avant correction.
Les paramètres d'installation de MEP-021 et le wheelhouse de MEP-059 restent indépendants.
Le statut canonique ne change pas ; une clôture fonctionnelle sera proposée après publication et CI verte.

## Contrat de sortie

Le sous-artefact contient `frontend/` (build produit normal, neuf fichiers dont six mentions légales),
`static/swagger-ui/` (six ressources navigateur, licences, notices et inventaire des modules),
`provenance/` (rapports Webpack) et `manifest.json` (version, SHA source, entrées et SHA-256 de chaque fichier).
Les sources, npm, Node, compilateurs, dépendances de test et démo ne sont pas nécessaires sur cible.
La version applicative reste `0.0.0` ; le SHA et les empreintes distinguent les candidats, sans inventer une release produit.

La reconstruction Swagger réutilise les configurations upstream `stylesheets`, `bundle` et `standalone`.
Seules les métadonnées de build sont fixées : identité de l'archive source et date reproductible à l'époque Unix.
La substitution `*zoom` upstream est conservée ; le lien à la source map CSS de préparation est retiré de la copie distribuée.
Aucun code tiers fonctionnel ni dépendance n'est remplacé, aucune nouvelle pile documentaire n'est introduite.
Les octets extraits de l'archive source sont vérifiés avant compilation ; les 114 archives de composants relevés
sont contrôlées contre MEP-057 puis comparées aux fichiers installés, notices comprises.
Le relevé est conservateur : modules des rapports et sources Sass, pas une affirmation que chaque export est exécuté.

## Reproduction sur poste de préparation

Préparer les runtimes développeur selon les commandes existantes du dépôt, puis collecter
l'[archive Swagger exacte](../distribution-inventory/artifacts.md) dans `.cache/mep-058/`.
Son SHA-256 est contrôlé par le script ; extraire `swagger-ui-5.35.0` dans ce même dossier.
Ne jamais utiliser les JavaScript présents dans son `dist/` comme sortie de remplacement.

```powershell
npm ci --prefix frontend
npm ci --prefix .cache/mep-058/swagger-ui-5.35.0 --ignore-scripts --no-audit --no-fund
node scripts/distribution/swagger-build.cjs .cache/mep-058/swagger-ui-5.35.0 build/mep-058/swagger
node scripts/distribution/swagger-notices.mjs .cache/mep-058/swagger-ui-5.35.0 build/mep-058/swagger
node scripts/distribution/frontend-artifact.mjs build/mep-058/swagger build/mep-058/artifact
node scripts/distribution/verify.mjs build/mep-058/artifact
npm run build:demo
node --test scripts/distribution/verify.test.mjs
node scripts/distribution/offline-test.mjs build/mep-058/artifact
```

Le générateur exige des sources produit commitées, refuse un dossier de sortie existant, les fichiers `.env*`
frontend et les variables `VITE_*` non enregistrées. L'installation upstream ignore notamment les scripts Scarf.
Le collecteur peut télécharger les archives exactes sur le poste de préparation ; leur cache permet sa reprise hors réseau.
Le build démo ci-dessus sert exclusivement au test de refus par substitution réelle ; il n'entre jamais dans l'artefact.
Les contrôles applicatifs et la publication utilisent toujours les gates canoniques du dépôt.

## Intégration ultérieure

Exposer `frontend/` à la racine de l'origine et `static/` sous `/static/`, sans transformer une ressource absente en HTML.
Les routes SPA du manifeste retombent sur `frontend/index.html` ; `/api/`, `/admin/`, `/static/`, `/assets/` et `/legal/`
gardent leur traitement serveur. L'API reste sur la même origine, avec les mêmes cookies/CSRF et droits.
La configuration de production Spectacular consomme `/static/swagger-ui/`, désactive le validateur distant
et refuse la configuration du schéma par query string. Le schéma reste `/api/schema/`.
Les statiques Django/admin/DRF restent fournies par leurs wheels : leur collecte et l'assemblage ne sont pas anticipés ici.

Le serveur HTTP du test est une sonde de qualification des fichiers, pas le serveur MESS à installer.
TLS, configuration unique, services Windows, wheelhouse et assemblage complet restent aux PBI propriétaires.
Les [résultats et refus](qualification.md), [provenance](provenance.md) et [avis npm](security.md) bornent la remise.
