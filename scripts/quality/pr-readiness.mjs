import { impactCheck } from "./main-protection.mjs";

export function readiness(pr, head, base, run, checks) {
  if (
    pr.state !== "open" ||
    pr.draft ||
    pr.base.ref !== "main" ||
    pr.head.sha !== head ||
    pr.base.sha !== base
  )
    throw new Error("PR/base/HEAD inattendu, draft ou ferme");
  if (
    pr.mergeable === false ||
    ["dirty", "behind"].includes(pr.mergeable_state)
  )
    throw new Error(
      "PR conflictuelle ou en retard: resynchroniser puis republier",
    );
  if (!pr.mergeable || !pr.merge_commit_sha) return "pending";
  if (!run || run.status !== "completed") return "pending";
  if (
    run.event !== "pull_request" ||
    run.head_sha !== head ||
    run.path !== ".github/workflows/quality.yml" ||
    !run.pull_requests?.some(
      (item) =>
        item.number === pr.number &&
        item.head.sha === head &&
        item.base.sha === base,
    )
  )
    throw new Error("CI ne correspond pas a cette PR et a ses SHA");
  if (run.conclusion !== "success") throw new Error("CI PR echouee/annulee");
  const matching = checks.filter(
    (check) =>
      check.name === impactCheck.context &&
      check.app?.id === impactCheck.integration_id &&
      check.check_suite?.id === run.check_suite_id,
  );
  if (matching.length !== 1)
    throw new Error("Check obligatoire absent ou ambigu");
  const check = matching[0];
  if (![head, pr.merge_commit_sha].includes(check.head_sha))
    throw new Error("SHA du check obligatoire incorrect");
  if (check.status !== "completed") return "pending";
  if (check.conclusion !== "success")
    throw new Error("Check obligatoire non reussi");
  return "success";
}

export function assertPlan(plan, pr) {
  if (plan.base !== pr.base.sha || plan.candidate !== pr.merge_commit_sha)
    throw new Error(
      "Plan CI du merge synthetique et de la base attendus requis",
    );
}
