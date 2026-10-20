import { setTimeout } from "node:timers/promises";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { git } from "./changes.mjs";
import { githubClient, repository } from "./github-client.mjs";
import { readProtection } from "./main-protection.mjs";
import { readiness, assertPlan } from "./pr-readiness.mjs";

export function openPullRequest(client, branch, title, body) {
  const owner = client.repo.split("/")[0];
  const existing = client
    .pages(
      `pulls?state=open&base=main&head=${encodeURIComponent(owner + ":" + branch)}&per_page=100`,
    )
    .flat();
  if (existing.length > 1) throw new Error("Plusieurs PR candidates");
  return (
    existing[0] ||
    client.api("pulls", {
      method: "POST",
      body: { head: branch, base: "main", title, body },
    })
  );
}

export async function publishPullRequest(
  client,
  number,
  head,
  base,
  { prepare = false, pause = setTimeout, attempts = 720 } = {},
) {
  for (let count = 0; count < attempts; count++) {
    if (client.api("branches/main").commit.sha !== base)
      throw new Error("Main a avance: resynchroniser et republier");
    const pr = client.api(`pulls/${number}`);
    if (
      pr.head.repo?.full_name !== client.repo ||
      pr.base.repo?.full_name !== client.repo
    )
      throw new Error("Depot de PR inattendu");
    const runs = client
      .pages(
        `actions/workflows/quality.yml/runs?event=pull_request&head_sha=${head}&per_page=100`,
      )
      .flatMap((page) => page.workflow_runs);
    const run = runs.find((item) =>
      item.pull_requests?.some((item) => item.number === number),
    );
    const checks = run
      ? client
          .pages(`check-suites/${run.check_suite_id}/check-runs?per_page=100`)
          .flatMap((page) => page.check_runs)
      : [];
    if (readiness(pr, head, base, run, checks) !== "success") {
      if (count % 6 === 0)
        console.log(`[PR] Attente CI de #${number}, HEAD ${head}`);
      await pause(5000);
      continue;
    }
    assertPlan(client.plan(run.id), pr);
    const tested = client.api(`git/commits/${pr.merge_commit_sha}`);
    if (
      tested.parents?.length !== 2 ||
      tested.parents[0].sha !== base ||
      tested.parents[1].sha !== head ||
      !/^[a-f0-9]{40}$/.test(tested.tree?.sha || "")
    )
      throw new Error("Parents du merge synthetique inattendus");
    if (prepare)
      return {
        pr: number,
        head,
        base,
        testedMerge: pr.merge_commit_sha,
        run: run.id,
      };
    readProtection(client);
    const current = client.api(`pulls/${number}`);
    if (
      current.head.sha !== head ||
      current.base.sha !== base ||
      current.merge_commit_sha !== pr.merge_commit_sha ||
      client.api("branches/main").commit.sha !== base
    )
      throw new Error("Candidat modifie apres CI: nouvelle validation requise");
    const result = client.api(`pulls/${number}/merge`, {
      method: "PUT",
      body: { sha: head, merge_method: "merge" },
    });
    if (!result.merged || !/^[a-f0-9]{40}$/.test(result.sha || ""))
      throw new Error("Fusion refusee par GitHub");
    return {
      pr: number,
      head,
      base,
      testedMerge: pr.merge_commit_sha,
      run: run.id,
      testedTree: tested.tree.sha,
      mergeSha: result.sha,
    };
  }
  throw new Error("Delai CI PR depasse: aucune fusion");
}

export async function main(root, head, branch, prepare) {
  const client = githubClient(repository(root));
  const base = git(root, "rev-parse", "origin/main").trim();
  const title = git(root, "log", "-1", "--format=%s").trim();
  const commits = git(root, "log", "--format=- %s", "origin/main..HEAD").trim();
  const pr = openPullRequest(
    client,
    branch,
    title,
    `${commits}\n\nPublication via npm run publish : pre-push proportionne obligatoire, CI independante du merge synthetique, fusion sous protection sans bypass et synchronisation locale sure.`,
  );
  console.log(`[PR] ${pr.html_url}`);
  const result = await publishPullRequest(client, pr.number, head, base, {
    prepare,
  });
  const directory = resolve(root, ".cache/quality");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    resolve(directory, "published.json"),
    JSON.stringify(result, null, 2),
  );
  console.log(
    prepare
      ? "[PASS] PR validee, preparation seule: aucune fusion"
      : `[PASS] PR #${result.pr} fusionnee: ${result.mergeSha}`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv[3] === "--check-origin") {
    console.log(repository(process.argv[2]));
  } else
    main(
      process.argv[2],
      process.argv[3],
      process.argv[4],
      process.argv[5] === "--prepare",
    ).catch((error) => {
      console.error(`[FAIL] ${error.message}`);
      process.exitCode = 1;
    });
}
