# I01 — Provenances, octets et droits contrôlés

[Rapport](runtime-i01-report.md) · [sécurité](runtime-i01-security.md) · [protocole](runtime-i01-protocol.md).
Captures HTTPS du 2026-11-17, à partir de 23:26 UTC (18:26 Toronto), réponses 200.
Les SHA-256 ci-dessous sont recalculés sur les corps bruts sauvegardés, sauf mention contraire.
Les pages/index sont mutables : une reprise doit garder ses propres captures et leur date.
Aucun hash de métadonnée ne prouve un binaire qui n’a pas été téléchargé.

## Pièces Python

| Pièce et provenance officielle | Octets | SHA-256 constaté |
| --- | --- | --- |
| [Source 3.13.18 XZ](https://www.python.org/ftp/python/3.13.18/Python-3.13.18.tar.xz) | 23243936 | abb0102e6d4ae027509bcb82327d9dd85515b44a3ba8ad538cfc5e9847029f68 |
| [Bundle Sigstore source](https://www.python.org/ftp/python/3.13.18/Python-3.13.18.tar.xz.sigstore) | 7428 | cca3dcf0d3be739380ff0d0694b6ab96160d9bdbda29984bea723e548d514ca8 |
| [SBOM source SPDX](https://www.python.org/ftp/python/3.13.18/Python-3.13.18.tar.xz.spdx.json) | 2964859 | 48c1abb8d80ccf42f132c37bd03c8bbd72e73b4007790f677aa77408a43ce5c5 |
| [ZIP embarquable 3.13.17 — banc refusé](https://www.python.org/ftp/python/3.13.17/python-3.13.17-embed-amd64.zip) | 11441267 | 9e35319bffedab8b36ad44d8f377cb4f1733bcec257a0b6d04d94f01486ddb38 |
| `python.exe` extrait du ZIP refusé | mesuré par archive | 7c2fc2b303a4ee3cc14cc17b47bc6e8bca98c78792edd123b846a560da44b203 |
| `LICENSE.txt` du ZIP refusé | texte intégral du ZIP | 62bec384df47b0328307db41455ff6ea2559e5546b394ac69148561b21703120 |
| `Python-3.13.18/LICENSE` dans la XZ | texte intégral source | 78b12c3a81360b357002334f0e70ea0e92eebf7a9b358805c03c48484945f3bb |
| `PCbuild/get_externals.bat` dans la XZ | recette source, non exécutée | 4b32c5a58daac7323abf1576459b8d9a1d12cf784f775796cc8f14951344483c |

Le SBOM **source** n’est pas une nomenclature de binaires Windows obtenus.
Les SHA des DLL du banc restent dans [runtime.md](runtime.md) et les droits natifs dans
[native-evidence.md](native-evidence.md) ; ils ne sont pas extrapolés à un candidat corrigé.

## Canaux d’acquisition examinés

| Capture | SHA-256 du corps téléchargé | Observation |
| --- | --- | --- |
| [Release 3.13.18](https://www.python.org/downloads/release/python-31318/) | 8a86e3d5c08c6cb4df90257a8be665134764733e06feeea6b7aee79b917dd496 | Sources seules, aucun installateur |
| [Répertoire 3.13.18](https://www.python.org/ftp/python/3.13.18/) | 531eff6dd27bf115b8ff996e5a63a97983036f6bc3e8371fe460db3d3dfae1c9 | Tarballs, signatures et SBOM ; aucun PE/ZIP Windows |
| [Téléchargements Windows](https://www.python.org/downloads/windows/) | bb1196f479e2e5f483e44fec62a275392062c552d5dd9c195f1a0f00ce922ac2 | Dernière 3.13 Windows : 3.13.17 |
| [PEP 719](https://peps.python.org/pep-0719/) | 14efbf6dda7b28aa17e0339b3e8082356ea97c1649114a0e3b33c27d15a89b5b | Calendrier source-only |
| [NuGet python x64 — index](https://api.nuget.org/v3-flatcontainer/python/index.json) | aeec5cd78662154be2b351c419cb6b0a5e08a1e35d3ad20d41dac20088c39dfb | 3.13.0 à 3.13.17 ; pas de 3.13.18 |
| [Gestionnaire — index initial](https://www.python.org/ftp/python/index-windows.json) | da13c723601f95eeb8e96f5fbcf7814e800caa0510d5a7a71d088329faa607f9 | 348 entrées, puis recent ; 3.13.13 à 3.13.17 |
| [Gestionnaire — recent](https://www.python.org/ftp/python/index-windows-recent.json) | c6020dba154463c1bf383629108aeff70cff18fdc29e5eb88881def54f1597dd | 606 entrées, puis legacy ; 3.13.0 à 3.13.12 |
| [Gestionnaire — legacy](https://www.python.org/ftp/python/index-windows-legacy.json) | fec4854cad9258a24266381fa553478b71972c9f05a19378c78828c0e36c165d | 135 entrées, fin de chaîne ; aucune 3.13 |
| [Manifeste Windows 3.13.17](https://www.python.org/ftp/python/3.13.17/windows-3.13.17.json) | dda9bc720d8d1aaa612f6ae5b8b7da925b86dd8f8b20ef0560e3550ca8d003db | Versions/types distingués ; ne fournit pas une 3.13.18 |

Les 1089 entrées du gestionnaire ont été lues ; aucune 3.13.18, GIL standard ou autre.
La [documentation Windows 3.13](https://docs.python.org/3.13/using/windows.html) relie NuGet
et distingue full installer, Store et embarquable. Le mode embarquable exclut notamment pip/venv ;
le bootstrap utilisé par MEP-059 reste un montage de banc, sans preuve du mode standard final.
Le [billet de publication](https://blog.python.org/2026/10/python-3152-31410-31318-31216-31118/)
confirme sources seules pour 3.13.18 et binaires pour les séries 3.14/3.15.

## Signatures et licences

Sigstore 4.5.1 a été installé depuis PyPI dans un venv jetable distinct, jamais dans le runtime cible.
La [table officielle Sigstore](https://www.python.org/downloads/metadata/sigstore/) impose pour 3.13
`thomas@python.org` et `https://accounts.google.com` ; ces deux valeurs ont été vérifiées explicitement :

```powershell
<outil-isole>/python.exe -m sigstore verify identity `
  --bundle .cache/c3-i01/Python-3.13.18.tar.xz.sigstore `
  --cert-identity thomas@python.org --cert-oidc-issuer https://accounts.google.com `
  .cache/c3-i01/Python-3.13.18.tar.xz
Get-AuthenticodeSignature -LiteralPath .cache/c3-i01/bench-31317/python.exe
```

Résultats : Sigstore code 0, `OK` ; Authenticode `Valid`, PSF, empreinte certificat
`BC3C0F36FC89EE2CAB2F6A91C724C8C0DB625032`, horodatage Microsoft Public RSA Time Stamping Authority.
Cette vérification a pu consulter les services de confiance du poste ; ce n’est pas une preuve hors ligne de chaîne.
OpenPGP existe aussi pour cette série mais n’a pas été vérifié ; Sigstore a été vérifié cryptographiquement.

La [licence Python 3.13](https://docs.python.org/3.13/license.html) autorise la redistribution source/binaire,
avec conservation des textes et avis PSF, CNRI, BeOpen et CWI ; une version dérivée décrit ses modifications.
Les logiciels incorporés gardent leurs droits : OpenSSL Apache-2.0, Expat/libffi/HACL MIT,
bzip2 bzip2-1.0.6, mpdecimal BSD-2-Clause, zlib Zlib, SQLite domaine public,
liblzma selon ses fichiers incorporés ; pas de relicenciement Apache-2.0 du tout.
La clause Microsoft du LICENSE binaire reste obligatoire sur les systèmes Microsoft,
avec composants et mentions inchangés selon ses conditions ; les droits d’un compilateur propre restent à établir.
Les outils GNU XZ non livrés ne deviennent pas des dépendances cibles.
Les CA de l’hôte et la chaîne PKI interne doivent être inventoriées séparément, sans clé privée dans Git.

Pour reprendre les captures : `Invoke-WebRequest -UseBasicParsing -Uri <URL> -OutFile <cache>`
puis `Get-FileHash -Algorithm SHA256 -LiteralPath <cache>` ; garder UTC/statut/taille et suivre `next`.
Comparer les données structurées et notices, jamais uniquement les versions affichées dans une page.
