from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed, pre_save

from identities.models import Organization, User

SUPERADMIN_MEMBERSHIP_MESSAGE = "Un Superadmin ne peut appartenir à aucune organisation."


def reject_superadmin_membership(sender, instance, action, reverse, pk_set, using, **kwargs):
    if action != "pre_add" or not pk_set:
        return
    user_ids = [instance.pk] if reverse else pk_set
    if User.objects.using(using).filter(pk__in=user_ids, is_superuser=True).exists():
        raise ValidationError(SUPERADMIN_MEMBERSHIP_MESSAGE)


def reject_attached_superadmin(sender, instance, using, raw, update_fields, **kwargs):
    if raw or not instance.pk or not instance.is_superuser:
        return
    if update_fields is not None and "is_superuser" not in update_fields:
        return
    if Organization.users.through.objects.using(using).filter(user_id=instance.pk).exists():
        raise ValidationError(SUPERADMIN_MEMBERSHIP_MESSAGE)


def register_membership_invariants():
    m2m_changed.connect(
        reject_superadmin_membership,
        sender=Organization.users.through,
        dispatch_uid="identities.reject_superadmin_membership",
    )
    pre_save.connect(
        reject_attached_superadmin,
        sender=User,
        dispatch_uid="identities.reject_attached_superadmin",
    )
