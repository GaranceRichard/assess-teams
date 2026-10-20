import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../../publish.ps1", import.meta.url));
const powershell = process.platform === "win32" ? "powershell.exe" : "pwsh";
const policy =
  process.platform === "win32" ? ["-ExecutionPolicy", "Bypass"] : [];
// Hooks export GIT_DIR/GIT_INDEX_FILE: fixture subprocesses must never inherit them.
const fixtureEnv = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);
const git = (cwd, ...args) =>
  execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    env: fixtureEnv,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "assess-publish-test-"));
  const remote = join(root, "remote.git");
  const primary = join(root, "primary");
  const worktree = join(root, "pbi");
  mkdirSync(primary);
  git(root, "init", "--bare", remote);
  git(primary, "init", "-b", "main");
  git(primary, "config", "user.email", "test@example.invalid");
  git(primary, "config", "user.name", "Validation test");
  writeFileSync(join(primary, "README.md"), "Initial\n");
  git(primary, "add", "README.md");
  git(primary, "commit", "-m", "Initial");
  git(primary, "remote", "add", "origin", remote);
  git(primary, "push", "origin", "main");
  git(primary, "worktree", "add", "-b", "pbi", worktree);
  writeFileSync(join(worktree, "feature.txt"), "Candidate\n");
  git(worktree, "add", "feature.txt");
  git(worktree, "commit", "-m", "Candidate");
  return {
    root,
    primary,
    worktree,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function publish(worktree) {
  return spawnSync(
    powershell,
    ["-NoProfile", ...policy, "-File", script, "-Root", worktree],
    { encoding: "utf8", env: fixtureEnv, timeout: 30000 },
  );
}

test("unsupported transports refuse without fallback to direct-main", () => {
  const f = fixture();
  try {
    const candidate = git(f.primary, "rev-parse", "HEAD");
    const result = publish(f.worktree);
    assert.notEqual(result.status, 0);
    assert.equal(git(f.primary, "rev-parse", "main"), candidate);
    assert.equal(git(f.primary, "rev-parse", "origin/main"), candidate);
    assert.equal(git(f.primary, "status", "--porcelain"), "");
    assert.equal(git(f.worktree, "symbolic-ref", "--short", "HEAD"), "pbi");
  } finally {
    f.cleanup();
  }
});

test("dirty primary and divergent main block publication without overwriting data", () => {
  const f = fixture();
  try {
    const before = git(f.primary, "rev-parse", "origin/main");
    writeFileSync(join(f.primary, "README.md"), "User changes\n");
    assert.notEqual(publish(f.worktree).status, 0);
    assert.equal(git(f.primary, "rev-parse", "origin/main"), before);
    git(f.primary, "add", "README.md");
    git(f.primary, "commit", "-m", "Local main divergence");
    const divergent = git(f.primary, "rev-parse", "HEAD");
    assert.notEqual(publish(f.worktree).status, 0);
    assert.equal(git(f.primary, "rev-parse", "HEAD"), divergent);
    assert.equal(git(f.primary, "rev-parse", "origin/main"), before);
  } finally {
    f.cleanup();
  }
});

test("shared integration lock rejects a second publisher before fetching", async () => {
  const f = fixture();
  const path = resolve(f.primary, ".git/assess-integration.lock").replaceAll(
    "'",
    "''",
  );
  const holder = spawn(
    powershell,
    [
      "-NoProfile",
      ...policy,
      "-Command",
      `$lock = [IO.File]::Open('${path}', 'OpenOrCreate', 'ReadWrite', 'None'); ` +
        "[Console]::WriteLine('LOCKED'); [Console]::ReadLine() | Out-Null; $lock.Dispose()",
    ],
    { stdio: ["pipe", "pipe", "pipe"], env: fixtureEnv },
  );
  try {
    await once(holder.stdout, "data");
    const result = publish(f.worktree);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /integration est deja active/);
  } finally {
    const exited = once(holder, "exit");
    holder.stdin.end("release\n");
    await exited;
    f.cleanup();
  }
});
