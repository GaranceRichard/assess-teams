from django.conf import settings
from django.core.mail import EmailMessage, get_connection

from notifications.errors import delivery_error
from notifications.models import DeliveryState


def send_email(subject, body, recipient, message_id):
    connection = None
    submission_started = False
    try:
        connection = get_connection()
        connection.open()
        submission_started = True
        accepted = EmailMessage(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            connection=connection,
            headers={"Message-ID": f"<{message_id}@assess-teams.local>"},
        ).send()
        return (DeliveryState.SENT, "") if accepted == 1 else (DeliveryState.RETRY, "not_accepted")
    except Exception as exc:
        state, error = delivery_error(exc)
        if state == DeliveryState.UNKNOWN and not submission_started:
            return DeliveryState.RETRY, "connection_unavailable"
        return state, error
    finally:
        if connection is not None:
            try:
                connection.close()
            except Exception:
                pass  # A failed QUIT cannot undo an acknowledged DATA submission.
