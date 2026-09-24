import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const e2eCredential = "Playwright-test-credential";

function runDjangoShell(command: string[]) {
  const backend = resolve(import.meta.dirname, "../../backend");
  const windowsPython = resolve(backend, ".venv/Scripts/python.exe");
  const python = existsSync(windowsPython)
    ? windowsPython
    : resolve(backend, ".venv/bin/python");
  execFileSync(
    python,
    [
      "manage.py",
      "shell",
      "--settings=config.settings_development",
      "-c",
      command.join("; "),
    ],
    { cwd: backend },
  );
}

export function seedIdentity(
  username: string,
  role: "Admin" | "Coach" | "Viewer",
) {
  const command = [
    "from identities.models import User",
    `user, _ = User.objects.get_or_create(username=${JSON.stringify(username)}, defaults={'role': '${role}'})`,
    `user.role = '${role}'`,
    "user.is_active = True",
    `user.set_password(${JSON.stringify(e2eCredential)})`,
    "user.save()",
  ];
  runDjangoShell(command);
}

export function seedSuperadmin(username: string, managedEmail: string) {
  const command = [
    "from identities.models import User",
    `user, _ = User.objects.get_or_create(username=${JSON.stringify(username)}, defaults={'is_superuser': True, 'is_staff': True, 'email': ${JSON.stringify(username)}})`,
    "user.email = user.username",
    "user.is_active = True",
    "user.is_staff = True",
    "user.is_superuser = True",
    `user.set_password(${JSON.stringify(e2eCredential)})`,
    "user.save()",
    `User.objects.filter(email=${JSON.stringify(managedEmail)}).delete()`,
  ];
  runDjangoShell(command);
}

export function resetOrganization(name: string) {
  runDjangoShell([
    "from identities.models import Organization",
    `Organization.objects.filter(name=${JSON.stringify(name)}).delete()`,
  ]);
}
