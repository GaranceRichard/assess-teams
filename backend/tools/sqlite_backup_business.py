"""Read-only invariants beyond SQLite FK/CHECK constraints; never return row data."""

from tools.sqlite_backup_files import require

# Historical snapshots retain names and nullable users after legitimate deletion.
# Checks compare structural ownership, not current membership or mutable labels.
VIOLATIONS = (
    """SELECT 1 FROM assessments_evaluation e
       JOIN assessments_evaluationfamily f ON f.id=e.family_id
       WHERE e.organization_id<>f.organization_id OR e.version>=f.next_version
       OR e.status NOT IN ('DRAFT','VALIDATED','ARCHIVED') LIMIT 1""",
    """SELECT 1 FROM assessments_evaluationschedule s
       JOIN assessments_evaluation e ON e.id=s.evaluation_id
       JOIN teams_team t ON t.id=s.team_id
       WHERE e.organization_id<>t.organization_id LIMIT 1""",
    """SELECT 1 FROM assessments_evaluationrun r
       JOIN assessments_evaluation e ON e.id=r.evaluation_id
       JOIN teams_team t ON t.id=r.team_id
       WHERE r.organization_id<>e.organization_id OR r.organization_id<>t.organization_id
       OR (r.state='not_started' AND EXISTS
           (SELECT 1 FROM assessments_evaluationrunquestion q WHERE q.run_id=r.id))
       OR (r.state='completed' AND (NOT EXISTS
           (SELECT 1 FROM assessments_evaluationrunquestion q WHERE q.run_id=r.id)
           OR EXISTS (SELECT 1 FROM assessments_evaluationrunquestion q
                      WHERE q.run_id=r.id AND q.score IS NULL))) LIMIT 1""",
    """SELECT 1 FROM assessments_evaluationrunquestion q
       JOIN assessments_question s ON s.id=q.source_question_id
       JOIN assessments_evaluationrun r ON r.id=q.run_id
       WHERE s.evaluation_id<>r.evaluation_id OR q.lineage_id<>s.lineage_id LIMIT 1""",
    """SELECT 1 FROM journals_activityentry
       WHERE organization_id IS NOT NULL AND
       (organization_origin_id IS NULL OR organization_id<>organization_origin_id) LIMIT 1""",
    """SELECT 1 FROM journals_logentry
       WHERE organization_id IS NOT NULL AND
       (organization_origin_id IS NULL OR organization_id<>organization_origin_id) LIMIT 1""",
    """SELECT 1 FROM notifications_emailnotification
       WHERE state NOT IN ('pending','sending','retry','sent','failed','unknown','cancelled')
       OR (state='sending' AND (claim IS NULL OR claimed_at IS NULL))
       OR (state='sent' AND sent_at IS NULL) LIMIT 1""",
)


def check_business(connection):
    for query in VIOLATIONS:
        require(connection.execute(query).fetchone() is None, "BUSINESS_INTEGRITY")
