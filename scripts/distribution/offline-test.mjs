import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { verify } from "./verify.mjs";

const root = resolve(import.meta.dirname, "../..");
const artifact = resolve(process.argv[2]);
const manifest = verify(artifact);
const requireFrontend = createRequire(join(root, "frontend/package.json"));
const { chromium } = requireFrontend("@playwright/test");
const python = join(
  root,
  "backend/.venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
// Render the real Spectacular view and schema with the artifact's integration contract.
const pages = JSON.parse(
  execFileSync(
    python,
    [
      "-c",
      `
import base64, json, os
from contextlib import ExitStack
from config.installation import LEGACY_NAMES
from tests.installation_helpers import installation_file, cleanup
for name in LEGACY_NAMES:
    os.environ.pop(name, None)
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings_production'
with ExitStack() as resources:
    resources.callback(cleanup)
    source = installation_file()
    (source.parent / 'data').mkdir()
    os.environ['ASSESS_CONFIG_FILE'] = str(source.resolve())
    import django
    django.setup()
    from django.db import connections
    resources.callback(connections.close_all)
    from django.core.management import call_command
    from django.test import Client
    call_command('migrate', interactive=False, verbosity=0)
    client = Client()
    result = {}
    for path in ['/api/docs/', '/api/schema/?format=json', '/api/session/']:
        response = client.get(path, secure=True, HTTP_HOST='assess.example')
        result[path] = {'status': response.status_code, 'type': response.get('Content-Type'),
            'body': base64.b64encode(response.content).decode()}
    print(json.dumps(result))
`,
    ],
    { cwd: join(root, "backend"), encoding: "utf8" },
  ),
);
pages["/api/schema/"] = pages["/api/schema/?format=json"];
assert.equal(pages["/api/docs/"].status, 200);
assert.equal(pages["/api/schema/?format=json"].status, 200);
const html = Buffer.from(pages["/api/docs/"].body, "base64").toString();
assert(!html.includes("cdn.jsdelivr.net"));
assert(html.includes('"validatorUrl": null'));
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".txt": "text/plain",
  ".png": "image/png",
  ".json": "application/json",
};
const requests = [];
const server = createServer((request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  requests.push(path);
  const page = pages[request.url] || pages[path];
  if (page) {
    response.writeHead(page.status, { "Content-Type": page.type });
    response.end(Buffer.from(page.body, "base64"));
    return;
  }
  const base = path.startsWith("/static/")
    ? artifact
    : join(artifact, "frontend");
  let file = resolve(base, `.${path}`);
  if (!file.startsWith(base) || path.includes("..")) {
    response.writeHead(400);
    response.end();
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) {
    if (
      path.startsWith("/api/") ||
      path.startsWith("/admin/") ||
      /\.[a-z0-9]+$/i.test(path)
    ) {
      response.writeHead(404);
      response.end();
      return;
    }
    file = join(artifact, "frontend/index.html");
  }
  const extension = file.slice(file.lastIndexOf("."));
  response.writeHead(200, {
    "Content-Type": `${types[extension] || "application/octet-stream"}; charset=utf-8`,
  });
  response.end(readFileSync(file));
});
let browser;
try {
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  const external = [],
    errors = [],
    failures = [];
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === origin)
      return route.continue();
    external.push(route.request().url());
    return route.abort("blockedbyclient");
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failures.push(request.url()));
  for (const route of manifest.routes.filter((path) => !path.includes(":"))) {
    await page.goto(origin + route);
    const expected =
      route === "/password/forgot"
        ? "Mot de passe oublié"
        : route === "/password/reset"
          ? "Ce lien est invalide"
          : "Se connecter";
    await page.getByText(expected, { exact: false }).first().waitFor();
  }
  await page.goto(`${origin}/invitation/invalid/invalid`);
  await page
    .getByRole("heading", { name: "Choisir mon mot de passe" })
    .waitFor();
  await page.goto(`${origin}/legal/index.html`);
  await page.getByText("Apache", { exact: false }).first().waitFor();
  await page.goto(`${origin}/api/docs/`);
  await page.locator(".swagger-ui .info .title").waitFor();
  await page.locator(".opblock").first().waitFor();
  await page.goto(
    `${origin}/api/docs/?url=https://blocked.invalid/spec&configUrl=https://blocked.invalid/config`,
  );
  await page.locator(".opblock").first().waitFor();
  assert.equal(await page.evaluate(() => ui.getConfigs().url), "/api/schema/");
  assert.equal(
    await page.evaluate(() => ui.getConfigs().queryConfigEnabled),
    false,
  );
  assert.equal(await page.evaluate(() => ui.getConfigs().layout), "BaseLayout");
  assert(requests.includes("/api/schema/"));
  assert(requests.includes("/static/swagger-ui/swagger-ui-bundle.js"));
  assert.equal((await fetch(`${origin}/assets/missing.js`)).status, 404);
  assert.equal((await fetch(`${origin}/api/missing/`)).status, 404);
  assert.deepEqual(external, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  const proof = {
    payloadSha256: manifest.payloadSha256,
    routes: manifest.routes,
    requests: [...new Set(requests)].sort(),
    external,
    errors,
    failures,
    browser: browser.version(),
    schema: "real Django/Spectacular local schema",
    scope:
      "static qualification, anonymous routes; not target deployment or authenticated E2E",
  };
  writeFileSync(
    join(artifact, "../offline-proof.json"),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(
    `PASS offline browser: ${proof.requests.length} URLs; no external request or browser error`,
  );
} finally {
  try {
    await browser?.close();
  } finally {
    await new Promise((done) => server.close(done));
  }
}
