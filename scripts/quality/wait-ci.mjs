import { execFileSync } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { git } from "./changes.mjs";

export function conclusion(runs, sha) {
  const run = runs.find(
    (item) => item.headSha === sha && item.event === "push",
  );
  if (!run || run.status !== "completed") return "pending";
  return run.conclusion === "success" ? "success" : "failure";
}

export async function waitForCI(
  root,
  sha,
  { query, pause = setTimeout, attempts = 240 } = {},
) {
  const remote = git(root, "remote", "get-url", "origin").trim();
  const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!match) {
    if (/^(https?:|ssh:|git@)/.test(remote))
      throw new Error("CI distante non prise en charge");
    console.log("[CI] Remote de fixture local: aucune CI GitHub");
    return;
  }
  const read =
    query ||
    (() =>
      JSON.parse(
        execFileSync(
          "gh",
          [
            "run",
            "list",
            "--repo",
            match[1],
            "--workflow",
            "quality.yml",
            "--commit",
            sha,
            "--event",
            "push",
            "--limit",
            "20",
            "--json",
            "headSha,event,status,conclusion,url",
          ],
          { encoding: "utf8" },
        ),
      ));
  for (let count = 0; count < attempts; count++) {
    const runs = read();
    const result = conclusion(runs, sha);
    if (result === "success") {
      console.log(`[PASS] CI independante verte pour ${sha}`);
      return;
    }
    if (result === "failure")
      throw new Error(`CI echouee/annulee pour ${sha}: ${runs[0]?.url || ""}`);
    if (count % 6 === 0)
      console.log(`[CI] Attente du resultat du commit exact ${sha}`);
    await pause(5000);
  }
  throw new Error(
    `Delai CI depasse pour ${sha}; publication presente mais livraison non qualifiee`,
  );
}

if (process.argv[1]?.endsWith("wait-ci.mjs")) {
  try {
    await waitForCI(process.argv[2], process.argv[3]);
  } catch (error) {
    console.error(`[FAIL] ${error.message}`);
    process.exitCode = 1;
  }
}
