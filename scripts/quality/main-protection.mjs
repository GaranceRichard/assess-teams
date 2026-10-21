import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { git } from "./changes.mjs";

export function directMainRules() {
  return {
    name: "Assess teams - main direct push",
    target: "branch",
    enforcement: "active",
    bypass_actors: [],
    conditions: { ref_name: { include: ["refs/heads/main"], exclude: [] } },
    rules: [{ type: "deletion" }, { type: "non_fast_forward" }],
  };
}

export function assertDirectProtection(rules, sources) {
  const allowed = new Set(["deletion", "non_fast_forward"]);
  if (rules.some((rule) => !allowed.has(rule.type)))
    throw new Error(
      "Regle incompatible avec le push direct : aucune PR ni CI prealable autorisee",
    );
  for (const type of allowed) {
    if (!rules.some((rule) => rule.type === type))
      throw new Error("Protection main absente: " + type);
  }
  const ids = new Set(rules.map((rule) => rule.ruleset_id));
  if (
    ids.has(undefined) ||
    sources.length !== ids.size ||
    sources.some(
      (source) =>
        !ids.has(source.id) ||
        source.enforcement !== "active" ||
        !Array.isArray(source.bypass_actors) ||
        source.bypass_actors.length,
    )
  )
    throw new Error("Protection active sans bypass non demontree");
}

export function readDirectProtection(client) {
  const rules = client.pages("rules/branches/main?per_page=100").flat();
  const sources = [...new Set(rules.map((rule) => rule.ruleset_id))].map((id) =>
    client.api("rulesets/" + id + "?includes_parents=true"),
  );
  assertDirectProtection(rules, sources);
  return { rules, sources };
}

export function verifyRemote(root) {
  const remote = git(root, "remote", "get-url", "origin").trim();
  const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!match) {
    if (/^(https?:|ssh:|git@)/.test(remote))
      throw new Error("Remote non pris en charge");
    console.log("[POLICY] Fixture Git locale: pas de regles GitHub");
    return;
  }
  const prefix = "repos/" + match[1] + "/";
  const read = (args) =>
    JSON.parse(
      execFileSync("gh", ["api", ...args], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
  const result = readDirectProtection({
    api: (path) => read(["-X", "GET", prefix + path]),
    pages: (path) => read(["--paginate", "--slurp", prefix + path]),
  });
  console.log(
    "[PASS] Main: push direct autorise, force-push/suppression interdits, bypass vide; rulesets " +
      result.sources.map((source) => source.id).join(","),
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    verifyRemote(process.argv[2]);
  } catch (error) {
    console.error("[FAIL] " + error.message);
    process.exitCode = 1;
  }
}
