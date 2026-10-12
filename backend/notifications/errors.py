from smtplib import SMTPRecipientsRefused, SMTPResponseException, SMTPServerDisconnected

from notifications.models import DeliveryState


def delivery_error(exc):
    if isinstance(exc, SMTPRecipientsRefused):
        codes = [code for code, _ in exc.recipients.values()]
        temporary = bool(codes) and all(400 <= code < 500 for code in codes)
        return (DeliveryState.RETRY if temporary else DeliveryState.FAILED), "recipient_refused"
    if isinstance(exc, SMTPResponseException):
        temporary = 400 <= exc.smtp_code < 500
        return (DeliveryState.RETRY if temporary else DeliveryState.FAILED), "smtp_refused"
    if isinstance(exc, ConnectionRefusedError):
        return DeliveryState.RETRY, "connection_refused"
    # Timeout/disconnection can occur after SMTP has accepted DATA. Do not resend blindly.
    if isinstance(exc, (TimeoutError, OSError, SMTPServerDisconnected)):
        return DeliveryState.UNKNOWN, "connection_uncertain"
    return DeliveryState.FAILED, "delivery_error"
