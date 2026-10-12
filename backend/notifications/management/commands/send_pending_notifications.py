import time

from django.core.management.base import BaseCommand

from notifications.delivery import deliver_pending_emails


class Command(BaseCommand):
    help = "Remet les courriels persistés ; aucune opération métier n’est rejouée."

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true")

    def handle(self, *args, **options):
        while True:
            counts = deliver_pending_emails()
            if counts or not options["watch"]:
                self.stdout.write(f"Notifications : {counts}")
            if not options["watch"]:
                return
            time.sleep(5)
