# Python cible — fermeture Windows CPython 3.13

[Index](README.md) · [notices](python-notices.md) · [runtime et limites](runtime.md).

15 distributions : trois racines applicatives de `backend/requirements.txt`, Waitress ajouté par REF-WIN-01, puis transitives. Aucun extra optionnel.
Les marqueurs sont évalués pour Windows / CPython 3.13, et non pour le Python 3.12 de préparation.
`typing_extensions==4.16.0` est requis sur le poste 3.12, pas sur la cible 3.13 ; il est exclu du verrou cible.
`pip download --python-version` seul ne change pas tous les marqueurs de plateforme/interpréteur du résolveur.
Les roues ont été téléchargées uniquement comme pièces de contrôle ; aucun wheelhouse livré ni installation MEP-059 revendiquée.

## Composants et liens transitifs

| Composant | Version | Requires-Python | Licence établie | Dépendances actives |
| --- | --- | --- | --- | --- |
| asgiref | 3.13.0 | >=3.11 | MIT | aucune |
| attrs | 26.1.0 | >=3.9 | MIT | aucune |
| Django | 5.2.19 | >=3.10 | BSD-3-Clause | asgiref>=3.8.1, sqlparse>=0.3.1, tzdata; sys_platform == "win32" |
| djangorestframework | 3.16.1 | >=3.9 | BSD-3-Clause | django>=4.2 |
| drf-spectacular | 0.28.0 | >=3.7 | BSD-3-Clause | Django>=2.2, djangorestframework>=3.10.3, uritemplate>=2.0.0, PyYAML>=5.1, jsonschema>=2.6.0, inflection>=0.3.1 |
| inflection | 0.5.1 | >=3.5 | MIT | aucune |
| jsonschema | 4.26.0 | >=3.10 | MIT | attrs>=22.2.0, jsonschema-specifications>=2023.03.6, referencing>=0.28.4, rpds-py>=0.25.0 |
| jsonschema-specifications | 2025.9.1 | >=3.9 | MIT | referencing>=0.31.0 |
| PyYAML | 6.0.3 | >=3.8 | MIT | aucune |
| referencing | 0.37.0 | >=3.10 | MIT | attrs>=22.2.0, rpds-py>=0.7.0 |
| rpds-py | 2026.9.1 | >=3.11 | MIT | aucune |
| sqlparse | 0.6.1 | >=3.10 | BSD-3-Clause | aucune |
| tzdata | 2026.6 | >=2 | Apache-2.0 + données IANA domaine public | aucune |
| uritemplate | 4.2.0 | >=3.9 | BSD-3-Clause OR Apache-2.0 | aucune |
| waitress | 3.0.2 | >=3.9.0 | ZPL-2.1 | aucune |

## Verrou extractible destiné à MEP-059

Copier ce bloc dans un fichier de travail ; conserver les URLs et noms des wheels de la table suivante.
Le mode `--require-hashes --only-binary=:all:` et ces quinze pins interdisent une nouvelle résolution flottante.

```text
asgiref==3.13.0 --hash=sha256:f9596a2434512686473d50f96ff6207fbba49ae1a785dfac614df4aeb085674d
attrs==26.1.0 --hash=sha256:c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309
Django==5.2.19 --hash=sha256:5965d974a5218a2b68a11dd1276434707f23886525c23f0598eccedaf4f4ca00
djangorestframework==3.16.1 --hash=sha256:33a59f47fb9c85ede792cbf88bde71893bcda0667bc573f784649521f1102cec
drf-spectacular==0.28.0 --hash=sha256:856e7edf1056e49a4245e87a61e8da4baff46c83dbc25be1da2df77f354c7cb4
inflection==0.5.1 --hash=sha256:f38b2b640938a4f35ade69ac3d053042959b62a0f1076a5bbaa1b9526605a8a2
jsonschema==4.26.0 --hash=sha256:d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce
jsonschema-specifications==2025.9.1 --hash=sha256:98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe
PyYAML==6.0.3 --hash=sha256:79005a0d97d5ddabfeeea4cf676af11e647e41d81c9a7722a193022accdb6b7c
referencing==0.37.0 --hash=sha256:381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231
rpds-py==2026.9.1 --hash=sha256:3e93b2cd69a9830be33e03945cd7cda940a0a8bfcfbff41d6144f0cb0d3d8bd9
sqlparse==0.6.1 --hash=sha256:3be5a72d04c873d690d7c6dedd33d6fae2ef82759881ceec02fc2efd0cba564f
tzdata==2026.6 --hash=sha256:0a10eec6e13ef16b627fabed9a5f2ba61a62b1c67f327305f4e7e412a70b4aec
uritemplate==4.2.0 --hash=sha256:962201ba1c4edcab02e60f9a0d3821e82dfc5d2d6662a21abd533879bdb8a686
waitress==3.0.2 --hash=sha256:c56d67fd6e87c2ee598b76abdd4e96cfad1f24cacdea5078d382b1f9d7b5ed2e
```

## Artefacts exacts

Sources PyPI par version ; SHA-256 recalculé sur chaque archive et comparé à son entrée officielle.
Les deux roues natives sont `cp313-cp313-win_amd64` ; toutes les autres sont `none-any`.

| Wheel | Provenance immuable | SHA-256 |
| --- | --- | --- |
| django-5.2.19-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/3c/fb/65b4e897d1268288a46457493d9aec6541be8be08e0093a93cc101c03ab2/django-5.2.19-py3-none-any.whl) | 5965d974a5218a2b68a11dd1276434707f23886525c23f0598eccedaf4f4ca00 |
| pyyaml-6.0.3-cp313-cp313-win_amd64.whl | [PyPI](https://files.pythonhosted.org/packages/97/c9/39d5b874e8b28845e4ec2202b5da735d0199dbe5b8fb85f91398814a9a46/pyyaml-6.0.3-cp313-cp313-win_amd64.whl) | 79005a0d97d5ddabfeeea4cf676af11e647e41d81c9a7722a193022accdb6b7c |
| asgiref-3.13.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/2e/b0/ec211e1f7966247cb6469158d856bac9aa4c2fe13621bd6a352e4f850453/asgiref-3.13.0-py3-none-any.whl) | f9596a2434512686473d50f96ff6207fbba49ae1a785dfac614df4aeb085674d |
| attrs-26.1.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/64/b4/17d4b0b2a2dc85a6df63d1157e028ed19f90d4cd97c36717afef2bc2f395/attrs-26.1.0-py3-none-any.whl) | c647aa4a12dfbad9333ca4e71fe62ddc36f4e63b2d260a37a8b83d2f043ac309 |
| djangorestframework-3.16.1-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/b0/ce/bf8b9d3f415be4ac5588545b5fcdbbb841977db1c1d923f7568eeabe1689/djangorestframework-3.16.1-py3-none-any.whl) | 33a59f47fb9c85ede792cbf88bde71893bcda0667bc573f784649521f1102cec |
| drf_spectacular-0.28.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/fb/66/c2929871393b1515c3767a670ff7d980a6882964a31a4ca2680b30d7212a/drf_spectacular-0.28.0-py3-none-any.whl) | 856e7edf1056e49a4245e87a61e8da4baff46c83dbc25be1da2df77f354c7cb4 |
| inflection-0.5.1-py2.py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/59/91/aa6bde563e0085a02a435aa99b49ef75b0a4b062635e606dab23ce18d720/inflection-0.5.1-py2.py3-none-any.whl) | f38b2b640938a4f35ade69ac3d053042959b62a0f1076a5bbaa1b9526605a8a2 |
| jsonschema-4.26.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/69/90/f63fb5873511e014207a475e2bb4e8b2e570d655b00ac19a9a0ca0a385ee/jsonschema-4.26.0-py3-none-any.whl) | d489f15263b8d200f8387e64b4c3a75f06629559fb73deb8fdfb525f2dab50ce |
| jsonschema_specifications-2025.9.1-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/41/45/1a4ed80516f02155c51f51e8cedb3c1902296743db0bbc66608a0db2814f/jsonschema_specifications-2025.9.1-py3-none-any.whl) | 98802fee3a11ee76ecaca44429fda8a41bff98b00a0f2838151b113f210cc6fe |
| referencing-0.37.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/2c/58/ca301544e1fa93ed4f80d724bf5b194f6e4b945841c5bfd555878eea9fcb/referencing-0.37.0-py3-none-any.whl) | 381329a9f99628c9069361716891d34ad94af76e461dcb0335825aecc7692231 |
| rpds_py-2026.9.1-cp313-cp313-win_amd64.whl | [PyPI](https://files.pythonhosted.org/packages/31/9c/ba5a9569d719bfdd6ce863df4133ac6a1658cf1b07cc3534c31db729fbbc/rpds_py-2026.9.1-cp313-cp313-win_amd64.whl) | 3e93b2cd69a9830be33e03945cd7cda940a0a8bfcfbff41d6144f0cb0d3d8bd9 |
| sqlparse-0.6.1-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/df/ff/2fee788e82e75be8f210c65c5d103bf44c880e3769c884652a4cd911b8ba/sqlparse-0.6.1-py3-none-any.whl) | 3be5a72d04c873d690d7c6dedd33d6fae2ef82759881ceec02fc2efd0cba564f |
| tzdata-2026.6-py2.py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/0a/66/9a06c2227fedfd4919f0eaaa8b94377d9730882a7e4f95823c9a331ab5e1/tzdata-2026.6-py2.py3-none-any.whl) | 0a10eec6e13ef16b627fabed9a5f2ba61a62b1c67f327305f4e7e412a70b4aec |
| uritemplate-4.2.0-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/a9/99/3ae339466c9183ea5b8ae87b34c0b897eda475d2aec2307cae60e5cd4f29/uritemplate-4.2.0-py3-none-any.whl) | 962201ba1c4edcab02e60f9a0d3821e82dfc5d2d6662a21abd533879bdb8a686 |
| waitress-3.0.2-py3-none-any.whl | [PyPI](https://files.pythonhosted.org/packages/8d/57/a27182528c90ef38d82b636a11f606b0cbb0e17588ed205435f8affe3368/waitress-3.0.2-py3-none-any.whl) | c56d67fd6e87c2ee598b76abdd4e96cfad1f24cacdea5078d382b1f9d7b5ed2e |
