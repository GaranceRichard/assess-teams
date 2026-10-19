import json
import signal
import uuid

from django.core.management.base import BaseCommand, CommandError
from django.db import close_old_connections

from journals.purge import advance_run, start_run
from journals.purge_models import JournalPurgeRun
from journals.purge_policy import PurgeRefused, bounded_integer, check_integrity


class Command(BaseCommand):
    help = "Simule ou exécute une purge technique bornée ; aucune preuve métier supprimée."

    def add_arguments(self, parser):
        parser.add_argument("--scope", default="technical")
        parser.add_argument("--execute", action="store_true")
        parser.add_argument("--authorization", default="")
        parser.add_argument("--max-rows")
        parser.add_argument("--batch-size")
        parser.add_argument("--max-batches", default="10")
        parser.add_argument("--resume")

    def report(self, run):
        self.stdout.write(
            json.dumps(
                {
                    "run_id": str(run.pk),
                    "scope": "technical",
                    "simulation": run.simulation,
                    "status": run.status,
                    "outcome": run.outcome,
                    "cutoff": run.cutoff.isoformat(),
                    "matched": run.matched_count,
                    "deleted": run.deleted_count,
                    "batches": run.batches,
                },
                sort_keys=True,
            )
        )
        self.stdout.flush()

    def prepare(self, options):
        if options["scope"] != "technical":
            raise PurgeRefused("scope_forbidden")
        if options["resume"]:
            if (
                any(options[key] is not None for key in ("max_rows", "batch_size"))
                or options["authorization"]
            ):
                raise PurgeRefused("resume_options_forbidden")
            try:
                run_id = uuid.UUID(str(options["resume"]))
            except (ValueError, AttributeError):
                raise PurgeRefused("invalid_run_id") from None
            run = JournalPurgeRun.objects.filter(pk=run_id).first()
            if run is None:
                raise PurgeRefused("unknown_run")
            if run.simulation == options["execute"]:
                raise PurgeRefused("mode_changed")
            check_integrity()
            return run
        return start_run(
            simulation=not options["execute"],
            authorization=options["authorization"],
            max_rows=options["max_rows"] if options["max_rows"] is not None else 1000,
            batch_size=options["batch_size"] if options["batch_size"] is not None else 100,
        )

    def handle(self, *args, **options):
        previous = signal.getsignal(signal.SIGTERM)

        def interrupt(signum, frame):
            raise KeyboardInterrupt

        signal.signal(signal.SIGTERM, interrupt)
        run = None
        try:
            budget = bounded_integer(options["max_batches"], 1000)
            run = self.prepare(options)
            # Identify the receipt before deletion, without claiming its old state as
            # this invocation's result before checkpoint/policy validation.
            self.stdout.write(
                json.dumps(
                    {"run_id": str(run.pk), "simulation": run.simulation, "event": "started"}
                )
            )
            self.stdout.flush()
            for _ in range(budget):
                run = advance_run(run.pk)
                self.report(run)
                if run.status == "completed":
                    return
            raise PurgeRefused("batch_budget_reached")
        except (Exception, KeyboardInterrupt) as error:
            # Never expose database errors, journal contents, authorization or raw inputs.
            code = str(error) if isinstance(error, PurgeRefused) else "execution_stopped"
            if run is not None:
                close_old_connections()
                self.stderr.write(f"Purge arrêtée ; reprendre run_id={run.pk}.")
            raise CommandError(f"Purge refusée ou suspendue : {code}.") from None
        finally:
            signal.signal(signal.SIGTERM, previous)
            close_old_connections()
