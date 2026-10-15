"""Finish multiprocessing helpers before pytest-cov consolidates the test shard."""

import json
import subprocess
import sys
from pathlib import Path

SCRIPT = """
import json, sys
from tools.sqlite_load import load
from tools.sqlite_probe import probe
if __name__ == '__main__':
    operation = {'probe': probe, 'load': load}[sys.argv[1]]
    print(json.dumps(operation(**json.loads(sys.argv[2]))))
"""


def measure_in_process(operation, path, **parameters):
    # Capturing both pipes also waits for inherited descriptors to close in helpers.
    # In particular, POSIX's resource_tracker must exit before pytest-cov combines.
    result = subprocess.run(
        [sys.executable, "-c", SCRIPT, operation, json.dumps({"path": str(path), **parameters})],
        cwd=Path(__file__).resolve().parents[1],
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    return json.loads(result.stdout)
