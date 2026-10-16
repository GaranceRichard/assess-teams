import time

from django.core.management.base import BaseCommand
from django.db import OperationalError, close_old_connections

from config.sqlite_contention import worker_contention
from notifications.delivery import deliver_pending_emails


class Command(BaseCommand):
    help = "Remet les courriels persistés ; aucune opération métier n’est rejouée."

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true")

    def handle(self, *args, **options):
        while True:
            close_old_connections()
            try:
                counts = deliver_pending_emails()
            except OperationalError as error:
                raise worker_contention(error, "notification_delivery") from None
            finally:
                close_old_connections()
            if counts or not options["watch"]:
                self.stdout.write(f"Notifications : {counts}")
            if not options["watch"]:
                return
            time.sleep(5)
