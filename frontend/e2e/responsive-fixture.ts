import { runDjangoShell } from "./identity-fixture";
import { seedShellContext } from "./shell-fixture";

export function seedResponsiveContext() {
  seedShellContext();
  runDjangoShell([
    "from identities.models import Organization, User",
    "from teams.models import Team",
    "from assessments.models import Evaluation",
    "from journals.models import ActivityEntry, LogEntry",
    "org = Organization.objects.get(name='Shell viewport E2E')",
    "suffix = ' — Collaboration et amélioration continue des pratiques collectives' * 2",
    "[Team.objects.filter(pk=team.pk).update(name=team.name + suffix) for team in Team.objects.filter(organization=org)]",
    "[Evaluation.objects.filter(pk=model.pk).update(name=model.name + suffix) for model in Evaluation.objects.filter(organization=org)]",
    "User.objects.filter(username__startswith='shell-member-').update(email='adresse-de-contact-pour-la-qualification-responsive@example.com')",
    "ActivityEntry.objects.filter(organization=org).update(description='Description détaillée de la création et du contexte organisationnel. ' * 3)",
    "[LogEntry.objects.create(organization=org, level='ERROR', source='assessments', operation='Lecture de collection', category='ValidationError', message='Texte long sans perte de contenu. ' * 12) for _ in range(25)]",
  ]);
}
