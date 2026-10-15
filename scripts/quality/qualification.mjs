import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { commit, git } from "./changes.mjs";
import { main as full } from "./validate.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
export function assertCandidate(root, expected) {
  const sha = commit(root, "HEAD");
  if (!/^[a-f0-9]{40}$/.test(expected) || sha !== expected)
    throw new Error("La qualification exige le SHA complet exact du candidat");
  if (git(root, "status", "--porcelain").trim())
    throw new Error("Candidat non commite");
  return sha;
}

export function verifyQualification(proof, run, sha, runId) {
  if (
    !/^[a-f0-9]{40}$/.test(sha) ||
    run.conclusion !== "success" ||
    run.status !== "completed" ||
    run.path !== ".github/workflows/exhaustive.yml" ||
    !["schedule", "workflow_dispatch"].includes(run.event) ||
    String(run.id) !== String(runId) ||
    proof.sha !== sha ||
    String(proof.runId) !== String(runId) ||
    proof.success !== true ||
    proof.exhaustive !== true ||
    proof.provenance !== "github-actions"
  )
    throw new Error(
      "Promotion refusee: preuve exhaustive distante du candidat exact absente",
    );
  return true;
}

export function main(args = process.argv.slice(2)) {
  const [mode, expected = git(root, "rev-parse", "HEAD").trim(), runId] = args;
  const directory = resolve(root, ".cache/quality");
  mkdirSync(directory, { recursive: true });
  if (mode === "promote") {
    if (!/^\d+$/.test(runId || ""))
      throw new Error("Usage: quality:promote -- SHA RUN_ID");
    const repository =
      process.env.GITHUB_REPOSITORY ||
      git(root, "remote", "get-url", "origin")
        .trim()
        .match(/github\.com[:/](.+?)(?:\.git)?$/)?.[1];
    if (!repository) throw new Error("Depot GitHub introuvable");
    const gh = (argv) => execFileSync("gh", argv, { encoding: "utf8" });
    const run = JSON.parse(
      gh(["api", `repos/${repository}/actions/runs/${runId}`]),
    );
    // Check remote authority before downloading any artifact.
    if (
      run.conclusion !== "success" ||
      run.path !== ".github/workflows/exhaustive.yml"
    )
      throw new Error("Qualification distante echouee ou workflow incorrect");
    const destination = mkdtempSync(resolve(directory, "promotion-"));
    gh([
      "run",
      "download",
      runId,
      "--repo",
      repository,
      "--name",
      "qualification",
      "--dir",
      destination,
    ]);
    const proof = JSON.parse(
      readFileSync(resolve(destination, "qualification.json")),
    );
    verifyQualification(proof, run, expected, runId);
    console.log(
      `[PASS] Promotion autorisee: ${expected}, qualification GitHub ${runId}`,
    );
    return 0;
  }
  const sha = assertCandidate(root, expected);
  if (mode === "identify") {
    if (process.env.GITHUB_STEP_SUMMARY)
      writeFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `Qualification exhaustive du commit **${sha}**\n`,
      );
    return 0;
  }
  if (process.env.ASSESS_E2E_SHARD)
    throw new Error("Qualification partielle interdite");
  if (mode === "local") {
    const status = full(["--fresh"]);
    if (status) return status;
    assertCandidate(root, sha);
  } else if (
    mode !== "attest-ci" ||
    !process.env.CI ||
    !process.env.GITHUB_RUN_ID
  )
    throw new Error("Mode de qualification invalide");
  const proof = {
    sha,
    success: true,
    exhaustive: true,
    provenance: mode === "local" ? "local" : "github-actions",
    runId: process.env.GITHUB_RUN_ID || null,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(
    resolve(directory, "qualification.json"),
    JSON.stringify(proof, null, 2),
  );
  console.log(`[PASS] Qualification exhaustive ${proof.provenance}: ${sha}`);
  return 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`[FAIL] ${error.message}`);
    process.exitCode = 1;
  }
}
