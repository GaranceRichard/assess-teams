# Environnement expérimental

Image officielle `python:3.13.18-slim` :
`sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90`.

```json
{
  "python": "3.13.18 (main, Nov  5 2026, 07:59:38) [GCC 14.2.0]",
  "platform": "Linux-6.18.33.2-microsoft-standard-WSL2-x86_64-with-glibc2.41",
  "sqlite": "3.46.1",
  "os_release": "PRETTY_NAME=\"Debian GNU/Linux 13 (trixie)\"\nNAME=\"Debian GNU/Linux\"\nVERSION_ID=\"13\"\nVERSION=\"13 (trixie)\"\nVERSION_CODENAME=trixie\nDEBIAN_VERSION_FULL=13.7\nID=debian\nHOME_URL=\"https://www.debian.org/\"\nSUPPORT_URL=\"https://www.debian.org/support\"\nBUG_REPORT_URL=\"https://bugs.debian.org/\"\n",
  "freeze": "asgiref==3.13.0\nattrs==26.1.0\ncoverage==7.17.2\nDjango==5.2.19\ndjangorestframework==3.16.1\ndrf-spectacular==0.28.0\ninflection==0.5.1\niniconfig==2.3.1\njsonschema==4.26.0\njsonschema-specifications==2025.9.1\npackaging==26.3\npluggy==1.7.0\nPygments==2.21.0\npytest==8.4.2\npytest-cov==6.3.0\npytest-django==4.14.0\nPyYAML==6.0.3\nreferencing==0.37.0\nrpds-py==2026.9.1\nruff==0.17.4\nsqlparse==0.6.1\nuritemplate==4.2.0\n"
}
```

## Contraintes extraites du log du shard 4 du 11 novembre

```text
Django==5.2.19
PyYAML==6.0.3
asgiref==3.13.0
attrs==26.1.0
coverage==7.17.2
djangorestframework==3.16.1
drf-spectacular==0.28.0
inflection==0.5.1
iniconfig==2.3.1
jsonschema==4.26.0
jsonschema-specifications==2025.9.1
packaging==26.3
pluggy==1.7.0
pygments==2.21.0
pytest==8.4.2
pytest-cov==6.3.0
pytest-django==4.14.0
referencing==0.37.0
rpds-py==2026.9.1
ruff==0.17.4
sqlparse==0.6.1
uritemplate==4.2.0
```

La sonde mesure aussi DELETE, FULL (=2), DEFERRED et 5000 ms à l’ouverture.
Le code du pair applique ensuite `PRAGMA busy_timeout=100` avant `ready`.
Les versions Python des dépendances correspondent à la CI ; le noyau, la distribution,
le stockage et SQLite ne sont pas réputés identiques au runner.
La version de SQLite effectivement chargée dans le run historique n’est pas inscrite dans ces logs.
