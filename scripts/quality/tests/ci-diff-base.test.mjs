import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { fixture } from "./validation-fixtures.mjs";

const checker = fileURLToPath(new URL("../check-documentation.ps1", import.meta.url));
const shell = process.platform === "win32" ? "powershell.exe" : "pwsh";
const workflow = readFileSync(new URL("../../../.github/workflows/exhaustive.yml", import.meta.url), "utf8");
const resolver = workflow.match(/node --input-type=module <<'JS'\r?\n([\s\S]*?)          JS/)[1].replace(/^          /gm, "");

function resolveDiffBase(root, { candidate, event, base = "" }) {
  const output = join(root, ".git/ci-base-output");
  writeFileSync(output, "");
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", resolver], {
    cwd: root, encoding: "utf8",
    env: { ...process.env, CANDIDATE: candidate, GITHUB_EVENT_NAME: event, QUALITY_DIFF_BASE: base, GITHUB_OUTPUT: output },
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return readFileSync(output, "utf8").trim().replace(/^base=/, "");
}

function repository(action) {
  const saved = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("GIT_")));
  for (const key of Object.keys(saved)) delete process.env[key];
  try {
    fixture((root) => {
      const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" }).trim();
      git("init", "-b", "main");
      git("config", "user.name", "CI base test");
      git("config", "user.email", "ci@example.invalid");
      git("config", "core.autocrlf", "false");
      mkdirSync(join(root, "scripts/quality"), { recursive: true });
      mkdirSync(join(root, "docs/quality"), { recursive: true });
      writeFileSync(join(root, "scripts/quality/example.mjs"), "// initial\n");
      git("add", ".");
      git("commit", "-qm", "initial");
      action(root, git, git("rev-parse", "HEAD"));
    });
  } finally {
    Object.assign(process.env, saved);
  }
}

function change(root, git, name) {
  writeFileSync(join(root, "scripts/quality/example.mjs"), `// ${name}\n`);
  git("add", ".");
  git("commit", "-qm", name);
  return git("rev-parse", "HEAD");
}

test("push, PR and reusable callers preserve the entire explicit range", () => repository((root, git, base) => {
  change(root, git, "first");
  const candidate = change(root, git, "second");
  for (const event of ["push", "pull_request", "workflow_call"]) {
    assert.equal(resolveDiffBase(root, { candidate, event, base }), base);
    assert.throws(() => resolveDiffBase(root, { candidate, event, base: candidate }), /vide refuse/);
    assert.throws(() => resolveDiffBase(root, { candidate, event, base: "missing" }), /inutilisable/);
  }
  for (const event of ["push", "pull_request"]) {
    assert.throws(() => resolveDiffBase(root, { candidate, event }), /explicite requise/);
  }
}));

test("manual, daily and reusable qualification resolve a historical candidate's own parent", () => repository((root, git, base) => {
  const candidate = change(root, git, "candidate");
  change(root, git, "newer-main");
  for (const event of ["workflow_dispatch", "schedule", "workflow_call"]) {
    assert.equal(resolveDiffBase(root, { candidate, event }), base);
    assert.throws(() => resolveDiffBase(root, { candidate: base, event }), /inutilisable/);
  }
  assert.throws(() => resolveDiffBase(root, { candidate, event: "unknown" }), /explicite requise/);
}));

test("a divergent explicit base never creates an empty or unrelated check", () => repository((root, git, base) => {
  const candidate = change(root, git, "candidate");
  git("checkout", "-qb", "other", base);
  const unrelated = change(root, git, "other");
  assert.throws(() => resolveDiffBase(root, { candidate, event: "push", base: unrelated }), /inutilisable/);
}));

const preparation = `## Préparation du changement

- Périmètre : vérifier les contrats existants de qualification quotidienne.
- Objectif : conserver la préparation valide du candidat historique testé.
- Effets attendus : accepter le document complet et refuser les preuves absentes.
- Risques : une base erronée pourrait masquer une préparation pourtant ajoutée.
- Vérification : exécuter le gate documentaire avec les refus de contenu.
- Fichier : \`scripts/quality/example.mjs\`
`;

for (const kind of ["valid", "absent", "insufficient", "unattached"]) {
  test(`real detached documentation gate: ${kind} preparation`, () => repository((root, git, base) => {
    let trace = preparation;
    if (kind === "insufficient") trace = trace.replace(/- Risques.*\n/, "- Risques : aucun\n");
    if (kind === "unattached") trace = trace.replace("example.mjs", "other.mjs");
    if (kind !== "absent") writeFileSync(join(root, "docs/quality/change.md"), trace);
    const candidate = change(root, git, "candidate");
    change(root, git, "later");
    git("checkout", "--detach", candidate);
    const run = (diffBase) => {
      const env = { ...process.env };
      if (diffBase) env.QUALITY_DIFF_BASE = diffBase;
      else delete env.QUALITY_DIFF_BASE;
      const policy = process.platform === "win32" ? ["-ExecutionPolicy", "Bypass"] : [];
      return spawnSync(shell, ["-NoProfile", ...policy, "-File", checker, "-Root", root], { env, encoding: "utf8" });
    };
    if (kind === "valid") {
      const before = run();
      assert.equal(before.status, 1, before.stdout + before.stderr);
      assert.match(before.stdout, /Preparation documentaire/, before.stderr);
    }
    for (const event of ["workflow_dispatch", "schedule", "workflow_call"]) {
      const resolved = resolveDiffBase(root, { candidate, event });
      assert.equal(resolved, base);
      const result = run(resolved);
      assert.equal(result.status, kind === "valid" ? 0 : 1, result.stdout + result.stderr);
      assert.match(result.stdout, kind === "valid" ? /\[PASS\]/ : /Preparation documentaire/, result.stderr);
    }
  }));
}
