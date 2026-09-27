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
    "user.organizations.clear()",
  ];
  runDjangoShell(command);
}

export function assignOrganization(
  usernames: string[],
  organizationName: string,
) {
  runDjangoShell([
    "from identities.models import Organization, User",
    `Organization.objects.filter(name=${JSON.stringify(organizationName)}).delete()`,
    `organization = Organization.objects.create(name=${JSON.stringify(organizationName)})`,
    `users = User.objects.filter(username__in=${JSON.stringify(usernames)})`,
    "organization.users.set(users)",
  ]);
}

export function seedCoachTeams(
  coachUsername: string,
  organizationName: string,
  teamNames: string[],
) {
  runDjangoShell([
    "from identities.models import Organization, User",
    "from teams.models import Team",
    `organization = Organization.objects.get(name=${JSON.stringify(organizationName)})`,
    `coach = User.objects.get(username=${JSON.stringify(coachUsername)})`,
    `names = ${JSON.stringify(teamNames)}`,
    "teams = [Team.objects.create(organization=organization, name=name) for name in names]",
    "[team.coaches.add(coach) for team in teams]",
  ]);
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

export function resetEvaluations(names: string[]) {
  runDjangoShell([
    "from assessments.models import Evaluation",
    `Evaluation.objects.filter(name__in=${JSON.stringify(names)}).delete()`,
  ]);
}
