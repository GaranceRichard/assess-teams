"""MEP-059 wheel qualification; never accepts or assembles a distribution runtime."""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

from wheel_metadata import pins, require, rows, verify_closure, verify_metadata

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs/operations/distribution-inventory"
WHEELHOUSE = ROOT / "distribution/python/ref-win-01"
SCRIPTS = Path(__file__).resolve().parent


def verify(wheelhouse=WHEELHOUSE):
    source = (INVENTORY / "python.md").read_text(encoding="utf-8")
    locked = pins(
        (wheelhouse / "requirements.txt").read_text(encoding="utf-8"), strict=True
    )
    require(locked == pins(source), "Lock differs from MEP-057")
    artifacts = re.findall(
        r"^\| (\S+\.whl) \| \[PyPI\]\(([^)]+)\) \| ([a-f0-9]{64}) \|$",
        source,
        re.MULTILINE,
    )
    require(len(artifacts) == 15, "Incomplete canonical artifact list")
    wheels = wheelhouse / "wheels"
    require(
        {p.name for p in wheels.iterdir()} == {n for n, _, _ in artifacts},
        "Missing, renamed or unexpected wheel",
    )
    notices = rows(INVENTORY / "python-notices.md")
    items = {}
    for filename, _, digest in artifacts:
        path = wheels / filename
        require(
            path.is_file() and not path.is_symlink(),
            "Non-regular artifact: " + filename,
        )
        require(
            hashlib.sha256(path.read_bytes()).hexdigest() == digest,
            "Absent or altered wheel: " + filename,
        )
        matches = [(n, v) for n, (v, h) in locked.items() if h == digest]
        require(len(matches) == 1, "Wheel hash not uniquely pinned")
        name, version = matches[0]
        items[name] = verify_metadata(path, name, version, notices)
    verify_closure(items)
    print("PASS 15 exact wheels, hashes, tags, transitives and 26 original notices")
    return locked


def runtime_profile(python):
    code = (
        "import json,sys,sysconfig,platform,struct;print(json.dumps(dict("
        "version=list(sys.version_info[:3]),implementation=sys.implementation.name,"
        "platform=sys.platform,machine=platform.machine(),bits=struct.calcsize('P')*8,"
        "free_threaded=bool(sysconfig.get_config_var('Py_GIL_DISABLED')),"
        "compiler=platform.python_compiler(),windows=platform.version())))"
    )
    profile = json.loads(
        subprocess.check_output([str(python), "-I", "-c", code], text=True)
    )
    require(
        profile["version"][:2] == [3, 13]
        and profile["implementation"] == "cpython"
        and profile["platform"] == "win32"
        and profile["machine"] == "AMD64"
        and profile["bits"] == 64
        and not profile["free_threaded"],
        "Interpreter incompatible with REF-WIN-01 cp313-win_amd64",
    )
    profile["python_exe_sha256"] = hashlib.sha256(python.read_bytes()).hexdigest()
    profile["runtime_distribution_accepted"] = False
    print("QUALIFICATION ONLY; runtime final non qualifie; I01 reste ouverte")
    print(json.dumps(profile, sort_keys=True))
    return profile


def qualify(wheelhouse, python, destination):
    import pip

    locked = verify(wheelhouse)
    runtime_profile(python)
    require(not destination.exists(), "Qualification requires a new empty destination")
    command = [
        str(python),
        "-I",
        str(SCRIPTS / "offline_pip.py"),
        str(Path(pip.__file__).parent.parent),
        "--isolated",
        "--disable-pip-version-check",
        "--no-cache-dir",
        "install",
        "--no-index",
        "--no-deps",
        "--only-binary=:all:",
        "--require-hashes",
        "--no-compile",
        "--find-links",
        str(wheelhouse / "wheels"),
        "--target",
        str(destination),
        "-r",
        str(wheelhouse / "requirements.txt"),
    ]
    print("COMMAND " + subprocess.list2cmdline(command), flush=True)
    subprocess.run(command, check=True)
    output = subprocess.check_output(
        [str(python), "-I", str(SCRIPTS / "probe_installed.py"), str(destination)],
        text=True,
    )
    from pip._vendor.packaging.utils import canonicalize_name

    installed = json.loads(output.splitlines()[0])
    require(
        {canonicalize_name(n): v for n, v in installed.items()}
        == {n: v for n, (v, _) in locked.items()},
        "Installed versions differ from lock",
    )
    print(output, end="")
    print(
        "PASS offline wheel qualification; final corrected runtime still required (I01)"
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["verify", "qualify"])
    parser.add_argument("--wheelhouse", type=Path, default=WHEELHOUSE)
    parser.add_argument("--python", type=Path)
    parser.add_argument("--destination", type=Path)
    args = parser.parse_args()
    try:
        if args.action == "verify":
            verify(args.wheelhouse.resolve())
        else:
            require(
                args.python and args.destination, "--python and --destination required"
            )
            qualify(
                args.wheelhouse.resolve(),
                args.python.resolve(),
                args.destination.resolve(),
            )
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print("REFUS " + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
