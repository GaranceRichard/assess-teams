import time

from django.core.management.base import BaseCommand

from identities.application.password_delivery import deliver_pending_password_emails


class Command(BaseCommand):
    help = "Remet les emails de récupération sans afficher d'adresse, token ni URL."

    def add_arguments(self, parser):
        parser.add_argument(
            "--watch", action="store_true", help="Traiter la file toutes les 5 secondes."
        )

    def handle(self, *args, **options):
        while True:
            counts = deliver_pending_password_emails()
            if not options["watch"]:
                self.stdout.write(f"Récupération : {counts}")
                return
            time.sleep(5)
