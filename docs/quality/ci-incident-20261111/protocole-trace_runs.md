# Pilotage des essais instrumentés

Recette d’audit exécutée hors sources, non intégrée à pytest ni aux workflows.
Reconstituer ce bloc sous le nom `trace_runs.py` dans le conteneur décrit dans [le protocole](experiences.md).

```python
import datetime,json,os,pathlib,subprocess,sys,time
from tests.startup_helpers import production_environment
root=pathlib.Path('/audit/evidence')
for environment in ['development','production']:
    for number,delay in enumerate([0,0.15,0.15],1):
        label=f'trace-{environment}-{number:02}'
        directory=root/label
        env=production_environment(DJANGO_SETTINGS_MODULE=f'config.settings_{environment}',APP_BASE_URL='https://testserver',AUDIT_TRACE_DIR=str(directory),AUDIT_HOLDER_DELAY=str(delay))
        command=[sys.executable,'/audit/audit_trace.py',str(root/f'{label}.sqlite3')]
        start=time.monotonic()
        result=subprocess.run(command,env=env,capture_output=True,text=True,timeout=60)
        (root/f'{label}.log').write_text(result.stdout+result.stderr)
        record={'id':label,'environment':environment,'holder_delay_seconds':delay,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seconds':time.monotonic()-start,'returncode':result.returncode}
        with (root/'traced.jsonl').open('a') as out: out.write(json.dumps(record)+'\n')
        print(json.dumps(record),flush=True)
```
