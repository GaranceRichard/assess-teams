"""Mutate copies of a real assembled candidate, never the qualified references."""

import contextlib
import io
import os
import shutil
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path

from package_common import ROOT, digest, inventory, read_json, write_json
from package_verify import verify

CANDIDATE = os.environ.get("MEP024_CANDIDATE")


@unittest.skipUnless(CANDIDATE, "Requires a real local candidate; see MEP-024 protocol")
class RealPackageRefusals(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / "copy"
        shutil.copytree(CANDIDATE, self.root)
        self.manifest = read_json(self.root / "manifest.json")
        self.sha = self.manifest["sourceCommit"]

    def seal(self):
        self.manifest["files"] = inventory(self.root)
        write_json(self.root / "manifest.json", self.manifest)
        return digest((self.root / "manifest.json").read_bytes())

    def check(self, integrity=True):
        with contextlib.redirect_stdout(io.StringIO()):
            return verify(self.root, self.seal(), self.sha, integrity)

    def test_actual_partial_candidate_and_final_i01_refusal(self):
        self.assertFalse(self.check()["installable"])
        with self.assertRaisesRegex(ValueError, "I01"):
            self.check(integrity=False)

    def test_removed_migration_refused_even_after_resealing(self):
        next((self.root / "backend/teams/migrations").glob("0*.py")).unlink()
        with self.assertRaises((ValueError, OSError)):
            self.check()

    def test_altered_source_refused_after_resealing(self):
        with (self.root / "backend/manage.py").open("ab") as file:
            file.write(b"\n# changed\n")
        with self.assertRaisesRegex(ValueError, "differs from Git"):
            self.check()

    def test_incomplete_manifest_refused(self):
        self.manifest["sourceFiles"].pop()
        with self.assertRaisesRegex(ValueError, "Source inventory"):
            self.check()

    def test_divergent_receipt_and_invented_caddy_origin_refused(self):
        self.manifest["inputs"]["frontendPayloadSha256"] = "0" * 64
        with self.assertRaisesRegex(ValueError, "receipt"):
            self.check()
        self.manifest = read_json(Path(CANDIDATE) / "manifest.json")
        path = self.root / "hosting/caddy/manifest.json"
        caddy = read_json(path)
        caddy["origins"][0]["origin"] = "https://example.invalid/invented"
        self.manifest["components"][-2]["origin"] = caddy["origins"]
        write_json(path, caddy)
        self.manifest["inputs"]["caddyManifestSha256"] = digest(path.read_bytes())
        with self.assertRaisesRegex(ValueError, "Caddy origins"):
            self.check()

    def test_false_source_sha_refused(self):
        self.manifest["sourceCommit"] = "0" * 40
        with self.assertRaisesRegex(ValueError, "Source SHA mismatch"):
            self.check()

    def test_missing_and_incompatible_wheel_refused(self):
        wheel = next((self.root / "python/wheels").glob("pyyaml-*"))
        wrong = wheel.with_name(wheel.name.replace("cp313", "cp312"))
        wheel.rename(wrong)
        with self.assertRaisesRegex(ValueError, "wheel"):
            self.check()
        wrong.unlink()
        with self.assertRaisesRegex(ValueError, "wheel"):
            self.check()

    def test_altered_wheel_refused(self):
        path = next((self.root / "python/wheels").glob("waitress-*"))
        path.write_bytes(path.read_bytes() + b"altered")
        with self.assertRaisesRegex(ValueError, "altered wheel"):
            self.check()

    def test_removed_original_license_in_real_wheel_refused(self):
        path = next((self.root / "python/wheels").glob("waitress-*"))
        with zipfile.ZipFile(path) as original:
            members = [
                (n, original.read(n))
                for n in original.namelist()
                if not n.endswith("/LICENSE.txt")
            ]
        with zipfile.ZipFile(path, "w") as changed:
            for name, data in members:
                changed.writestr(name, data)
        with self.assertRaisesRegex(ValueError, "altered wheel"):
            self.check()

    def test_unqualified_runtime_or_implicit_acceptance_refused(self):
        self.manifest["runtime"] = {"version": "3.13.17", "qualified": True}
        self.manifest["installable"] = True
        with self.assertRaisesRegex(ValueError, "Unqualified runtime"):
            self.check()

    def test_caddy_notice_deleted_refused_after_resealing(self):
        next((self.root / "hosting/caddy/legal").rglob("LICENSE*")).unlink()
        with self.assertRaisesRegex(ValueError, "Caddy"):
            self.check()

    def test_node_docker_network_install_requirement_refused(self):
        for requirement in ("npm install", "docker compose", "Internet download"):
            self.manifest["targetRequires"] = [requirement]
            with self.assertRaisesRegex(ValueError, "requirement refused"):
                self.check()

    def test_private_file_and_detectable_secret_refused(self):
        path = self.root / "backend/.env.production"
        path.write_text("gh" + "p_" + "A" * 35)
        with self.assertRaisesRegex(ValueError, "Private"):
            self.check()
        path.unlink()
        path = self.root / "documentation/unsafe.txt"
        path.write_text("gh" + "p_" + "A" * 35)
        with self.assertRaisesRegex(ValueError, "secret"):
            self.check()

    def test_required_cdn_resource_refused_after_submanifest_reseal(self):
        path = self.root / "web/frontend/index.html"
        path.write_text(
            path.read_text() + '<script src="https://example.invalid/cdn.js"></script>'
        )
        web = read_json(self.root / "web/manifest.json")
        web["files"] = inventory(self.root / "web")
        web["payloadSha256"] = digest(
            __import__("json")
            .dumps(web["files"], separators=(",", ":"), ensure_ascii=False)
            .encode()
        )
        write_json(self.root / "web/manifest.json", web)
        self.manifest["inputs"]["frontendManifestSha256"] = digest(
            (self.root / "web/manifest.json").read_bytes()
        )
        with self.assertRaises(subprocess.CalledProcessError):
            self.check()

    def test_real_demo_substitution_refused(self):
        demo = ROOT / "build/demo"
        self.assertTrue(
            (demo / "index.html").exists(), "Build the real demo for this refusal"
        )
        shutil.rmtree(self.root / "web/frontend")
        shutil.copytree(demo, self.root / "web/frontend")
        with self.assertRaises(subprocess.CalledProcessError):
            self.check()

    def test_independent_powershell_copy_verifier(self):
        shell = shutil.which("pwsh") or shutil.which("powershell")
        self.assertIsNotNone(shell)
        command = [
            shell,
            "-NoProfile",
            "-File",
            str(ROOT / "scripts/distribution/verify-package.ps1"),
            "-Package",
            str(self.root),
            "-ManifestSha256",
            self.seal(),
            "-Source",
            self.sha,
        ]
        self.assertEqual(
            subprocess.run(
                command + ["-IntegrityOnly"], check=False, capture_output=True
            ).returncode,
            0,
        )
        self.assertNotEqual(
            subprocess.run(command, check=False, capture_output=True).returncode, 0
        )
        (self.root / "NOTICE").unlink()
        self.assertNotEqual(
            subprocess.run(
                command + ["-IntegrityOnly"], check=False, capture_output=True
            ).returncode,
            0,
        )


if __name__ == "__main__":
    unittest.main()
