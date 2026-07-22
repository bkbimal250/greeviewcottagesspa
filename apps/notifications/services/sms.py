from __future__ import annotations

import json
from urllib import request

from django.conf import settings
from django.utils import timezone

from apps.bookings.models import Booking
from apps.notifications.models import NotificationLog


class SMSNotificationService:
    @staticmethod
    def send(
        *,
        recipient: str,
        message: str,
        booking: Booking | None = None,
        template_name: str = "",
    ) -> NotificationLog:
        log = NotificationLog.objects.create(
            booking=booking,
            channel=NotificationLog.Channel.SMS,
            recipient=recipient,
            template_name=template_name,
            message=message,
            status=NotificationLog.Status.QUEUED,
        )
        provider_url = getattr(settings, "SMS_PROVIDER_URL", "")
        api_key = getattr(settings, "SMS_API_KEY", "")
        sender_id = getattr(settings, "SMS_SENDER_ID", "")
        if not provider_url or not api_key:
            log.status = NotificationLog.Status.FAILED
            log.error_message = "SMS provider credentials are not configured."
            log.save(update_fields=["status", "error_message", "updated_at"])
            return log

        payload = json.dumps({"to": recipient, "message": message, "sender_id": sender_id}).encode(
            "utf-8"
        )
        http_request = request.Request(
            provider_url,
            data=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(http_request, timeout=10) as response:
                body = json.loads(response.read().decode("utf-8") or "{}")
        except Exception as exc:
            log.status = NotificationLog.Status.FAILED
            log.error_message = str(exc)
        else:
            log.status = NotificationLog.Status.SENT
            log.sent_at = timezone.now()
            log.provider_message_id = str(body.get("message_id", ""))
        log.save(
            update_fields=[
                "status",
                "error_message",
                "sent_at",
                "provider_message_id",
                "updated_at",
            ]
        )
        return log
