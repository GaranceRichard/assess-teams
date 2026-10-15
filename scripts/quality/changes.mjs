import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}
export function commit(root, ref) {
  if (!ref || ref.startsWith("-")) throw new Error("Reference Git invalide");
  return git(root, "rev-parse", "--verify", `${ref}^{commit}`).trim();
}

export function changesBetween(root, base, head, { working = false } = {}) {
  const candidate = commit(root, head);
  const integration = commit(root, base);
  // The publishing guard requires ancestry; PR callers pass the merge base.
  const raw = git(
    root,
    "diff",
    "--raw",
    "--no-abbrev",
    "--no-renames",
    "-z",
    integration,
    ...(working ? [] : [candidate]),
    "--",
  ).split("\0");
  const changes = [];
  for (let index = 0; index < raw.length - 1; index += 2) {
    const fields = raw[index].split(" ");
    const path = raw[index + 1];
    const status = fields[4];
    const mode = fields[1];
    const patch = git(
      root,
      "diff",
      "--no-ext-diff",
      "--no-textconv",
      "--unified=0",
      integration,
      ...(working ? [] : [candidate]),
      "--",
      path,
    );
    changes.push({ path, status, mode, patch });
  }
  if (working) {
    for (const path of git(
      root,
      "ls-files",
      "--others",
      "--exclude-standard",
      "-z",
    )
      .split("\0")
      .filter(Boolean)) {
      const file = resolve(root, path);
      const link = lstatSync(file).isSymbolicLink();
      changes.push({
        path,
        status: "A",
        mode: link ? "120000" : "100644",
        patch: link ? "" : readFileSync(file, "utf8"),
      });
    }
  }
  return { base: integration, candidate, changes };
}

export function pushRange(root, input) {
  const lines = input.trim().split(/\r?\n/);
  if (lines.length !== 1)
    throw new Error("Une seule mise a jour main est requise");
  const fields = lines[0].split(/\s+/);
  if (fields.length !== 4) throw new Error("References de push invalides");
  const [, head, destination, base] = fields;
  if (
    destination !== "refs/heads/main" ||
    /^0+$/.test(base) ||
    head !== commit(root, "HEAD")
  )
    throw new Error("Le candidat pousse doit etre HEAD vers main existant");
  git(root, "merge-base", "--is-ancestor", base, head);
  if (git(root, "status", "--porcelain").trim())
    throw new Error("Candidat non commite");
  return { base, head };
}
