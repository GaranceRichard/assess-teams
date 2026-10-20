import assert from "node:assert/strict";
import test from "node:test";
import { publishPullRequest, openPullRequest } from "../publish-pr.mjs";
import { protectionRules } from "../main-protection.mjs";

const head = "a".repeat(40),
  base = "b".repeat(40),
  merge = "c".repeat(40);
function fixture({ red = false, bypass = false, race = false } = {}) {
  const calls = [];
  let reads = 0;
  const pr = {
    number: 7,
    state: "open",
    draft: false,
    head: { sha: head, repo: { full_name: "owner/repo" } },
    base: { ref: "main", sha: base, repo: { full_name: "owner/repo" } },
    mergeable: true,
    mergeable_state: "clean",
    merge_commit_sha: merge,
  };
  const source = { ...protectionRules(), id: 9 };
  if (bypass)
    source.bypass_actors.push({ actor_type: "RepositoryRole", actor_id: 5 });
  const client = {
    repo: "owner/repo",
    api(path, options) {
      calls.push([path, options]);
      if (path === "branches/main") return { commit: { sha: base } };
      if (path === "pulls/7") {
        reads++;
        return race && reads > 1 ? { ...pr, head: { sha: base } } : pr;
      }
      if (path.startsWith("rulesets/")) return source;
      if (path.startsWith("git/commits/"))
        return {
          tree: { sha: "d".repeat(40) },
          parents: [{ sha: base }, { sha: head }],
        };
      if (path === "pulls/7/merge")
        return { merged: true, sha: "e".repeat(40) };
      if (path === "pulls") return pr;
      throw new Error("Unexpected " + path);
    },
    pages(path) {
      if (path.startsWith("pulls?")) return [[]];
      if (path.startsWith("rules/"))
        return [source.rules.map((rule) => ({ ...rule, ruleset_id: 9 }))];
      if (path.startsWith("actions/"))
        return [
          {
            workflow_runs: [
              {
                id: 80,
                event: "pull_request",
                path: ".github/workflows/quality.yml",
                head_sha: head,
                status: "completed",
                conclusion: red ? "failure" : "success",
                check_suite_id: 90,
                pull_requests: [
                  { number: 7, head: { sha: head }, base: { sha: base } },
                ],
              },
            ],
          },
        ];
      if (path.startsWith("check-suites/"))
        return [
          {
            check_runs: [
              {
                name: "Required impact gate",
                app: { id: 15368 },
                head_sha: merge,
                check_suite: { id: 90 },
                status: "completed",
                conclusion: "success",
              },
            ],
          },
        ];
      throw new Error("Unexpected " + path);
    },
    plan() {
      return { base, candidate: merge };
    },
  };
  return { client, calls };
}

test("PR publisher merges with expected head only after CI and active protection", async () => {
  const f = fixture();
  const result = await publishPullRequest(f.client, 7, head, base);
  assert.equal(result.mergeSha, "e".repeat(40));
  assert.equal(result.testedTree, "d".repeat(40));
  assert.deepEqual(f.calls.find(([path]) => path.endsWith("/merge"))[1], {
    method: "PUT",
    body: { sha: head, merge_method: "merge" },
  });
  assert.ok(
    f.calls.findIndex(([path]) => path.startsWith("rulesets/")) <
      f.calls.findIndex(([path]) => path.endsWith("/merge")),
  );
});

test("red CI, bypass, changed head and missing plan refuse before any merge", async () => {
  for (const options of [{ red: true }, { bypass: true }, { race: true }]) {
    const f = fixture(options);
    await assert.rejects(publishPullRequest(f.client, 7, head, base));
    assert.ok(!f.calls.some(([path]) => path.endsWith("/merge")));
  }
  const f = fixture();
  f.client.plan = () => ({ base, candidate: head });
  await assert.rejects(
    publishPullRequest(f.client, 7, head, base),
    /synthetique/,
  );
  assert.ok(!f.calls.some(([path]) => path.endsWith("/merge")));
});

test("prepare validates CI without requesting a merge or weakening any protection", async () => {
  const f = fixture({ bypass: true });
  const result = await publishPullRequest(f.client, 7, head, base, {
    prepare: true,
  });
  assert.equal(result.mergeSha, undefined);
  assert.ok(!f.calls.some(([, options]) => options));
});

test("pending or absent CI times out without a merge and main advance refuses", async () => {
  const f = fixture();
  f.client.pages = (path) =>
    path.startsWith("actions/") ? [{ workflow_runs: [] }] : [];
  await assert.rejects(
    publishPullRequest(f.client, 7, head, base, {
      attempts: 2,
      pause: async () => {},
    }),
    /Delai/,
  );
  assert.ok(!f.calls.some(([path]) => path.endsWith("/merge")));
  f.client.api = () => ({ commit: { sha: head } });
  await assert.rejects(publishPullRequest(f.client, 7, head, base), /avance/);
});

test("opening a PR reuses its exact branch and refuses ambiguous candidates", () => {
  const f = fixture();
  const pr = openPullRequest(
    f.client,
    "pbi",
    "Feature",
    "Reviewed description",
  );
  assert.equal(pr.number, 7);
  assert.equal(f.calls[0][1].body.base, "main");
  f.client.pages = () => [[pr]];
  assert.equal(openPullRequest(f.client, "pbi", "Feature", "Body"), pr);
  f.client.pages = () => [[pr, pr]];
  assert.throws(
    () => openPullRequest(f.client, "pbi", "Feature", "Body"),
    /Plusieurs/,
  );
});
