from django.core.management.base import BaseCommand
from django.db import OperationalError

from assessments.application.schedule_notifications import deliver_due_schedules
from config.sqlite_contention import worker_contention


class Command(BaseCommand):
    help = "Envoie les notifications des évaluations arrivées à échéance."

    def handle(self, *args, **options):
        try:
            delivered = deliver_due_schedules()
        except OperationalError as error:
            raise worker_contention(error, "due_schedules") from None
        self.stdout.write(self.style.SUCCESS(f"{delivered} planification(s) notifiée(s)."))
