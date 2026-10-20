import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { pushRange } from "../changes.mjs";

const script = fileURLToPath(
  new URL("../check-contribution-workflow.ps1", import.meta.url),
);
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);
const git = (cwd, ...args) =>
  execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    env,
    stdio: "pipe",
  }).trim();
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "assess-pr-guard-"));
  const primary = join(root, "primary"),
    worktree = join(root, "pbi");
  mkdirSync(primary);
  git(root, "init", "--bare", "remote.git");
  git(primary, "init", "-b", "main");
  git(primary, "config", "user.email", "test@example.invalid");
  git(primary, "config", "user.name", "PR test");
  writeFileSync(join(primary, "README.md"), "base\n");
  git(primary, "add", ".");
  git(primary, "commit", "-m", "base");
  git(primary, "remote", "add", "origin", join(root, "remote.git"));
  git(primary, "push", "origin", "main");
  const base = git(primary, "rev-parse", "HEAD");
  git(primary, "worktree", "add", "-b", "pbi", worktree);
  writeFileSync(join(worktree, "feature.txt"), "feature\n");
  git(worktree, "add", ".");
  git(worktree, "commit", "-m", "feature");
  return {
    root,
    primary,
    worktree,
    base,
    head: git(worktree, "rev-parse", "HEAD"),
  };
}
function guard(root, updates, remote = "origin") {
  const executable = process.platform === "win32" ? "powershell.exe" : "pwsh";
  return spawnSync(
    executable,
    [
      "-NoProfile",
      ...(process.platform === "win32" ? ["-ExecutionPolicy", "Bypass"] : []),
      "-File",
      script,
      "-Root",
      root,
      "-RemoteName",
      remote,
      "-PushUpdates",
      updates,
    ],
    { encoding: "utf8", env, timeout: 30000 },
  );
}

test("real guard accepts initial branch and updates, but refuses forbidden destinations and state", () => {
  const f = fixture();
  try {
    const line = (previous = "0".repeat(40)) =>
      `refs/heads/pbi ${f.head} refs/heads/pbi ${previous}\n`;
    assert.equal(guard(f.worktree, line()).status, 0);
    assert.equal(guard(f.worktree, line(f.base)).status, 0);
    for (const input of [
      line().replaceAll("refs/heads/pbi", "refs/heads/main"),
      line().replace(" refs/heads/pbi ", " refs/heads/other "),
      line().replace(f.head, "0".repeat(40)),
      line() + line(),
      line().replace(f.head, f.base),
    ])
      assert.notEqual(guard(f.worktree, input).status, 0);
    assert.notEqual(guard(f.primary, line()).status, 0);
    assert.notEqual(guard(f.worktree, line(), "other").status, 0);
    const saved = Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith("GIT_")),
    );
    for (const key of Object.keys(saved)) delete process.env[key];
    try {
      const range = pushRange(f.worktree, line(f.base));
      assert.deepEqual(range, { base: f.base, head: f.head });
    } finally {
      Object.assign(process.env, saved);
    }
    writeFileSync(join(f.worktree, "feature.txt"), "uncommitted\n");
    assert.notEqual(guard(f.worktree, line()).status, 0);
    assert.equal(git(f.primary, "rev-parse", "HEAD"), f.base);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});

test("branch update cannot hide an earlier application diff or rewrite published history", () => {
  const f = fixture();
  try {
    const first = f.head;
    writeFileSync(join(f.worktree, "README.md"), "docs increment\n");
    git(f.worktree, "commit", "-am", "docs increment");
    const head = git(f.worktree, "rev-parse", "HEAD");
    assert.equal(
      guard(f.worktree, `refs/heads/pbi ${head} refs/heads/pbi ${first}\n`)
        .status,
      0,
    );
    assert.match(
      git(f.worktree, "diff", "--name-only", "origin/main", head),
      /feature.txt/,
    );
    git(f.worktree, "reset", "--hard", f.base);
    assert.notEqual(
      guard(f.worktree, `refs/heads/pbi ${f.base} refs/heads/pbi ${first}\n`)
        .status,
      0,
    );
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
