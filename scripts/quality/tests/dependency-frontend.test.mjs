import assert from "node:assert/strict";
import test from "node:test";
import { frontendDependencies } from "../frontend-dependencies.mjs";
import { dependents } from "../dependency-graph.mjs";
import { planImpact } from "../impact.mjs";
import { dependencyFixture } from "./dependency-fixtures.mjs";

test("a local React component selects its integration and both associated browser builds", () =>
  dependencyFixture(({ root }) => {
    const plan = planImpact(["frontend/src/Widget.tsx"], { root });
    assert.equal(plan.exhaustive, false);
    assert.deepEqual(plan.skipped, ["backend"]);
    assert.deepEqual(plan.checks.at(-1).tests, ["frontend/e2e/first.spec.ts"]);
    assert.deepEqual(plan.checks.at(-1).demoTests, [
      "frontend/demo-e2e/first.spec.ts",
    ]);
    const graph = frontendDependencies(root).graph;
    const reached = dependents(graph, ["frontend/src/Widget.tsx"]);
    assert.ok(reached.has("frontend/src/Widget.test.tsx"));
    assert.ok(reached.has("frontend/src/FirstPage.test.tsx"));
    assert.ok(!reached.has("frontend/src/SecondPage.test.tsx"));
  }));

test("new consumer, test and route integration widen the selection automatically", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "frontend/src/SecondPage.tsx",
      "import {Widget} from './Widget'; export const SecondPage = Widget;",
    );
    put("frontend/src/WidgetNew.test.tsx", "import {Widget} from './Widget';");
    const plan = planImpact(["frontend/src/Widget.tsx"], { root });
    assert.deepEqual(plan.checks.at(-1).tests, [
      "frontend/e2e/first.spec.ts",
      "frontend/e2e/second.spec.ts",
    ]);
    assert.ok(
      dependents(frontendDependencies(root).graph, [
        "frontend/src/Widget.tsx",
      ]).has("frontend/src/WidgetNew.test.tsx"),
    );
  }));

test("a source module called Config is not infrastructure; consumers still determine selection", () =>
  dependencyFixture(({ root, put }) => {
    put("frontend/src/widgetConfig.ts", "export const config = 1;");
    put(
      "frontend/src/Widget.tsx",
      "import {config} from './widgetConfig'; export const Widget = () => <b>{config}</b>;",
    );
    const plan = planImpact(["frontend/src/widgetConfig.ts"], { root });
    assert.equal(plan.exhaustive, false);
    assert.deepEqual(plan.skipped, ["backend"]);
    assert.deepEqual(plan.checks.at(-1).tests, ["frontend/e2e/first.spec.ts"]);
  }));

test("shared CSS follows class consumers even without a local stylesheet import", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "frontend/src/Widget.tsx",
      "export const Widget = () => <div className='widget'>Premier</div>;",
    );
    put("frontend/src/widget.css", ".widget { color: red; }");
    const plan = planImpact(["frontend/src/widget.css"], { root });
    assert.equal(plan.exhaustive, false);
    assert.ok(
      plan.checks
        .find((c) => c.scope === "frontend-targeted")
        .tests.includes("frontend/src/Widget.test.tsx"),
    );
    assert.deepEqual(plan.checks.at(-1).tests, ["frontend/e2e/first.spec.ts"]);
    put("frontend/src/widget.css", "body { color: red; }");
    assert.equal(
      planImpact(["frontend/src/widget.css"], { root }).checks.at(-1).scope,
      "e2e",
    );
  }));

test("dynamic imports, missing dependencies and untested components refuse reduction", () =>
  dependencyFixture(({ root, put }) => {
    for (const source of [
      "export const Widget = () => import(moduleName);",
      "import {missing} from './missing'; export const Widget = missing;",
    ]) {
      put("frontend/src/Widget.tsx", source);
      assert.equal(
        planImpact(["frontend/src/Widget.tsx"], { root }).exhaustive,
        true,
      );
    }
    put("frontend/src/Untested.tsx", "export const Untested = () => <b/>;");
    assert.equal(
      planImpact(["frontend/src/Untested.tsx"], { root }).exhaustive,
      true,
    );
  }));

test("unresolved browser navigation remains selected, never silently omitted", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "frontend/e2e/unknown.spec.ts",
      "test('x',async({page})=>page.goto(destination));",
    );
    assert.ok(
      planImpact(["frontend/src/Widget.tsx"], { root })
        .checks.at(-1)
        .tests.includes("frontend/e2e/unknown.spec.ts"),
    );
  }));

test("an import-only Vitest file cannot justify a component reduction", () =>
  dependencyFixture(({ root, put }) => {
    put("frontend/src/Uncovered.tsx", "export const Uncovered=()=>null;");
    put(
      "frontend/src/Uncovered.test.tsx",
      "import {Uncovered} from './Uncovered';",
    );
    assert.equal(
      planImpact(["frontend/src/Uncovered.tsx"], { root }).exhaustive,
      true,
    );
  }));

test("an unknown link cannot be hidden by another known route in the same journey", () =>
  dependencyFixture(({ root, put }) => {
    put(
      "frontend/e2e/mixed-unknown.spec.ts",
      "test('x',async({page})=>{await page.goto('/first');await page.getByRole('link',{name:'Destination non cartographiee'}).click();});",
    );
    const plan = planImpact(["frontend/src/SecondPage.tsx"], { root });
    assert.ok(
      plan.checks.at(-1).tests.includes("frontend/e2e/mixed-unknown.spec.ts"),
    );
  }));
