import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { changesBetween, pushRange, git } from "../changes.mjs";
import { contentKey, gitFiles } from "../validation-inputs.mjs";
import { planImpact } from "../impact.mjs";
import { assertCandidate } from "../qualification.mjs";
import { fixture } from "./validation-fixtures.mjs";

const cleanEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);
function initialize(root) {
  const command = (...args) =>
    execFileSync("git", args, {
      cwd: root,
      env: cleanEnvironment,
      stdio: "pipe",
      encoding: "utf8",
    }).trim();
  command("init", "-b", "main");
  command("config", "core.autocrlf", "false");
  command("config", "user.email", "test@example.invalid");
  command("config", "user.name", "Impact test");
  mkdirSync(join(root, "docs/backlog"), { recursive: true });
  writeFileSync(join(root, "docs/backlog/a.md"), "before\n");
  command("add", ".");
  command("commit", "-m", "base");
  return command;
}
// Git's environment inside hooks refers to the real repository: clear it for fixture calls.
function isolated(action) {
  const saved = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith("GIT_")),
  );
  for (const key of Object.keys(saved)) delete process.env[key];
  try {
    fixture(action);
  } finally {
    Object.assign(process.env, saved);
  }
}

test("real Git ranges include both sides of renames; markdown moved into runtime is not prose", () =>
  isolated((root) => {
    const command = initialize(root);
    const base = command("rev-parse", "HEAD");
    mkdirSync(join(root, "frontend/src"), { recursive: true });
    command("mv", "docs/backlog/a.md", "frontend/src/a.md");
    command("commit", "-m", "move");
    const range = changesBetween(root, base, "HEAD");
    assert.deepEqual(
      range.changes.map(({ path }) => path),
      ["docs/backlog/a.md", "frontend/src/a.md"],
    );
    assert.equal(planImpact(range.changes).exhaustive, true);
  }));

test("working selection includes committed, staged, unstaged and untracked paths", () =>
  isolated((root) => {
    const command = initialize(root);
    const base = command("rev-parse", "HEAD");
    writeFileSync(join(root, "docs/backlog/a.md"), "committed\n");
    command("commit", "-am", "change");
    writeFileSync(join(root, "docs/backlog/b.md"), "staged\n");
    command("add", ".");
    writeFileSync(join(root, "docs/backlog/c.md"), "untracked\n");
    const range = changesBetween(root, base, "HEAD", { working: true });
    assert.equal(range.changes.length, 3);
    assert.equal(planImpact(range.changes).exhaustive, false);
    assert.equal(changesBetween(root, base, "HEAD").changes.length, 1);
  }));

test("pre-push selection uses announced remote SHA and refuses dirty or different candidates", () =>
  isolated((root) => {
    const command = initialize(root);
    const base = command("rev-parse", "HEAD");
    writeFileSync(join(root, "docs/backlog/a.md"), "candidate\n");
    command("commit", "-am", "candidate");
    const head = git(root, "rev-parse", "HEAD").trim();
    const line = `refs/heads/pbi ${head} refs/heads/main ${base}\n`;
    assert.deepEqual(pushRange(root, line), { base, head });
    assert.equal(assertCandidate(root, head), head);
    assert.throws(
      () => pushRange(root, line.replace(head, base)),
      /candidat pousse/,
    );
    assert.throws(() =>
      pushRange(root, line.replace("refs/heads/main", "refs/heads/other")),
    );
    assert.throws(() => pushRange(root, line + line));
    assert.throws(() => assertCandidate(root, base), /SHA complet exact/);
    writeFileSync(join(root, "docs/backlog/a.md"), "dirty\n");
    assert.throws(() => pushRange(root, line), /non commite/);
    assert.throws(() => assertCandidate(root, head), /non commite/);
  }));

test("real rebase reuses unchanged application inputs but invalidates a new dependency", () =>
  isolated((root) => {
    const command = initialize(root);
    command("switch", "-c", "pbi");
    mkdirSync(join(root, "backend"));
    writeFileSync(join(root, "backend/helper.py"), "application\n");
    command("add", ".");
    command("commit", "-m", "application");
    const beforeSha = command("rev-parse", "HEAD");
    const key = () => contentKey(root, gitFiles(root), { scope: "backend" });
    const beforeKey = key();
    command("switch", "main");
    writeFileSync(join(root, "docs/backlog/a.md"), "new documentation\n");
    command("commit", "-am", "documentation");
    command("switch", "pbi");
    command("rebase", "main");
    assert.notEqual(command("rev-parse", "HEAD"), beforeSha);
    assert.equal(key(), beforeKey);
    command("switch", "main");
    mkdirSync(join(root, "backend"));
    writeFileSync(join(root, "backend/dependency.py"), "new dependency\n");
    command("add", ".");
    command("commit", "-m", "dependency");
    command("switch", "pbi");
    command("rebase", "main");
    assert.notEqual(key(), beforeKey);
  }));
