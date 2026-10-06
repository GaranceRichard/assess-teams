from django.db import transaction
from django.db.models import F, Max
from django.shortcuts import get_object_or_404

from assessments.models import Evaluation, EvaluationFamily, Question
from identities.models import Organization, User
from journals.activity_records import evaluation_activity
from journals.models import ActivityAction


@transaction.atomic
def create_next_version(source_id: int, actor: User) -> Evaluation:
    # Acquire a write lock before any reads, including on SQLite. Use the same
    # organization lock as lifecycle and draft mutations to copy a coherent source.
    sources = Evaluation.objects.filter(pk=source_id)
    if not actor.is_superuser:
        sources = sources.filter(organization__users=actor)
    Organization.objects.filter(pk__in=sources.values("organization_id")).update(name=F("name"))
    EvaluationFamily.objects.filter(pk__in=sources.values("family_id")).update(
        next_version=F("next_version") + 1
    )
    source = get_object_or_404(sources.select_for_update().select_related("family"))
    family = source.family
    highest_index = (
        Evaluation.objects.filter(organization_id=source.organization_id).aggregate(Max("index"))[
            "index__max"
        ]
        or 0
    )
    created = Evaluation.objects.create(
        organization_id=source.organization_id,
        family=family,
        version=family.next_version - 1,
        name=source.name,
        index=highest_index + 1,
    )
    Question.objects.bulk_create(
        [
            Question(
                evaluation=created,
                index=question.index,
                name=question.name,
                lineage_id=question.lineage_id,
            )
            for question in source.questions.all()
        ]
    )
    evaluation_activity(
        actor,
        created,
        ActivityAction.EVALUATION_VERSION_CREATED,
        f"Création d’une nouvelle version depuis v{source.version}",
    )
    return created
