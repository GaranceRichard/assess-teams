#!/usr/bin/env python
import os
import sys


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    import django
    from django.conf import settings
    from django.core.management import execute_from_command_line
    from django.core.management.base import CommandParser, handle_default_options

    parser = CommandParser(add_help=False, allow_abbrev=False)
    parser.add_argument("--settings")
    parser.add_argument("--pythonpath")
    parser.add_argument("args", nargs="*")
    options, _ = parser.parse_known_args(sys.argv[2:])
    handle_default_options(options)
    # Core commands can run after Django's dispatcher swallows a settings error.
    # Validate production before dispatching even shell/check/help commands.
    if getattr(settings, "ENVIRONMENT", None) not in {"development", "test"}:
        django.setup()
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
