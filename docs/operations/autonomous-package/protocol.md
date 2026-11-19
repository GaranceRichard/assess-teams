# Reconstruction et vérification MEP-024

[Contrat et plan](README.md). Toutes les commandes partent du worktree propre du SHA complet
retenu, sur le poste de préparation. Les sorties doivent être absentes. Python/pip, Node/npm,
Git et les outils de qualification sont réservés à ce poste ; aucun n'est copié implicitement.

## Entrées

- Sources commitées propres, version existante `package.json`, schéma MEP-021 et migrations.
- Sous-artefact MEP-058 qualifié : contrôler son SHA-256 externe puis `verify.mjs`.
- Quinze wheels originaux MEP-059 : `python_wheelhouse.py verify`.
- Caddy 2.11.9/Go 1.27.3 et notices MEP-057, préparés par la commande ci-dessous.
- I01 reste ouverte : aucun paramètre runtime ou dérogation n'est accepté.

La recherche runtime est reprise sur les pages officielles Windows/release 3.13.18,
NuGet et les trois index Windows (chaîne `next` complète). Les captures du 19 novembre
2026 retrouvent 3.13.17 au maximum dans les canaux binaires examinés ; aucune entrée
corrigée qualifiable. Leur provenance, statut HTTP, UTC, taille et SHA-256 sont joints
aux preuves hors Git. Le [protocole C3](../distribution-inventory/runtime-i01-protocol.md)
reste obligatoire pour tout nouveau candidat, bibliothèques natives et droits compris.

## Préparer Caddy

```powershell
backend/.venv/Scripts/python.exe scripts/distribution/package_caddy.py `
  --cache .cache/mep-024/caddy-cache --output build/mep-024/caddy --fetch
```

`--fetch` autorise uniquement la collecte sur le poste de préparation. Sans cette option,
la même commande exige un cache complet et ne contacte aucun serveur. Les URLs sont celles
des tables MEP-057 ; archives, h1 Go et textes originaux sont contrôlés avant inclusion.
La préparation conserve ZIP original, checksums, SBOM, binaire, licence Caddy, licence Go
et notices de chaque module. Les archives de sources Go restent au cache hors package.

## Frontend normal au même SHA

Utiliser le générateur MEP-058 existant, jamais le build Pages. Si les entrées Swagger
sont inchangées par rapport à une remise qualifiée, recopier ses sorties dans un staging
neuf : contenu de `static/swagger-ui/`, puis les trois `provenance/*-stats.json` à sa racine.
Comparer préalablement les empreintes des entrées originales à celles du checkout.
Puis exécuter :

```powershell
node scripts/distribution/frontend-artifact.mjs build/mep-024/swagger-input build/mep-024/frontend
node scripts/distribution/verify.mjs build/mep-024/frontend
```

Cette commande refait le build normal par le mécanisme propriétaire et enregistre le SHA
courant ; aucune recompilation Swagger n'est nécessaire aux entrées identiques.
Si une entrée Swagger, frontend ou configuration change, appliquer la requalification
MEP-058 correspondante ; le présent assemblage n'accorde aucune nouvelle qualification.

## Assembler le candidat incomplet

```powershell
$source = (git rev-parse HEAD).Trim()
backend/.venv/Scripts/python.exe scripts/distribution/package_assemble.py `
  --source $source --frontend build/mep-024/frontend `
  --caddy build/mep-024/caddy --output build/mep-024/assess-teams-REFUSED
```

Sorties : arbre, ZIP relu octet pour octet et reçu `.receipt.json` externe contenant
SHA source, SHA-256 du manifeste, SHA-256 et taille ZIP. Le manifeste couvre chaque fichier,
les sources Git, versions/provenances/destinations, notices, commandes réellement livrées,
limitations et refus I01. Les statiques Django/admin/DRF restent dans les wheels originaux ;
aucun collectstatic, création SQLite ou installation n'est réalisé.

Les dates ZIP sont fixées au 1980-01-01. Les composants exécutables sont reproductibles
aux mêmes entrées ; les diagnostics Webpack et la version de compression peuvent modifier
l'identité binaire globale. Aucune égalité entre archives à entrées différentes n'est promise.

## Vérifier après copie sans Node/npm

Transmettre le SHA source et le SHA-256 du manifeste par un canal de confiance distinct.
Utiliser une copie fiable de `verify-package.ps1`, depuis la source Git identifiée ou après
contrôle de son propre SHA-256 ; un vérificateur reçu avec une archive non authentifiée
ne s'authentifie pas lui-même.

```powershell
powershell -NoProfile -File scripts/distribution/verify-package.ps1 `
  -Package <arbre-copie> -ManifestSha256 <sha256-manifeste> -Source <sha-git> -IntegrityOnly
```

Code 0 signifie exclusivement intégrité du candidat partiel. Sans `-IntegrityOnly`, le
contrôle refuse toujours la remise installable avec I01. Pour la vérification sémantique
complète sur le poste de préparation, utiliser `package_verify.py <arbre>` avec
`--manifest-sha256`, `--source` et éventuellement `--integrity-only`. Ce contrôle réutilise
les vérificateurs propriétaires et confronte les fichiers backend aux blobs Git.

## Tests

```powershell
backend/.venv/Scripts/python.exe -m unittest discover -s scripts/distribution -p test_python_wheelhouse.py -v
npm run build:demo
$env:MEP024_CANDIDATE = '<arbre-reel-assemble>'
backend/.venv/Scripts/python.exe -m unittest discover -s scripts/distribution -p test_package_refusals.py -v
Remove-Item Env:MEP024_CANDIDATE
```

Les dix tests wheels existants et dix tests portables d'assemblage sont exécutés par le
gate repository existant, sans changement de sélection CI. Les contre-épreuves d'intégration
utilisent uniquement des copies temporaires du candidat réel désigné ; la référence reste
inchangée. La CI Linux ne dispose pas de cet artefact de préparation Windows externe et
ne prétend pas rejouer cette qualification locale. Le pré-push et sa CI indépendante restent
requis selon leur plan effectif. Aucun statut canonique n'est modifié.
