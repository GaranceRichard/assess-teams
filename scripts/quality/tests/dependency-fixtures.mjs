import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fixture } from "./validation-fixtures.mjs";

export function dependencyFixture(action) {
  return fixture((root) => {
    const put = (path, source) => {
      const full = join(root, path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, source);
    };
    for (const path of [
      "frontend/src",
      "frontend/e2e",
      "frontend/demo-e2e",
      "backend/tests",
    ])
      mkdirSync(join(root, path), { recursive: true });
    put(
      "frontend/src/navigation.ts",
      `
      const routes = [
        { path: "/first", title: "Premier" },
        { path: "/second", title: "Second" },
      ];
    `,
    );
    put(
      "frontend/src/ProductShell.tsx",
      `
      import { FirstPage } from "./FirstPage";
      import { SecondPage } from "./SecondPage";
      const view = path === "/first" ? (<FirstPage />) :
        path === "/second" ? (<SecondPage />) : null;
    `,
    );
    put(
      "frontend/src/demo/DemoApp.tsx",
      `
      import { FirstPage } from "../FirstPage";
      import { SecondPage } from "../SecondPage";
      const view = path === "/first" ? (<FirstPage />) :
        path === "/second" ? (<SecondPage />) : null;
    `,
    );
    put(
      "frontend/src/Widget.tsx",
      "export const Widget = () => <div>Premier</div>;",
    );
    put(
      "frontend/src/firstApi.ts",
      "export const load = () => fetch('/api/first/');",
    );
    put(
      "frontend/src/FirstPage.tsx",
      `
      import { Widget } from "./Widget";
      import { load } from "./firstApi";
      export const FirstPage = () => <Widget />;
    `,
    );
    put(
      "frontend/src/SecondPage.tsx",
      "export const SecondPage = () => <div>Second</div>;",
    );
    put(
      "frontend/src/Widget.test.tsx",
      "import { Widget } from './Widget'; it('works', () => {});",
    );
    put(
      "frontend/src/FirstPage.test.tsx",
      "import { FirstPage } from './FirstPage'; it('works', () => {});",
    );
    put(
      "frontend/src/SecondPage.test.tsx",
      "import { SecondPage } from './SecondPage'; it('works', () => {});",
    );
    put(
      "frontend/e2e/first.spec.ts",
      "test('first', async ({page}) => { await page.goto('/first'); });",
    );
    put(
      "frontend/e2e/second.spec.ts",
      "test('second', async ({page}) => { await page.goto('/second'); });",
    );
    put(
      "frontend/demo-e2e/first.spec.ts",
      "test('first', async ({page}) => { await page.goto('./#/first'); });",
    );
    put(
      "frontend/demo-e2e/second.spec.ts",
      "test('second', async ({page}) => { await page.goto('./#/second'); });",
    );
    put("backend/feature/__init__.py", "");
    put("backend/feature/value.py", "def value():\n    return 1\n");
    put(
      "backend/feature/api.py",
      "from feature.value import value\nclass FeatureView:\n    pass\n",
    );
    put(
      "backend/config/urls.py",
      `
from feature.api import FeatureView
urlpatterns = [path("api/first/", FeatureView.as_view(), name="first")]
`,
    );
    put(
      "backend/tests/test_value.py",
      "from feature.value import value\ndef test_value():\n    assert value() == 1\n",
    );
    put(
      "backend/tests/test_api.py",
      "def test_api(client):\n    client.get(reverse('first'))\n",
    );
    put("backend/tests/test_other.py", "def test_other():\n    assert True\n");
    action({ root, put });
  });
}
