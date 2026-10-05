from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("journals", "0004_generalize_error_entries_as_logs")]

    operations = [
        migrations.AlterField(
            model_name="activityentry",
            name="action",
            field=models.CharField(
                choices=[
                    ("organization_created", "Organisation créée"),
                    ("organization_renamed", "Organisation renommée"),
                    ("organization_deleted", "Organisation supprimée"),
                    ("member_assigned", "Membre affecté"),
                    ("member_removed", "Membre retiré"),
                    ("user_invited", "Utilisateur invité"),
                    ("user_updated", "Utilisateur modifié"),
                    ("user_role_changed", "Fonction modifiée"),
                    ("user_deactivated", "Utilisateur désactivé"),
                    ("user_reactivated", "Utilisateur réactivé"),
                    ("user_deleted", "Utilisateur supprimé"),
                    ("team_created", "Équipe créée"),
                    ("team_renamed", "Équipe renommée"),
                    ("team_archived", "Équipe archivée"),
                    ("coach_assigned", "Coach affecté"),
                    ("coach_removed", "Coach retiré"),
                    ("evaluation_created", "Évaluation créée"),
                    ("evaluation_renamed", "Évaluation renommée"),
                    ("evaluation_deleted", "Évaluation supprimée"),
                    ("evaluation_validated", "Évaluation validée"),
                    ("evaluation_archived", "Évaluation archivée"),
                    ("question_created", "Question créée"),
                    ("question_updated", "Question modifiée"),
                    ("question_deleted", "Question supprimée"),
                    ("evaluation_scheduled", "Évaluation planifiée"),
                    ("evaluation_schedule_updated", "Planification modifiée"),
                    ("evaluation_schedule_deleted", "Planification supprimée"),
                ],
                max_length=40,
            ),
        )
    ]
