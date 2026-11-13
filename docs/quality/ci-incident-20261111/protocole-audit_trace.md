# Sonde de chronologie

Recette d’audit exécutée hors sources, non intégrée à pytest ni aux workflows.
Reconstituer ce bloc sous le nom `audit_trace.py` dans le conteneur décrit dans [le protocole](experiences.md).

```python
"""Audit-only instrumentation; no application or test source is modified."""
import json,multiprocessing.connection,os,pathlib,sys,time
sys.path.insert(0,'/audit/backend')
from tests import sqlite_contention_process as peer
ROOT=pathlib.Path(os.environ['AUDIT_TRACE_DIR'])
ROOT.mkdir(parents=True,exist_ok=True)
armed=False
from django.db.backends.base.base import BaseDatabaseWrapper
original_commit=BaseDatabaseWrapper._commit

def commit(self):
    if armed: record("commit_start")
    result=original_commit(self)
    if armed: record("commit_end")
    return result
BaseDatabaseWrapper._commit=commit

def record(event,**data):
    item={'ns':time.monotonic_ns(),'pid':os.getpid(),'process':multiprocessing.current_process().name,'event':event,**data}
    with (ROOT/f'{os.getpid()}.jsonl').open('a') as out: out.write(json.dumps(item)+'\n')

original_send=multiprocessing.connection.Connection.send
original_recv=multiprocessing.connection.Connection.recv

def send(self,value):
    global armed
    if value=='ready': armed=True
    if isinstance(value,str): record('send',signal=value)
    elif isinstance(value,list) and value[0]=='elapsed': record('send',signal='elapsed',seconds=value[1])
    elif isinstance(value,list) and value[0]=='result':
        result=value[1]
        record('send',signal='result',status=result[0] if isinstance(result,list) else result)
    return original_send(self,value)

def recv(self):
    value=original_recv(self)
    if isinstance(value,str): record('recv',signal=value)
    if value=='continue' and multiprocessing.current_process().name=='SpawnProcess-1':
        delay=float(os.environ.get('AUDIT_HOLDER_DELAY','0'))
        if delay:
            record('deschedule_start',seconds=delay)
            time.sleep(delay)
            record('deschedule_end')
    return value

multiprocessing.connection.Connection.send=send
multiprocessing.connection.Connection.recv=recv
original_configure=peer.configure

def configure(path):
    from django.db.backends.signals import connection_created
    def connected(sender,connection,**kwargs):
        with connection.cursor() as cursor:
            values={key:cursor.execute('PRAGMA '+key).fetchone()[0] for key in ['busy_timeout','journal_mode','synchronous']}
        record('connection',**values,mode=connection.settings_dict['OPTIONS']['transaction_mode'])
        def sql(execute,query,params,many,context):
            kind=query.split()[0].upper()
            trace=armed and kind in ['BEGIN','UPDATE','INSERT','COMMIT','ROLLBACK','PRAGMA']
            if trace: record('sql_start',kind=kind,atomic=connection.in_atomic_block)
            try:
                result=execute(query,params,many,context)
            except Exception as error:
                if trace: record('sql_error',kind=kind,error=type(error).__name__,code=getattr(getattr(error,'__cause__',None),'sqlite_errorcode',None))
                raise
            if trace: record('sql_end',kind=kind)
            return result
        connection.execute_wrappers.append(sql)
    connection_created.connect(connected,weak=False)
    original_configure(path)
peer.configure=configure

if __name__=='__main__':
    from tests.sqlite_contention_cases import run
    run('apis_release',pathlib.Path(sys.argv[1]))
```
