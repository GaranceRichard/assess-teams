import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { changesBetween, git, pushRange } from "./changes.mjs";
import { planImpact } from "./impact.mjs";
import { isolatedEnvironment } from "./isolation.mjs";
import { executeCheck, fingerprint } from "./impact-runner.mjs";
import { runValidation } from "./validate.mjs";

export function validatePlan(
  root,
  range,
  plan,
  { fresh = false, only, run, key } = {},
) {
  const checks = plan.checks.filter(
    (check) =>
      !only || check.scope.split("-")[0] === only || check.scope === only,
  );
  if (!checks.length) throw new Error(`Controle non requis: ${only}`);
  const env = { ...isolatedEnvironment(root), QUALITY_DIFF_BASE: range.base };
  const selection = Object.fromEntries(
    checks.map((check) => [check.scope, check]),
  );
  console.log(
    `[IMPACT] ${range.base} -> ${range.candidate}${range.working ? " + travail local" : ""}`,
  );
  for (const item of plan.classifications)
    console.log(`[WHY] ${item.path}: ${item.reason}`);
  for (const scope of plan.skipped)
    console.log(`[SKIP] ${scope}: aucun changement applicatif dans ce domaine`);
  return runValidation({
    root,
    scopes: checks.map(({ scope }) => scope),
    fresh,
    env,
    key: key || ((scope) => fingerprint(root, env, selection[scope])),
    run: run || ((scope) => executeCheck(root, env, selection[scope])),
    freshScopes: process.env.ASSESS_E2E_DB ? ["e2e", "e2e-targeted"] : [],
    metadata: { base: range.base, candidate: range.candidate, checks },
  });
}

export function main(args = process.argv.slice(2)) {
  let base = "origin/main",
    head = "HEAD",
    working = true,
    planOnly = false;
  let fresh = Boolean(process.env.CI),
    only,
    prePush = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--base") base = args[++index];
    else if (arg === "--head") {
      head = args[++index];
      working = false;
    } else if (arg === "--plan") planOnly = true;
    else if (arg === "--fresh") fresh = true;
    else if (arg === "--only") only = args[++index];
    else if (arg === "--pre-push") prePush = true;
    else throw new Error(`Argument inconnu: ${arg}`);
  }
  const root = fileURLToPath(new URL("../../", import.meta.url));
  if (process.env.ASSESS_E2E_SHARD)
    throw new Error("Une selection ne peut pas etre shardee");
  if (prePush) {
    ({ base, head } = pushRange(root, readFileSync(0, "utf8")));
    working = false;
  }
  const range = { ...changesBetween(root, base, head, { working }), working };
  const plan = planImpact(range.changes);
  // Non-regular types/modes cannot reuse a proof that hashes ordinary source files.
  fresh ||= range.changes.some(
    ({ mode }) => !["100644", "000000"].includes(mode),
  );
  const directory = resolve(root, ".cache/quality");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    resolve(directory, "plan.json"),
    JSON.stringify(
      { ...plan, base: range.base, candidate: range.candidate },
      null,
      2,
    ),
  );
  if (planOnly) {
    console.log(JSON.stringify(plan, null, 2));
    if (process.env.GITHUB_OUTPUT) {
      const flags = ["backend", "frontend", "e2e"].map(
        (domain) =>
          `${domain}=${plan.checks.some(({ scope }) => scope.startsWith(domain))}`,
      );
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        [
          `full=${plan.exhaustive}`,
          `repository=${plan.checks[0].scope}`,
          ...flags,
          `plan=${JSON.stringify(plan)}`,
        ].join("\n") + "\n",
      );
    }
    return 0;
  }
  const before = !working ? git(root, "status", "--porcelain") : null;
  if (!working && before.trim()) throw new Error("Candidat non commite");
  const status = validatePlan(root, range, plan, { fresh, only });
  if (
    !working &&
    (git(root, "rev-parse", "HEAD").trim() !== range.candidate ||
      git(root, "status", "--porcelain") !== before)
  )
    throw new Error("Le candidat a change pendant le gate");
  return status;
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
