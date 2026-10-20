import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { git } from "./changes.mjs";

export function repository(root) {
  const remote = git(root, "remote", "get-url", "origin").trim();
  const match = remote.match(
    /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([\w.-]+\/[\w.-]+?)(?:\.git)?$/,
  );
  if (!match) throw new Error("Publication PR: origin GitHub requis");
  return match[1];
}

export function githubClient(repo) {
  const invoke = (args, input) =>
    JSON.parse(
      execFileSync("gh", args, {
        encoding: "utf8",
        input,
        stdio: ["pipe", "pipe", "pipe"],
      }),
    );
  const endpoint = (path) => `repos/${repo}/${path}`;
  return {
    repo,
    api(path, { method = "GET", body } = {}) {
      return invoke(
        [
          "api",
          "-X",
          method,
          "-H",
          "X-GitHub-Api-Version: 2022-11-28",
          endpoint(path),
          ...(body ? ["--input", "-"] : []),
        ],
        body ? JSON.stringify(body) : undefined,
      );
    },
    pages(path) {
      return invoke(["api", "--paginate", "--slurp", endpoint(path)]);
    },
    plan(runId) {
      const directory = mkdtempSync(join(tmpdir(), "assess-pr-plan-"));
      try {
        execFileSync(
          "gh",
          [
            "run",
            "download",
            String(runId),
            "--repo",
            repo,
            "--name",
            "impact-plan",
            "--dir",
            directory,
          ],
          { stdio: "pipe" },
        );
        return JSON.parse(readFileSync(join(directory, "plan.json"), "utf8"));
      } finally {
        const prefix =
          resolve(tmpdir()) + (process.platform === "win32" ? "\\" : "/");
        if (!resolve(directory).startsWith(prefix))
          throw new Error("Temporaire hors perimetre");
        rmSync(directory, { recursive: true, force: true });
      }
    },
  };
}
