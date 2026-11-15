# Contrôle reproductible de l’inventaire

[Index](README.md) · [résultats et critères](qualification.md).

Sur un poste de préparation, reprendre les URLs des tables et comparer leurs empreintes avant usage.
Le cache temporaire contient les agrégats sous leur nom, les wheels dans `wheels/`,
les tarballs npm dans `npm/<SHA256(URL)>.tgz` et les archives Go dans `go/<SHA256(URL)>.zip`.
Aucune archive ni script de collecte n’est nécessaire dans le package final.
Les textes de cette page sont extractibles ; le script s’exécute depuis la racine du checkout :
`backend/.venv/Scripts/python.exe controle.py <cache>` avec packaging disponible sur le poste de préparation.
Il ne télécharge rien, n’installe rien et ne modifie ni base, ni tâches, ni configuration.
Les sondes Python/Caddy et le rapprochement juridique complètent ce contrôle documentaire.

```python
import base64
import copy
import email
import hashlib
import json
import pathlib
import re
import sys
import zipfile
from packaging.markers import default_environment
from packaging.requirements import Requirement
from packaging.tags import compatible_tags, cpython_tags
from packaging.utils import canonicalize_name, parse_wheel_filename
from packaging.version import Version

cache = pathlib.Path(sys.argv[1])
docs = pathlib.Path('docs/operations/distribution-inventory')
sha = lambda data: hashlib.sha256(data).hexdigest()

def rows(name):
    text = (docs / name).read_text(encoding='utf-8')
    return [[c.strip().strip('`') for c in line.strip('|').split('|')]
            for line in text.splitlines() if line.startswith('| ')
            and not line.startswith('| ---')][1:]

def must_refuse(name, operation):
    try:
        operation()
    except (AssertionError, KeyError, ValueError):
        print('REFUS CONFORME', name)
    else:
        raise AssertionError('Refus absent : ' + name)

for filename, url, expected in rows('artifacts.md'):
    assert sha((cache / filename).read_bytes()) == expected, filename
text = (docs / 'python.md').read_text(encoding='utf-8')
pins = dict(re.findall(r'^([^\s=]+)==([^\s]+) --hash=sha256:([0-9a-f]{64})$', text, re.M)[i][:2]
            for i in [])  # Les triplets sont traités explicitement ci-dessous.
triples = re.findall(r'^([^\s=]+)==([^\s]+) --hash=sha256:([0-9a-f]{64})$', text, re.M)
pins = {canonicalize_name(n): (v, h) for n, v, h in triples}
assert len(pins) == 15
available = {}
for path in (cache / 'wheels').glob('*.whl'):
    with zipfile.ZipFile(path) as archive:
        file = next(n for n in archive.namelist() if n.endswith('.dist-info/METADATA'))
        meta = email.message_from_bytes(archive.read(file))
        name = canonicalize_name(meta['Name'])
        if name not in pins:
            continue
        version, expected = pins[name]
        assert meta['Version'] == version and sha(path.read_bytes()) == expected
        notices = [n for n in archive.namelist() if re.match(
            r'^(licen[cs]e|copying)([.\-]|$)', n.rsplit('/', 1)[-1], re.I)]
        available[name] = dict(version=version, requires=meta.get_all('Requires-Dist', []),
                               notices=notices, filename=path.name, python=meta['Requires-Python'])

env = default_environment()
env.update(python_version='3.13', python_full_version='3.13.17', sys_platform='win32',
           platform_system='Windows', platform_machine='AMD64', extra='')
tags = set(cpython_tags((3, 13), abis=['cp313'], platforms=['win_amd64']))
tags.update(compatible_tags((3, 13), interpreter='cp313', platforms=['win_amd64']))

def check_graph(items):
    pending = ['django', 'djangorestframework', 'drf-spectacular', 'waitress']
    visited = set()
    while pending:
        name = pending.pop()
        item = items[name]
        Version(item['version'])
        assert item['notices'], name
        _, _, _, wheel_tags = parse_wheel_filename(item['filename'])
        assert wheel_tags & tags, item['filename']
        from packaging.specifiers import SpecifierSet
        assert Version('3.13.17') in SpecifierSet(item['python'])
        if name in visited:
            continue
        visited.add(name)
        for raw in item['requires']:
            requirement = Requirement(raw)
            if requirement.marker and not requirement.marker.evaluate(env):
                continue
            dep = canonicalize_name(requirement.name)
            assert items[dep]['version'] in requirement.specifier
            pending.append(dep)
    assert visited == set(items)

check_graph(available)
missing = copy.deepcopy(available)
del missing['pyyaml']
must_refuse('composant obligatoire PyYAML omis', lambda: check_graph(missing))
floating = copy.deepcopy(available)
floating['django']['version'] = '>=5.2'
must_refuse('version flottante non reproductible', lambda: check_graph(floating))
wrong_abi = copy.deepcopy(available)
wrong_abi['pyyaml']['filename'] = 'pyyaml-6.0.3-cp312-cp312-win_amd64.whl'
must_refuse('ABI cp312 substituée à cp313', lambda: check_graph(wrong_abi))
no_rights = copy.deepcopy(available)
no_rights['waitress']['notices'] = []
must_refuse('preuve de droits absente pour Waitress', lambda: check_graph(no_rights))

def check_bytes(data, expected):
    assert sha(data) == expected

sample = next(p for p in (cache / 'wheels').glob('waitress-*.whl'))
data = sample.read_bytes()
must_refuse('artefact altéré', lambda: check_bytes(data + b'x', sha(data)))
source_lock = json.loads((cache / 'swagger-package-lock.json').read_text())['packages']
swagger_rows = rows('swagger-components-1.md') + rows('swagger-components-2.md')
assert {'node_modules/' + row[0] for row in swagger_rows} == {
    k for k, value in source_lock.items() if k and not value.get('dev')}
for path, version, license_id, expected, link, notice in swagger_rows:
    url = re.search(r'\[npm\]\(([^)]+)\)', link).group(1)
    data = (cache / 'npm' / (sha(url.encode()) + '.tgz')).read_bytes()
    assert sha(data) == expected and license_id not in ('', '?') and notice
    assert source_lock['node_modules/' + path]['version'] == version

modules = rows('caddy-modules.md')
assert len(modules) == 148
for name, version, expected, license_id, notice in modules:
    escape = lambda s: ''.join('!' + c.lower() if c.isupper() else c for c in s)
    url = 'https://proxy.golang.org/' + escape(name) + '/@v/' + escape(version) + '.zip'
    with zipfile.ZipFile(cache / 'go' / (sha(url.encode()) + '.zip')) as archive:
        stream = ''.join(sha(archive.read(n)) + '  ' + n + '\n'
                         for n in sorted(archive.namelist()) if not n.endswith('/'))
    actual = 'h1:' + base64.b64encode(hashlib.sha256(stream.encode()).digest()).decode()
    assert actual == expected and license_id and notice
print('PASS : 15 wheels, 201 entrées Swagger, 148 modules Go, agrégats et 5 refus')
```

Une omission de champ ou de notice dans les tables appelle la même correction qu’une archive omise.
Le refus juridique ci-dessus vérifie la présence de pièces requises ; il ne remplace pas la revue des droits.
La sonde d’ABI Windows 3.13.17 et le contrôle de source maps Swagger sont décrits dans qualification.md.
Les compléments de préparation sont rapprochés du lock exact ; ils ne prouvent pas une exécution de son build.
