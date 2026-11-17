# I01 — Revue sécurité au 2026-11-17

[Rapport](runtime-i01-report.md) · [sources et octets](runtime-i01-sources.md).
Revue des versions du banc refusé et de la recette source 3.13.18, sans verdict de sécurité global.
La plage d’un avis et l’exposition de l’application sont deux preuves distinctes.
Aucun paramètre de sécurité n’a été modifié, aucune exploitation destructive exécutée.

## Correctifs Python absents du banc 3.13.17

La [publication 3.13.18](https://www.python.org/downloads/release/python-31318/) et le
[changelog officiel](https://docs.python.org/3.13/whatsnew/changelog.html#python-3-13-18-final)
identifient les corrections suivantes ; l’usage de SSL, XML ou fichiers dépend du chemin exercé.

| Avis / correction | Portée de la vérification et décision |
| --- | --- |
| CVE-2026-115557 | Blocage de clés intermédiaires eMudhra compromises dans ssl ; 3.13.17 n’a pas ce correctif. Refus conservé, sans substituer une modification locale du magasin CA |
| CVE-2026-77214 et CVE-2026-102633 | Expat embarqué passe de 2.8.5 à 2.9.0 dans la source 3.13.18 ; la sonde du banc reste à 2.8.5 |
| CVE-2024-3220 | Chargement par défaut de fichiers mimetypes sur Windows corrigé ; concerne le profil Windows |
| CVE-2026-114583 | Protection des liens dans tarfile.tar_filter ; ne pas considérer l’extraction d’une source comme preuve du correctif binaire |
| gh-87720, gh-157579, gh-160300 | Corrections email, TemporaryDirectory et cookies négatifs également recensées ; aucun backport local au banc |

L’[annonce PSF sur eMudhra](https://discuss.python.org/t/information-for-python-users-regarding-emudhra-emsign-ca-certificate-security-incident/109576)
confirme l’incident de confiance ; une signature de code PSF valide n’efface pas ces défauts runtime.
Les tests C3 refusent la version réelle 3.13.17 ; ils ne prétendent pas exploiter ces CVE.

## Composants : une 3.13.18 reconstruite sans revue resterait insuffisante

La recette `PCbuild/get_externals.bat` de la source obtenue référence encore OpenSSL 3.5.9,
SQLite 3.50.4.0, zlib 1.3.1, XZ 5.2.5, libffi 3.4.4 et bzip2 1.0.8.
Ces entrées ne sont pas des binaires Windows corrigés livrés par C3.

| Composant / source officielle relue | Avis actuel / conséquence bornée |
| --- | --- |
| [Expat, Changes 2.10.0 du 2 novembre](https://github.com/libexpat/libexpat/blob/R_2_10_0/expat/Changes) | CVE-2026-113351 (reset), CVE-2026-115506 (amplification), CVE-2026-117610 (sous-parser), CVE-2026-118370 (entiers). Correctifs ultérieurs à 2.9.0 ; exposition/backport à établir avant admission |
| [OpenSSL, série 3.5](https://openssl-library.org/news/vulnerabilities-3.5/) | Avis des 10/17 novembre : CVE-2026-107493, CVE-2026-124709, CVE-2026-35190, CVE-2026-88823, CVE-2026-107496, CVE-2026-88822, CVE-2026-95691, CVE-2026-95692 ; plages incluant 3.5.9, corrigées en 3.5.10. Fonctions PEM/CMS, Suite B, QUIC et AES-GCM-SIV distinctes ; leur exposition n’est pas prouvée par le simple import ssl |
| [zlib 1.4 du 4 novembre](https://www.zlib.net/) | Corrections mémoire, notamment inflateGetDictionary et inflateSync, avec plage 1.2.8–1.3.2 annoncée ; 1.3.1 y entre. Vérifier les API réellement appelées, pas uniquement zlib.compress ; la recette source inchangée ne clôt pas cette analyse |
| [XZ/liblzma](https://tukaani.org/xz/) | CVE-2026-34743 concerne lzma_index_append sur versions jusqu’à 5.8.2 ; GHSA-5qpq-xqfv-j9pg concerne la réinitialisation après échec d’allocation jusqu’à 5.8.3. 5.2.5 demande qualification des chemins incorporés |
| [XZ/liblzma — exclusions précises](https://tukaani.org/xz/) | CVE-2025-31115 vise 5.3.3alpha–5.8.0, pas 5.2.5 ; CVE-2024-3094 vise 5.6.0/5.6.1, pas 5.2.5. CVE-2024-47611 et CVE-2022-1271 visent les commandes Windows/xzgrep, non les outils absents du ZIP |
| [SQLite, CVE](https://sqlite.org/cves.html) et [releases](https://sqlite.org/changes.html) | Revue de l’avertissement upstream sur l’interprétation des CVE et des corrections postérieures à 3.50.4 ; correction 3.54.1 décrite pour builds 32 bits, non attribuée au banc x64. Aucun « SQLite sûr » déduit du plancher Django |

Ces constats élargissent l’entrée manquante : **pas seulement un binaire portant le numéro 3.13.18**.
Le futur candidat doit couvrir les avis applicables avec versions/patchs et éléments d’exposition précis.
Les avis conditionnels ne sont ni des exploits Assess Teams démontrés, ni des risques acceptés.
La correction d’un composant partagé exige requalification, sans échange manuel de DLL dans un ZIP signé.

Les autres composants (bzip2, HACL, libffi, mpdecimal, VC/UCRT, notices et confiance CA) restent à
rapprocher d’un candidat binaire réel et de sa chaîne. Aucun certificat d’absence de vulnérabilité
n’est délivré pour eux ; Tcl/Tk et outils de build sont distingués s’ils sont effectivement inclus.
L’arrêt d’admission sur des refus établis n’est pas une qualification exhaustive de la recette source.

## Empreintes des captures de sécurité

Corps bruts HTTPS 200 sauvegardés dans le cache C3, hors Git ; titres et constats ci-dessus conservés.

| Capture | SHA-256 |
| --- | --- |
| OpenSSL série 3.5 | e248f21dd76ff65a3e623ae6c570b98346f0bfe6843fbb61eeebf436f7116b82 |
| Expat Changes tag R_2_10_0 | b200119004e21b89102f35b551bcdd26a479d0b882c98435e6b53e08ca75dd39 |
| zlib, page upstream | 0f73c05d4ae14a9a6cb14a8374547d448f456daf205fbcffb1e6bbfebed351c4 |
| XZ, page upstream | e7bddb247b43d4f745b8b73ca3a3af04645b0237b9662787d8cbd5ef8f58e08b |
| SQLite, changes | 50e63c6da18d2efd035d0f66d98098384fb4d64119ee578dda5b5aadfdddaf6b |
| Annonce eMudhra, JSON Discourse `/t/109576.json` | 81b8d4d78b3e2d7a738a8dae87598a02c0a61b7fbfa6025da8f45743e7cb35d9 |
