# Répétitions pytest

Recette d’audit exécutée hors sources, non intégrée à pytest ni aux workflows.
Reconstituer ce bloc sous le nom `repeat.py` dans le conteneur décrit dans [le protocole](experiences.md).

```python
import datetime,json,pathlib,platform,sqlite3,subprocess,sys,time
root=pathlib.Path('/audit/evidence')
meta={'python':sys.version,'platform':platform.platform(),'sqlite':sqlite3.sqlite_version,'os_release':pathlib.Path('/etc/os-release').read_text()}
meta['freeze']=subprocess.check_output([sys.executable,'-m','pip','freeze'],text=True)
(root/'environment.json').write_text(json.dumps(meta,indent=2))
for env in ['development','production']:
    for number in range(1,11):
        label=f'baseline-{env}-{number:02}'
        command=[sys.executable,'-m','pytest','-q',f'tests/test_sqlite_contention_operational.py::test_operational_contention[apis_release-{env}]']
        start=time.monotonic()
        result=subprocess.run(command,capture_output=True,text=True,timeout=75)
        record={'id':label,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'seconds':time.monotonic()-start,'returncode':result.returncode}
        (root/f'{label}.log').write_text(result.stdout+result.stderr)
        with (root/'baseline.jsonl').open('a') as stream: stream.write(json.dumps(record)+'\n')
        print(json.dumps(record),flush=True)
```
