import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  directMainRules,
  assertDirectProtection,
  readDirectProtection,
} from "../main-protection.mjs";

function fixture() {
  const source = { ...directMainRules(), id: 7 };
  const rules = source.rules.map((rule) => ({
    ...rule,
    ruleset_id: source.id,
  }));
  return { source, rules };
}

test("direct policy permits main integration while preventing rewriting and deletion for every actor", () => {
  const { source, rules } = fixture();
  assert.doesNotThrow(() => assertDirectProtection(rules, [source]));
  assert.deepEqual(source.conditions.ref_name, {
    include: ["refs/heads/main"],
    exclude: [],
  });
  for (const type of ["deletion", "non_fast_forward"])
    assert.throws(() =>
      assertDirectProtection(
        rules.filter((rule) => rule.type !== type),
        [source],
      ),
    );
  for (const bypass of [
    undefined,
    [{ actor_type: "RepositoryRole", actor_id: 5 }],
  ])
    assert.throws(() =>
      assertDirectProtection(rules, [{ ...source, bypass_actors: bypass }]),
    );
  assert.throws(() =>
    assertDirectProtection(rules, [{ ...source, enforcement: "disabled" }]),
  );
});

test("PR, merge queue, required checks and unknown integration constraints refuse before a push", () => {
  const { source, rules } = fixture();
  for (const type of [
    "pull_request",
    "merge_queue",
    "required_status_checks",
    "workflows",
    "update",
  ]) {
    assert.throws(
      () =>
        assertDirectProtection([...rules, { type, ruleset_id: 7 }], [source]),
      /incompatible avec le push direct/,
    );
  }
  const paths = [];
  const result = readDirectProtection({
    pages: (path) => {
      paths.push(path);
      return [rules];
    },
    api: (path) => {
      paths.push(path);
      return source;
    },
  });
  assert.deepEqual(result.rules, rules);
  assert.equal(paths.length, 2);
  assert.ok(paths.every((path) => !path.startsWith("pulls")));
});

test("canonical publisher contains no automatic pull-request entry point", () => {
  for (const path of [
    "../../publish.ps1",
    "../wait-ci.mjs",
    "../main-protection.mjs",
  ]) {
    const source = readFileSync(
      fileURLToPath(new URL(path, import.meta.url)),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /\bgh\s+pr\s+(create|merge)\b|publish-pr\.mjs|["'\x60]pulls(?:\/|["'\x60])/,
    );
  }
});
