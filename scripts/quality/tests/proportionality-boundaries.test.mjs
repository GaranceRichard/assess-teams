import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { checkEvidence } from "../evidence-assets.mjs";
import { planImpact, fullScopes } from "../impact.mjs";
import { installedKey } from "../runtime-inputs.mjs";
import { fixture } from "./validation-fixtures.mjs";

test("evidence integrity rejects absent, corrupt, undocumented or newly consumed outputs", () =>
  fixture((root) => {
    const directory = join(root, "docs/quality/ux-transitions");
    mkdirSync(directory, { recursive: true });
    const image = join(directory, "question-milieu.png");
    writeFileSync(join(directory, "README.md"), "[Image](question-milieu.png)");
    assert.match(checkEvidence(root, []).join("\n"), /absente/);
    writeFileSync(image, "wrong format");
    assert.match(checkEvidence(root, []).join("\n"), /invalide/);
    writeFileSync(
      image,
      Buffer.from("89504e470d0a1a0a0000000049454e44ae426082", "hex"),
    );
    assert.deepEqual(checkEvidence(root, []), []);
    writeFileSync(join(directory, "README.md"), "No image described");
    assert.match(checkEvidence(root, []).join("\n"), /sans lecture/);
    mkdirSync(join(root, "frontend"));
    writeFileSync(
      join(root, "frontend/vite.config.ts"),
      "copy('docs/quality/ux-transitions')",
    );
    assert.match(
      checkEvidence(root, ["frontend/vite.config.ts"]).join("\n"),
      /Consommateur/,
    );
  }));

test("executable browser diagnostics and directories cannot escape the installed fingerprint", () =>
  fixture((root) => {
    const key = () => installedKey(root, { browser: true });
    const before = key();
    mkdirSync(join(root, "debug.log"));
    assert.notEqual(key(), before);
    rmSync(join(root, "debug.log"), { recursive: true });
    if (process.platform !== "win32") {
      writeFileSync(join(root, "debug.log"), "executable input");
      chmodSync(join(root, "debug.log"), 0o755);
      assert.notEqual(key(), before);
    }
  }));

test("mixed specs run a union, shared UI still requires demo and broad layout remains conservative", () => {
  const app = "frontend/e2e/dashboard.spec.ts";
  const demo = "frontend/demo-e2e/date-presentation.spec.ts";
  const check = planImpact([app, demo, app]).checks.at(-1);
  assert.deepEqual(check, {
    scope: "e2e-targeted",
    tests: [app],
    demoTests: [demo],
    demo: false,
  });
  assert.equal(
    planImpact(["frontend/src/ProductSidebar.tsx", demo]).checks.at(-1).demo,
    true,
  );
  assert.equal(
    planImpact(["frontend/src/transitions.css"]).checks.at(-1).scope,
    "e2e",
  );
  assert.equal(
    planImpact(["frontend/src/nested/DashboardPage.tsx"]).checks.at(-1).scope,
    "e2e",
  );
  for (const path of [
    "frontend/playwright.config.ts",
    "frontend/e2e/reports.ts",
  ])
    assert.deepEqual(
      planImpact([{ path, status: "D" }]).checks.map(({ scope }) => scope),
      fullScopes,
    );
  assert.deepEqual(
    planImpact(["frontend/vite.config.ts"]).checks.map(({ scope }) => scope),
    ["repository", "frontend", "e2e"],
  );
});
