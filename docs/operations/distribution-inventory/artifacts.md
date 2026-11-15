# Provenances et empreintes des agrégats

[Index](README.md). Inventaire relevé le 2026-11-15 ; SHA-256 sur les octets téléchargés.
Les archives sont des pièces d’inventaire, non des composants déjà assemblés ou approuvés pour exploitation.
Le binaire Python 3.13.17 et le précompilé Swagger sont soumis aux refus explicites de [qualification](validation.md).

| Fichier | Source versionnée | SHA-256 |
| --- | --- | --- |
| python-3.13.17-embed-amd64.zip | [upstream](https://www.python.org/ftp/python/3.13.17/python-3.13.17-embed-amd64.zip) | 9e35319bffedab8b36ad44d8f377cb4f1733bcec257a0b6d04d94f01486ddb38 |
| python-3.13.17-embed-amd64.zip.spdx.json | [upstream](https://www.python.org/ftp/python/3.13.17/python-3.13.17-embed-amd64.zip.spdx.json) | 506dffeea8f9f785e58627051c4898e2c30ac3b3c4c3cc59ce8f96e3a6e46247 |
| Python-3.13.18.tar.xz | [upstream](https://www.python.org/ftp/python/3.13.18/Python-3.13.18.tar.xz) | abb0102e6d4ae027509bcb82327d9dd85515b44a3ba8ad538cfc5e9847029f68 |
| caddy_2.11.9_windows_amd64.zip | [upstream](https://github.com/caddyserver/caddy/releases/download/v2.11.9/caddy_2.11.9_windows_amd64.zip) | ad93112d335ee687100c4c9f11bced16ca590377976b7fe7883882b9e797e472 |
| caddy_2.11.9_windows_amd64.sbom | [upstream](https://github.com/caddyserver/caddy/releases/download/v2.11.9/caddy_2.11.9_windows_amd64.sbom) | a9efa5c18e63646db22af6277b43a5969cdc7fc6a5d262871c164ad0ba4a7da9 |
| caddy_2.11.9_checksums.txt | [upstream](https://github.com/caddyserver/caddy/releases/download/v2.11.9/caddy_2.11.9_checksums.txt) | e4e1e43b78299733b19b8aeab8abebcf57aef4f5dae617be125016f9e4e0299f |
| swagger-ui-dist-5.35.0.tgz | [upstream](https://registry.npmjs.org/swagger-ui-dist/-/swagger-ui-dist-5.35.0.tgz) | 1b8e891893404ea4c3558b6a87e2a3e494e7eedba41168c2ece5800a391a6ea6 |
| swagger-ui-v5.35.0-source.tar.gz | [upstream](https://codeload.github.com/swagger-api/swagger-ui/tar.gz/refs/tags/v5.35.0) | d03263e1c65ad147f35c0deeadc937c42f387accef31455d744906b43b6b8a59 |
| swagger-package-lock.json | [upstream](https://raw.githubusercontent.com/swagger-api/swagger-ui/v5.35.0/package-lock.json) | 7c2b062a17b882712ea3a6ed32904a7a283ca777fd94144346b545ef0e942f46 |

Les checksums Caddy publiés contiennent exactement le SHA-256 du ZIP Windows retenu.
Le SBOM Python contient exactement celui de l’archive CPython téléchargée.
La somme du tarball source Python 3.13.18 correspond à sa page de publication officielle.
Pour Swagger, comparer aussi la SHA-512 SRI npm et les fichiers LICENSE/NOTICE dans le tarball.
