import assert from "node:assert/strict";
import test from "node:test";
import { protectionRules, assertProtection } from "../main-protection.mjs";
import { readiness, assertPlan } from "../pr-readiness.mjs";

const head = "a".repeat(40),
  base = "b".repeat(40),
  merge = "c".repeat(40);
export const pr = {
  number: 7,
  state: "open",
  draft: false,
  head: { sha: head },
  base: { ref: "main", sha: base },
  mergeable: true,
  mergeable_state: "clean",
  merge_commit_sha: merge,
};
export const run = {
  id: 80,
  event: "pull_request",
  path: ".github/workflows/quality.yml",
  head_sha: head,
  status: "completed",
  conclusion: "success",
  check_suite_id: 90,
  pull_requests: [{ number: 7, head: { sha: head }, base: { sha: base } }],
};
export const check = {
  name: "Required impact gate",
  app: { id: 15368 },
  head_sha: merge,
  check_suite: { id: 90 },
  status: "completed",
  conclusion: "success",
};

test("main policy requires strict impact gate, PR, no force/deletion and no bypass", () => {
  const source = { ...protectionRules(), id: 9 };
  const rules = source.rules.map((rule) => ({ ...rule, ruleset_id: 9 }));
  assert.doesNotThrow(() => assertProtection(rules, [source]));
  for (const type of [
    "deletion",
    "non_fast_forward",
    "pull_request",
    "required_status_checks",
  ])
    assert.throws(() =>
      assertProtection(
        rules.filter((rule) => rule.type !== type),
        [source],
      ),
    );
  for (const altered of [
    {
      ...source,
      bypass_actors: [{ actor_type: "RepositoryRole", actor_id: 5 }],
    },
    { ...source, enforcement: "disabled" },
    { ...source, bypass_actors: undefined },
  ])
    assert.throws(() => assertProtection(rules, [altered]), /sans bypass/);
  assert.throws(
    () =>
      assertProtection(
        rules.map((rule) =>
          rule.type === "pull_request"
            ? {
                ...rule,
                parameters: {
                  ...rule.parameters,
                  allowed_merge_methods: ["merge", "squash"],
                },
              }
            : rule,
        ),
        [source],
      ),
    /PR incompatibles/,
  );
  for (const parameters of [
    { ...rules[3].parameters, strict_required_status_checks_policy: false },
    {
      ...rules[3].parameters,
      required_status_checks: [{ context: "Full quality gate" }],
    },
    { ...rules[3].parameters, do_not_enforce_on_create: true },
  ])
    assert.throws(
      () =>
        assertProtection(
          [...rules.slice(0, 3), { ...rules[3], parameters }],
          [source],
        ),
      /strict/,
    );
});

test("readiness binds successful run, exact PR/base/head and Actions check suite", () => {
  assert.equal(readiness(pr, head, base, run, [check]), "success");
  assertPlan({ base, candidate: merge }, pr);
  for (const altered of [
    { ...pr, draft: true },
    { ...pr, state: "closed" },
    { ...pr, head: { sha: base } },
    { ...pr, base: { ref: "other", sha: base } },
    { ...pr, mergeable_state: "behind" },
    { ...pr, mergeable: false },
  ])
    assert.throws(() => readiness(altered, head, base, run, [check]));
  for (const altered of [
    { ...run, conclusion: "failure" },
    { ...run, conclusion: "cancelled" },
    { ...run, event: "push" },
    { ...run, path: ".github/workflows/other.yml" },
    { ...run, pull_requests: [] },
    { ...run, head_sha: base },
  ])
    assert.throws(() => readiness(pr, head, base, altered, [check]));
  for (const altered of [
    { ...check, conclusion: "skipped" },
    { ...check, conclusion: "neutral" },
    { ...check, app: { id: 123 } },
    { ...check, check_suite: { id: 91 } },
    { ...check, head_sha: base },
  ])
    assert.throws(() => readiness(pr, head, base, run, [altered]));
  assert.throws(() => readiness(pr, head, base, run, []));
  assert.throws(() => readiness(pr, head, base, run, [check, check]));
  assert.equal(readiness(pr, head, base, undefined, []), "pending");
  assert.equal(
    readiness(pr, head, base, { ...run, status: "in_progress" }, []),
    "pending",
  );
  assert.throws(() => assertPlan({ base, candidate: head }, pr), /synthetique/);
  assert.throws(
    () => assertPlan({ base: head, candidate: merge }, pr),
    /synthetique/,
  );
});
