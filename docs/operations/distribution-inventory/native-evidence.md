# Notices natives et imports des binaires contrôlés

[Index](README.md) · [runtime et réserves](runtime.md).

## Textes natifs des sources associées

Sources rapprochées des hashes SHA-256 du SBOM Python exact ; les chemins des textes restent ceux des archives.
Les outils de build contenus dans ces archives ne sont pas distribués avec leurs bibliothèques runtime.
SQLite comporte une dédicace au domaine public dans ses en-têtes, et non un LICENSE racine.
Le COPYING de XZ 5.2.5 distingue liblzma (domaine public) des outils/scripts GNU et du système de build.
Ces derniers ne sont pas incorporés comme commandes cible par Python. Les notices Microsoft de CPython restent applicables au code du compilateur.

| Composant | Texte de référence | SHA-256 du fichier |
| --- | --- | --- |
| bzip2 1.0.8 | cpython-source-deps-bzip2-1.0.8/LICENSE | c6dbbf828498be844a89eaa3b84adbab3199e342eb5cb2ed2f0d4ba7ec0f38a3 |
| expat 2.8.5 | expat-2.8.5/COPYING | 31b15de82aa19a845156169a17a5488bf597e561b2c318d159ed583139b25e87 |
| hacl-star bb3d0dc8d9d15a5cd51094d5b69e70aa09005ff0 | hacl-star-bb3d0dc8d9d15a5cd51094d5b69e70aa09005ff0/LICENSE | c5accbbd8546e94c34aed24afe689a617627d18eed5a6c48277e48db57c23851 |
| libffi 3.4.4 | cpython-source-deps-libffi-3.4.4/LICENSE | 2c9c2acb9743e6b007b91350475308aee44691d96aa20eacef8e199988c8c388 |
| libffi 3.4.4 | cpython-source-deps-libffi-3.4.4/LICENSE-BUILDTOOLS | e67978cd18816c0cb7d29aaaacde7b7447402c2fb321a051698890a8eaedda94 |
| mpdecimal 4.0.0 | cpython-source-deps-mpdecimal-4.0.0/COPYRIGHT.txt | 2713324211652ce4a60e6e21e54f9dc3004299e591b0933a352f1a89c5fb53c2 |
| openssl 3.5.9 | cpython-source-deps-openssl-3.5.9/LICENSE.txt | 7d5450cb2d142651b8afa315b5f238efc805dad827d91ba367d8516bc9d49e7a |
| xz 5.2.5 | cpython-source-deps-xz-5.2.5/COPYING | bcb02973ef6e87ea73d331b3a80df7748407f17efdb784b61b47e0e610d3bb5c |
| xz 5.2.5 | cpython-source-deps-xz-5.2.5/COPYING.GPLv2 | 8177f97513213526df2cf6184d8ff986c675afb514d4e68a404010521b880643 |
| xz 5.2.5 | cpython-source-deps-xz-5.2.5/COPYING.GPLv3 | 8ceb4b9ee5adedde47b31e975c1d90c73ad27b6b165a1dcd80c7c545eb65b903 |
| xz 5.2.5 | cpython-source-deps-xz-5.2.5/COPYING.LGPLv2.1 | dc626520dcd53a22f727af3ee42c770e56c97a64fe3adb063799d8ab032fe551 |
| zlib 1.3.1 | cpython-source-deps-zlib-1.3.1/LICENSE | 845efc77857d485d91fb3e0b884aaa929368c717ae8186b66fe1ed2495753243 |
| sqlite 3.50.4.0 | cpython-source-deps-sqlite-3.50.4.0/sqlite3.h | abd1514e0351f79393d1be882830afdb40a8099e8257f311f0bfdf8486f11bea |

## Imports PE contrôlés

Lecture des tables Import Directory des PE du ZIP privé, des deux wheels natives et de Caddy.
Le relevé identifie les DLL liées ; ce n’est pas une capture exhaustive des LoadLibrary dynamiques ni un relevé de l’OS Server.
Les DLL Python/VC/OpenSSL/SQLite/libffi nommées sont fournies par le ZIP contrôlé ; les API-MS-WIN-CRT et DLL Windows sont fournies par l’hôte.
Aucune bibliothèque native tierce supplémentaire à ces composants n’est identifiée par ces imports.
La sonde d’import effectif des bibliothèques et du fuseau complète ce relevé sur Windows 10.0.26200.

| PE contrôlé | Imports DLL |
| --- | --- |
| python313/libcrypto-3.dll | ADVAPI32.dll, api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-environment-l1-1-0.dll, api-ms-win-crt-filesystem-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, api-ms-win-crt-time-l1-1-0.dll, api-ms-win-crt-utility-l1-1-0.dll, CRYPT32.dll, KERNEL32.dll, USER32.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/libffi-8.dll | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, VCRUNTIME140.dll |
| python313/libssl-3.dll | api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-environment-l1-1-0.dll, api-ms-win-crt-filesystem-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, api-ms-win-crt-time-l1-1-0.dll, api-ms-win-crt-utility-l1-1-0.dll, KERNEL32.dll, libcrypto-3.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/python3.dll |  |
| python313/python313.dll | ADVAPI32.dll, api-ms-win-core-path-l1-1-0.dll, api-ms-win-crt-conio-l1-1-0.dll, api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-environment-l1-1-0.dll, api-ms-win-crt-filesystem-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-locale-l1-1-0.dll, api-ms-win-crt-math-l1-1-0.dll, api-ms-win-crt-process-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, api-ms-win-crt-time-l1-1-0.dll, bcrypt.dll, KERNEL32.dll, VCRUNTIME140.dll, VERSION.dll, WS2_32.dll |
| python313/sqlite3.dll | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-math-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, api-ms-win-crt-time-l1-1-0.dll, api-ms-win-crt-utility-l1-1-0.dll, KERNEL32.dll, VCRUNTIME140.dll |
| python313/vcruntime140.dll | api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll |
| python313/vcruntime140_1.dll | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, VCRUNTIME140.dll |
| python313/pyexpat.pyd | api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-environment-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/select.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/unicodedata.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/winsound.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, USER32.dll, VCRUNTIME140.dll, WINMM.dll |
| python313/_asyncio.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_bz2.pyd | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_ctypes.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, libffi-8.dll, ole32.dll, OLEAUT32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_decimal.pyd | api-ms-win-crt-convert-l1-1-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-locale-l1-1-0.dll, api-ms-win-crt-math-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_elementtree.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_hashlib.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, libcrypto-3.dll, python313.dll, VCRUNTIME140.dll |
| python313/_lzma.pyd | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_multiprocessing.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/_overlapped.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/_queue.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/_socket.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, IPHLPAPI.DLL, KERNEL32.dll, python313.dll, RPCRT4.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/_sqlite3.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, sqlite3.dll, VCRUNTIME140.dll |
| python313/_ssl.pyd | api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, CRYPT32.dll, KERNEL32.dll, libcrypto-3.dll, libssl-3.dll, python313.dll, VCRUNTIME140.dll, WS2_32.dll |
| python313/_uuid.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, RPCRT4.dll, VCRUNTIME140.dll |
| python313/_wmi.pyd | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, OLEAUT32.dll, PROPSYS.dll, python313.dll, VCRUNTIME140.dll, VCRUNTIME140_1.dll |
| python313/_zoneinfo.pyd | api-ms-win-crt-runtime-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/python.exe | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-locale-l1-1-0.dll, api-ms-win-crt-math-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| python313/pythonw.exe | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-locale-l1-1-0.dll, api-ms-win-crt-math-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-stdio-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| abi-probe/rpds/rpds.cp313-win_amd64.pyd | api-ms-win-core-synch-l1-2-0.dll, api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, bcryptprimitives.dll, KERNEL32.dll, ntdll.dll, python313.dll, VCRUNTIME140.dll |
| abi-probe/yaml/_yaml.cp313-win_amd64.pyd | api-ms-win-crt-heap-l1-1-0.dll, api-ms-win-crt-runtime-l1-1-0.dll, api-ms-win-crt-string-l1-1-0.dll, KERNEL32.dll, python313.dll, VCRUNTIME140.dll |
| caddy/caddy.exe | kernel32.dll |
