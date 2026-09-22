import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const e2eCredential = "Playwright-test-credential";

export function seedIdentity(
  username: string,
  role: "Admin" | "Coach" | "Viewer",
) {
  const backend = resolve(import.meta.dirname, "../../backend");
  const windowsPython = resolve(backend, ".venv/Scripts/python.exe");
  const python = existsSync(windowsPython)
    ? windowsPython
    : resolve(backend, ".venv/bin/python");
  const command = [
    "from identities.models import User",
    `user, _ = User.objects.get_or_create(username=${JSON.stringify(username)}, defaults={'role': '${role}'})`,
    `user.role = '${role}'`,
    "user.is_active = True",
    `user.set_password(${JSON.stringify(e2eCredential)})`,
    "user.save()",
  ].join("; ");
  execFileSync(
    python,
    [
      "manage.py",
      "shell",
      "--settings=config.settings_development",
      "-c",
      command,
    ],
    { cwd: backend },
  );
}
