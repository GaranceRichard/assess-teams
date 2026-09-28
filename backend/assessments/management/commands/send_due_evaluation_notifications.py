from django.core.management.base import BaseCommand

from assessments.application.schedule_notifications import deliver_due_schedules


class Command(BaseCommand):
    help = "Envoie les notifications des évaluations arrivées à échéance."

    def handle(self, *args, **options):
        delivered = deliver_due_schedules()
        self.stdout.write(self.style.SUCCESS(f"{delivered} planification(s) notifiée(s)."))
