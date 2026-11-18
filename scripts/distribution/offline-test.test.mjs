import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const python = join(
  root,
  "backend/.venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
const script = readFileSync(
  join(import.meta.dirname, "offline-test.mjs"),
  "utf8",
);
// Exercise the actual embedded program, including its provisioning and cleanup.
const program = script.match(/`(\r?\nimport base64[\s\S]*?)`,/)[1];
const marker = "private-value-must-never-appear";

function execute(code, environment = {}) {
  return spawnSync(python, ["-c", code], {
    cwd: join(root, "backend"),
    env: { ...process.env, ...environment, PYTHONDONTWRITEBYTECODE: "1" },
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 8 * 1024 * 1024,
  });
}

function observed(mutation = "", after = "", startup = "    django.setup()") {
  const directory = mkdtempSync(join(tmpdir(), "assess-offline-observer-"));
  try {
    const audit = join(directory, "audit.json");
    const hook = `
    from pathlib import Path
    from tests.installation_helpers import change_document, private_file
    database = source.parent / 'data/assess.sqlite3'
    private = private_file(source, 'django.key')
    Path(os.environ['C1_AUDIT_FILE']).write_text(json.dumps({
        'root': str(source.parent), 'private': str(private.parent), 'database': str(database)
    }), encoding='utf-8')
${mutation}
${startup}`;
    let code = program.replace("    django.setup()", hook);
    code = code.replace(
      "    print(json.dumps(result))",
      after + "\n    print(json.dumps(result))",
    );
    const result = execute(code, { C1_AUDIT_FILE: audit });
    assert.equal(result.error, undefined);
    const paths = JSON.parse(readFileSync(audit, "utf8"));
    assert(!existsSync(paths.root), "configuration directory must be removed");
    assert(!existsSync(paths.private), "private directory must be removed");
    assert(!existsSync(paths.database), "temporary database must be removed");
    return result;
  } finally {
    assert(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    rmSync(directory, { recursive: true, force: true });
  }
}

test("production schema loads with inherited legacy variables isolated", () => {
  const result = execute(program, {
    DJANGO_SECRET_KEY: marker,
    APP_BASE_URL: "http://invalid.example",
    DEFAULT_FROM_EMAIL: marker,
    EMAIL_HOST_PASSWORD: marker,
    ASSESS_CONFIG_FILE: join(root, "must-never-use.json"),
  });
  assert.equal(result.status, 0, result.stderr);
  const pages = JSON.parse(result.stdout);
  assert.equal(pages["/api/docs/"].status, 200);
  assert.equal(pages["/api/schema/?format=json"].status, 200);
  const schema = JSON.parse(
    Buffer.from(pages["/api/schema/?format=json"].body, "base64"),
  );
  assert(schema.openapi.startsWith("3."));
  assert(schema.paths["/api/session/login/"]);
  assert(!result.stdout.includes(marker));
});

test("migrates only the configured temporary database and cleans successful resources", () => {
  const result = observed(
    "",
    `
    from django.conf import settings
    from django.db import connection
    assert Path(settings.INSTALLATION_CONFIG_FILE) == source.resolve()
    assert Path(settings.DATABASES['default']['NAME']) == database
    assert database.is_file()
    assert 'identities_user' in connection.introspection.table_names()
    assert private.read_text('utf-8') not in json.dumps(result)
`,
  );
  assert.equal(result.status, 0, result.stderr);
});

const refusals = {
  absent: "    os.environ.pop('ASSESS_CONFIG_FILE')",
  unreadable:
    "    os.environ['ASSESS_CONFIG_FILE'] = str(source.with_name('missing.json'))",
  invalid:
    "    change_document(source, 'smtp.sender', 'private-value-must-never-appear')",
  privateSecret:
    "    private.write_text('private-value-must-never-appear', encoding='utf-8')",
  competing: "    os.environ['APP_BASE_URL'] = 'https://assess.example'",
  modifiedDatabase:
    "    from django.conf import settings\n    settings.DATABASES['default']['NAME'] = ':memory:'",
};
for (const [name, mutation] of Object.entries(refusals)) {
  test(`refuses ${name} configuration before application effects and cleans resources`, () => {
    const result = observed(
      mutation,
      "",
      `
    import sys
    active = [True]
    def audit(event, arguments):
        if active and event in {'sqlite3.connect', 'socket.connect', 'os.mkdir', 'os.remove', 'os.rename'}:
            raise AssertionError('UNEXPECTED_EFFECT')
    sys.addaudithook(audit)
    try:
        django.setup()
    except Exception:
        assert not database.exists()
        raise
    finally:
        active.clear()
`,
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /ImproperlyConfigured/);
    assert(!result.stderr.includes("UNEXPECTED_EFFECT"), result.stderr);
    assert(!(result.stderr + result.stdout).includes(marker));
  });
}

test("cleans a migrated database when rendering fails", () => {
  const result = observed("", "    raise RuntimeError('rendering-failed')");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /rendering-failed/);
});

test("browser launch failure closes the local server and exits", () => {
  const directory = mkdtempSync(join(tmpdir(), "assess-offline-no-browser-"));
  try {
    const artifact = resolve(
      process.env.ASSESS_FRONTEND_ARTIFACT || "build/mep-058/artifact",
    );
    const result = spawnSync(
      process.execPath,
      [join(import.meta.dirname, "offline-test.mjs"), artifact],
      {
        cwd: root,
        env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: directory },
        encoding: "utf8",
        timeout: 30000,
      },
    );
    assert.equal(
      result.error,
      undefined,
      "server must not keep the failed process alive",
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Executable doesn't exist/);
  } finally {
    assert(resolve(directory).startsWith(resolve(tmpdir()) + sep));
    rmSync(directory, { recursive: true, force: true });
  }
});
