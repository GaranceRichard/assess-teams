"""Real wheelhouse acceptance and refusal cases; no fixture download."""

import contextlib
import io
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

from python_wheelhouse import INVENTORY, SCRIPTS, WHEELHOUSE, runtime_profile, verify
from wheel_metadata import rows, verify_closure, verify_metadata


class WheelhouseTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.wheelhouse = Path(self.temporary.name) / "wheelhouse"
        shutil.copytree(WHEELHOUSE, self.wheelhouse)

    def test_complete_original_wheelhouse(self):
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(len(verify(self.wheelhouse)), 15)

    def test_missing_required_yaml_refuses_cli_before_installation(self):
        next((self.wheelhouse / "wheels").glob("pyyaml-*.whl")).unlink()
        result = subprocess.run(
            [
                sys.executable,
                str(SCRIPTS / "python_wheelhouse.py"),
                "verify",
                "--wheelhouse",
                str(self.wheelhouse),
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("Missing, renamed or unexpected wheel", result.stderr)

    def test_altered_waitress_bytes_refused(self):
        wheel = next((self.wheelhouse / "wheels").glob("waitress-*.whl"))
        data = bytearray(wheel.read_bytes())
        data[-1] ^= 1
        wheel.write_bytes(data)
        with self.assertRaisesRegex(ValueError, "altered wheel: waitress"):
            verify(self.wheelhouse)

    def test_extra_distribution_refused(self):
        (self.wheelhouse / "wheels/uninventoried.whl").write_bytes(b"unexpected")
        with self.assertRaisesRegex(ValueError, "unexpected wheel"):
            verify(self.wheelhouse)

    def test_floating_or_changed_lock_refused(self):
        lock = self.wheelhouse / "requirements.txt"
        original = lock.read_text()
        for text in (
            original + "unexpected>=1\n",
            original.replace("Django==", "Django>="),
            original.replace("Django==5.2.19", "Django==5.2.18"),
        ):
            lock.write_text(text)
            with self.assertRaises(ValueError):
                verify(self.wheelhouse)

    def test_substituted_cp312_wheel_tag_refused(self):
        source = next((self.wheelhouse / "wheels").glob("pyyaml-*.whl"))
        incompatible = source.with_name(source.name.replace("cp313", "cp312"))
        source.rename(incompatible)
        with self.assertRaisesRegex(ValueError, "Incompatible wheel"):
            verify_metadata(
                incompatible, "pyyaml", "6.0.3", rows(INVENTORY / "python-notices.md")
            )
        with self.assertRaisesRegex(ValueError, "renamed"):
            verify(self.wheelhouse)

    def test_removed_waitress_notice_refused(self):
        source = next((self.wheelhouse / "wheels").glob("waitress-*.whl"))
        temporary = source.with_suffix(".zip")
        source.rename(temporary)
        with (
            zipfile.ZipFile(temporary) as original,
            zipfile.ZipFile(source, "w") as changed,
        ):
            for member in original.infolist():
                if member.filename != "waitress-3.0.2.dist-info/LICENSE.txt":
                    changed.writestr(member, original.read(member))
        with self.assertRaises(KeyError):
            verify_metadata(
                source, "waitress", "3.0.2", rows(INVENTORY / "python-notices.md")
            )
        temporary.unlink()
        with self.assertRaisesRegex(ValueError, "altered wheel"):
            verify(self.wheelhouse)

    def test_missing_transitive_and_unsatisfied_version_refused(self):
        items = {}
        notices = rows(INVENTORY / "python-notices.md")
        from pip._vendor.packaging.utils import parse_wheel_filename

        for path in (self.wheelhouse / "wheels").glob("*.whl"):
            name, version, _, _ = parse_wheel_filename(path.name)
            items[name] = verify_metadata(path, name, str(version), notices)
        verify_closure(items)
        yaml = items.pop("pyyaml")
        with self.assertRaisesRegex(
            ValueError, "Missing transitive dependency: pyyaml"
        ):
            verify_closure(items)
        items["pyyaml"] = yaml
        items["asgiref"]["version"] = "3.7.0"
        with self.assertRaisesRegex(ValueError, "Incompatible transitive version"):
            verify_closure(items)

    def test_implicit_download_refused(self):
        result = subprocess.run(
            [
                sys.executable,
                "-I",
                str(SCRIPTS / "offline_pip.py"),
                "--test-network-guard",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertIn("PASS implicit download refused before connection", result.stdout)

    @unittest.skipIf(
        sys.version_info[:2] == (3, 13) and sys.platform == "win32",
        "Uses a genuinely different interpreter",
    )
    def test_incompatible_actual_preparation_interpreter_refused(self):
        with self.assertRaisesRegex(ValueError, "Interpreter incompatible"):
            runtime_profile(Path(sys.executable))


def load_tests(loader, tests, pattern):
    tests.addTests(loader.discover(str(SCRIPTS), pattern="test_package.py"))
    return tests


if __name__ == "__main__":
    unittest.main()
