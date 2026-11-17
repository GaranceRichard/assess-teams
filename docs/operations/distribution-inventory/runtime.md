# Runtime, OS, CPU et ABI de REF-WIN-01

[Index](README.md) · [provenances](artifacts.md) · [qualification et incompatibilités](qualification.md).

## Profil et limites de vérification

- Hôte de référence d’inventaire : Windows Server 2022 Standard x64, NT 10.0.20348.5873 (KB5136487 du 2026-11-13), CPU AMD64. Aucun OS n’est redistribué.
- Ce correctif/édition fige la référence technique d’inventaire dans la série du [profil courant](../installation-prerequisites.md), sans contrainte nouvelle pour un site MESS. Aucun relevé de VM Server n’est disponible ici.
- La [référence Microsoft](https://learn.microsoft.com/en-us/windows/release-health/windows-server-release-info) confirme ce build publié ; elle ne remplace pas un relevé réel. Les empreintes de l’OS et du Planificateur ne concernent pas le package applicatif : composants fournis par l’hôte, non redistribués.
- Le poste de contrôle est Windows NT 10.0.26200 x64 : son succès ne qualifie pas Windows Server ou MESS.
- Runtime inventorié : CPython standard 3.13.17 AMD64, MSC v.1944, ABI `cp313`, 64 bits, GIL standard. Ni `cp313t`, ni ARM64, ni x86.
- Sondes effectives du ZIP privé : SQLite 3.50.4, OpenSSL 3.5.9 (29 Sep 2026), Expat 2.8.5, zlib 1.3.1. SQLite dépasse le plancher Django 5.2 (3.31).
- Le ZIP embarquable ne fournit ni pip ni venv : ne pas lui appliquer implicitement le bootstrap développeur. Sa préparation et le candidat final restent à qualifier en aval.
- Python 3.13.17 est refusé comme candidat de distribution corrigé : 3.13.18 corrige notamment SSL/Expat ; aucune acceptation de risque.
- Python 3.13.18 est identifié par son archive source exacte ; aucun binaire officiel Windows n’est fourni par cette version. Aucun binaire corrigé ni son ABI mesurée n’est inventé.
- Les wheels `cp313` ont des tags compatibles avec la série standard ; leur installation et import dans le runtime final seront prouvés par MEP-059.
- UCRT et API Windows proviennent de l’hôte ; les DLL VC de l’archive sont 14.51.36247.0 et leur redistribution est encadrée dans LICENSE.txt.

## Sous-composants déclarés par le SBOM Python

Le SBOM partagé comprend aussi des sources non incorporées au ZIP ; la colonne portée évite de les prétendre livrées.
Les empreintes ci-dessous sont celles des sources dans le SBOM, distinctes des fichiers binaires suivants.
Les identifiants de licence complètent les NOASSERTION du SBOM depuis les textes upstream et les notices CPython ; ils ne changent aucun droit.

| Composant | Version | Licence | Portée | SHA-256 source | Provenance |
| --- | --- | --- | --- | --- | --- |
| bzip2 | 1.0.8 | bzip2-1.0.6 | runtime / sources associées | ab8d1b0cc087c20d4c32c0e4fcf7d0c733a95da12cedc6d63b3f0a9af07427e2 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/bzip2-1.0.8.tar.gz) |
| CPython | 3.13.17 | PSF-2.0 + historique Python | runtime / sources associées | 9e35319bffedab8b36ad44d8f377cb4f1733bcec257a0b6d04d94f01486ddb38 | [source](https://www.python.org/ftp/python/3.13.17/python-3.13.17-embed-amd64.zip) |
| expat | 2.8.5 | MIT | runtime / sources associées | 920dde485e15eda0cce8d2310b41d492c534e5e3d89ad407a0b4176dd2ff88fe | [source](https://github.com/libexpat/libexpat/releases/download/R_2_8_5/expat-2.8.5.tar.gz) |
| hacl-star | bb3d0dc8d9d15a5cd51094d5b69e70aa09005ff0 | MIT | runtime / sources associées | e31e4ca10da91c585793c0eaf1b98aee3cb43e3a58d3d8d478593e5a6bd82927 | [source](https://github.com/hacl-star/hacl-star/archive/bb3d0dc8d9d15a5cd51094d5b69e70aa09005ff0.zip) |
| libb2 | 0.98.1 | CC0-1.0 | commun sources ; non livré par ZIP | 53626fddce753c454a3fea581cbbc7fe9bbcf0bc70416d48fdbbf5d87ef6c72e | [source](https://github.com/BLAKE2/libb2/releases/download/v0.98.1/libb2-0.98.1.tar.gz) |
| libffi | 3.4.4 | MIT | runtime / sources associées | 9d802681adfea27d84cae0487a785fb9caa925bdad44c401b364c59ab2b8edda | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/libffi-3.4.4.tar.gz) |
| macholib | 1.0 | MIT | commun sources ; non livré par ZIP | c76f268f5054024e962f2515a0e522baf85313064f6740d80375afc850787a38 | [source](https://files.pythonhosted.org/packages/ec/57/f0a712efc3ed982cf4038a3cee172057303b9be914c32c93b2fbec27f785/macholib-1.0.tar.gz) |
| mpdecimal | 4.0.0 | BSD-2-Clause | runtime / sources associées | 338fac3fb8cdd60f406b6326431338756f58a8af94229ffd9bf1e7c2b1ad71ca | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/mpdecimal-4.0.0.tar.gz) |
| mpdecimal | 2.5.1 | BSD-2-Clause | commun sources ; non livré par ZIP | 9f9cd4c041f99b5c49ffb7b59d9f12d95b683d88585608aa56a6307667b2b21f | [source](https://www.bytereef.org/software/mpdecimal/releases/mpdecimal-2.5.1.tar.gz) |
| openssl | 3.5.9 | Apache-2.0 | runtime / sources associées | d6cf0d9a651f25fe506f6b3dc133a80b9b79a0bc565f570dcf8fdbd597551485 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/openssl-3.5.9.tar.gz) |
| sqlite | 3.50.4.0 | domaine public | runtime / sources associées | fb5ab81f27612b0a7b4861ba655906c76dc85ee969e7a4905d2075aff931e8d0 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/sqlite-3.50.4.0.tar.gz) |
| tcl-core | 8.6.15.0 | TCL | commun sources ; non livré par ZIP | 4c23f0dd3efcbe6f3a22c503a68d147617bb30c4f5290f1eb3eaacf0b460440b | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/tcl-core-8.6.15.0.tar.gz) |
| tk | 8.6.15.0 | TCL | commun sources ; non livré par ZIP | 0ae56d39bca92865f338529557a1e56d110594184b6dc5a91339c5675751e264 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/tk-8.6.15.0.tar.gz) |
| xz | 5.2.5 | liblzma domaine public ; outils GNU hors cible | runtime / sources associées | a15c168e39e87d750c3dc766edc7f19bdda57dacf01e509678467eace91ad282 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/xz-5.2.5.tar.gz) |
| zlib | 1.3.1 | Zlib | runtime / sources associées | e3f3fb32564952006eb18b091ca8464740e5eca29d328cfb0b2da22768e0b638 | [source](https://github.com/python/cpython-source-deps/archive/refs/tags/zlib-1.3.1.tar.gz) |

## Fichiers exécutables et natifs du ZIP contrôlé

| Fichier | SHA-256 binaire |
| --- | --- |
| python.exe | 7c2fc2b303a4ee3cc14cc17b47bc6e8bca98c78792edd123b846a560da44b203 |
| pythonw.exe | 9c1437a2e692e9ec9d8b9eb0fd8a6432f8376510ac81b174437ad6a216c2c84b |
| python313.dll | 26026530507a7389e7892ce130e7c1753b32a2df03ec3721d45ad8c1705d40eb |
| python3.dll | a45d898ba8b796f1883fc2fcd55e4736163dfb7cea825d52e3477f1957dfb45a |
| vcruntime140.dll | d1f4225df2cd877dbf130d5668a021dce3f94118455ff5ec952061c30afc9ce7 |
| vcruntime140_1.dll | a7146c08f89fe5b04541ab507cdb59ff7b44534d4ba3c668a426c6450a03434e |
| pyexpat.pyd | 4095f444c5d0fe9d24c1a46a8630459f8488c5392dc82be9af67f4045ea9c368 |
| select.pyd | f2b8f6008d9e8697700b73fd645a76d83e096e8214a6e31e644de32f56122f6a |
| unicodedata.pyd | 541f46cf1ab49239b008a563eee6762086c7288f64631cb5cf59451cf22fc70c |
| winsound.pyd | be5394496d9ef633dc6d81d95c7816f0b0ffa3e90763af3aa41270fba0c16fe6 |
| _asyncio.pyd | 0e53f227048492830bf0328bbc3bebc336268821c88c1da1ba1711855b51cd01 |
| _bz2.pyd | 0adf0680f54eec173401230df0aa561aa188c7f4d40e5f2ba790d333c6057d8d |
| _ctypes.pyd | 487d9041455132d74ed26c0eae514675c31010a926db0cd6c6f391fcccc66c42 |
| _decimal.pyd | 7e8e5d026e22be2669b2ac6175fece6b7fbe2faf1e456fa4785130832d244955 |
| _elementtree.pyd | 5436c3d722e4b7709d20cb9bbb8385253337651417cc6a5d447f7b9e8a9da7a9 |
| _hashlib.pyd | fc9075f3a836fdcbb826b541f4d1e9382d84c73f830f5f51f8ca3b9ccb9d42cb |
| _lzma.pyd | 09596ee41dadfabe006429f1cbb7505a3006daa80206ae2dd2d0d8d5936b6229 |
| _multiprocessing.pyd | 56bc0f253e74f965d5565377e40737093ee084a8ca4b4347f2f6bb9c15661c6d |
| _overlapped.pyd | b2dcaefadf6194783f24184fd074b83983091d46c6b50e88dc8a652a8569d614 |
| _queue.pyd | aa1bc394ac6ed619b2525e631665431e9fbd798cd7d8374755efed9c3d325539 |
| _socket.pyd | 03ac131ec3fa4c550d36fa7c5cad3601cbe6c8f18e1a65b9bd8a65ce1131f9e1 |
| _sqlite3.pyd | 721707b1a66b51e2c1a3be964f4d5d0c6eb89dc6671b8ea121a10d46f5041338 |
| _ssl.pyd | 74bfe7a396737cf5910cf4a789d9cf4263ba6ba93c994ce8d5e2f61fa972097d |
| _uuid.pyd | 0d7589ac0965d1ad7b19bcdfddc726eefa5896aafa6702d68dc9ca6cd58820dc |
| _wmi.pyd | 927aab8eef564d2dee1bbcf8e11f488789f664eafb4a0d2aacd99e224be2f10a |
| _zoneinfo.pyd | 12603a4fd550248d86c41d6faef73c77b27e20ccf6a942cea1329ae393742e8b |
| libcrypto-3.dll | 75495fe0e079ab00d49be740d3c710a0b94e3f74f9648cb7cc9f768fc7f52319 |
| libffi-8.dll | eff52743773eb550fcc6ce3efc37c85724502233b6b002a35496d828bd7b280a |
| libssl-3.dll | 8957182a9c385bfd9f3f790921de2ddc614cf91f99edbed4e9e5446a46504e32 |
| sqlite3.dll | 9044e1dea980cd0514dc2e266e039320e35b00c6326fd2c2d14c6b3301c8518d |

`LICENSE.txt` SHA-256 : `62bec384df47b0328307db41455ff6ea2559e5546b394ac69148561b21703120` ; conserver intégralement Python/PSF/CNRI/BeOpen/CWI, notices tierces et clause Microsoft.
Cette clause autorise la redistribution inchangée sous ses conditions, sur systèmes Microsoft, sans détacher les composants Microsoft ni supprimer leurs mentions.
Les textes complémentaires des extensions et sources ne deviennent pas Apache-2.0.
XZ/liblzma utilise les notices de ses fichiers incorporés ; le statut global de son dépôt ne relicencie pas le binaire.
Les certificats/clé et la chaîne de confiance du banc sont des entrées privées fournies localement, pas des dépendances à télécharger ni des secrets à inventorier ici.

[Textes natifs hachés et imports PE](native-evidence.md) : preuves complémentaires des composants liés.

La [publication officielle 3.13.18](https://www.python.org/downloads/release/python-31318/) pr?cise les correctifs et l?absence de binaires Windows.

## Préparation du changement — C3 / réserve I01 (2026-11-17)

- Périmètre : rechercher un runtime corrigé pour REF-WIN-01, sans modifier les wheels MEP-059 ni les contrats consommateurs.
- Objectif : décider sur des pièces officielles actuelles si un binaire standard Windows x64 cp313 est réellement qualifiable.
- Effets attendus : publier un rapport de décision et un protocole de reprise ; conserver I01 si une preuve obligatoire manque.
- Risques : confondre source et binaire, compatibilité ABI et sécurité, ou banc embarqué et runtime standard distribuable.
- Vérification : consulter les publications et avis officiels, hacher les pièces obtenues, rejouer les contrôles et distinguer les essais impossibles.
- Documents : `runtime-i01-report.md`, `runtime-i01-sources.md` et `runtime-i01-protocol.md` dans ce dossier ; aucun outil produit prévu.

Ce préalable précède les essais C3. L’inventaire historique ci-dessus reste une preuve MEP-057,
avec ses composants et refus initiaux ; I02, I03 et les statuts canoniques restent inchangés.
Le périmètre documentaire comprend aussi `runtime-i01-security.md`, `runtime-i01-checks.md` et `runtime-i01-evidence.md` : avis amont, contrôles extractibles et résultats C3. Ces exemples de qualification restent manuels, hors produit et hors pipeline.

## Décision C3 — 2026-11-17

**I01 reste ouverte (verdict B).** Le [rapport dédié](runtime-i01-report.md) consigne les canaux officiels vérifiés, les octets/signatures, les avis actuels et les refus réellement reproduits. Le [protocole de reprise](runtime-i01-protocol.md) exige un candidat corrigé complet avant qualification ; aucune acceptation du banc 3.13.17 n’en découle.
