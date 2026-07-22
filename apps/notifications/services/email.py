from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from apps.bookings.models import Booking
from apps.notifications.models import NotificationLog


class EmailNotificationService:
    @staticmethod
    def send(
        *,
        recipient: str,
        subject: str,
        message: str,
        booking: Booking | None = None,
        template_name: str = "",
    ) -> NotificationLog:
        log = NotificationLog.objects.create(
            booking=booking,
            channel=NotificationLog.Channel.EMAIL,
            recipient=recipient,
            template_name=template_name,
            subject=subject,
            message=message,
            status=NotificationLog.Status.QUEUED,
        )
        try:
            sent_count = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=False,
            )
        except Exception as exc:
            log.status = NotificationLog.Status.FAILED
            log.error_message = str(exc)
        else:
            log.status = (
                NotificationLog.Status.SENT if sent_count else NotificationLog.Status.FAILED
            )
            log.sent_at = timezone.now() if sent_count else None
            if not sent_count:
                log.error_message = "Email backend did not accept the message."
        log.save(update_fields=["status", "error_message", "sent_at", "updated_at"])
        return log
