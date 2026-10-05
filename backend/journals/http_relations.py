def live_http_relation(instance, status_code, organization=None):
    if instance is None or instance.pk is None:
        return None
    if status_code < 400:
        return instance
    # An atomic view may have rolled back a newly created object. Only test
    # existence of the already authorized context, within its known tenant.
    entries = type(instance).objects.filter(pk=instance.pk)
    if organization is not None:
        entries = entries.filter(organization_id=organization.pk)
    return instance if entries.exists() else None
