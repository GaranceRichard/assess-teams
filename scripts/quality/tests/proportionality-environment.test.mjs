import assert from "node:assert/strict";
import test from "node:test";
import { runtimeEnvironment } from "../validation-inputs.mjs";
import { runValidation } from "../validate.mjs";
import { fixture, options } from "./validation-fixtures.mjs";

test("agent call/session provenance cannot invalidate otherwise identical successful inputs", () =>
  fixture((root) => {
    let env = {
      CODEX_TOOL_CALL_ID: "first",
      CODEX_SESSION_ID: "session-one",
      CODEX_THREAD_ID: "thread-one",
      PATH: "same tools",
    };
    const calls = [];
    const input = options(root, calls, {
      scopes: ["backend"],
      key: () => JSON.stringify(runtimeEnvironment(env)),
    });
    assert.equal(runValidation(input), 0);
    env = {
      ...env,
      CODEX_TOOL_CALL_ID: "second",
      CODEX_SESSION_ID: "session-two",
    };
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend"]);
    env.PATH = "different tools";
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend", "backend"]);
    env.CODEX_SANDBOX_NETWORK_DISABLED = "1";
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend", "backend", "backend"]);
    delete env.CODEX_THREAD_ID;
    assert.equal(runValidation(input), 0);
    assert.deepEqual(calls, ["backend", "backend", "backend", "backend"]);
  }));
