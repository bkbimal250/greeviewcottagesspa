from __future__ import annotations

import json
from urllib import request

from django.conf import settings
from django.utils import timezone

from apps.bookings.models import Booking
from apps.common.utils import normalize_phone_number
from apps.notifications.models import NotificationLog


class WhatsAppNotificationService:
    @staticmethod
    def send_text(
        *,
        recipient: str,
        message: str,
        booking: Booking | None = None,
        template_name: str = "",
    ) -> NotificationLog:
        log = NotificationLog.objects.create(
            booking=booking,
            channel=NotificationLog.Channel.WHATSAPP,
            recipient=recipient,
            template_name=template_name,
            message=message,
            status=NotificationLog.Status.QUEUED,
        )
        token = settings.WHATSAPP_ACCESS_TOKEN
        phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        if not token or not phone_number_id:
            log.status = NotificationLog.Status.FAILED
            log.error_message = "WhatsApp credentials are not configured."
            log.save(update_fields=["status", "error_message", "updated_at"])
            return log

        payload = json.dumps(
            {
                "messaging_product": "whatsapp",
                "to": recipient.replace("+", ""),
                "type": "text",
                "text": {"preview_url": False, "body": message},
            }
        ).encode("utf-8")
        url = (
            f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{phone_number_id}/messages"
        )
        http_request = request.Request(
            url,
            data=payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(http_request, timeout=10) as response:
                body = json.loads(response.read().decode("utf-8") or "{}")
        except Exception as exc:
            log.status = NotificationLog.Status.FAILED
            log.error_message = str(exc)
        else:
            messages = body.get("messages") or [{}]
            log.status = NotificationLog.Status.SENT
            log.sent_at = timezone.now()
            log.provider_message_id = str(messages[0].get("id", ""))
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


class WhatsAppWebhookService:
    @staticmethod
    def process_payload(payload: dict) -> None:
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                WhatsAppWebhookService._process_statuses(value.get("statuses", []))
                WhatsAppWebhookService._process_messages(value.get("messages", []))

    @staticmethod
    def _process_statuses(statuses: list[dict]) -> None:
        status_map = {
            "sent": NotificationLog.Status.SENT,
            "delivered": NotificationLog.Status.DELIVERED,
            "read": NotificationLog.Status.READ,
            "failed": NotificationLog.Status.FAILED,
        }
        for item in statuses:
            message_id = item.get("id", "")
            status_value = status_map.get(item.get("status"))
            if not message_id or not status_value:
                continue
            log = NotificationLog.objects.filter(provider_message_id=message_id).first()
            if log is None:
                continue
            log.status = status_value
            now = timezone.now()
            if status_value == NotificationLog.Status.DELIVERED:
                log.delivered_at = now
            elif status_value == NotificationLog.Status.READ:
                log.read_at = now
            elif status_value == NotificationLog.Status.FAILED:
                log.error_message = json.dumps(item.get("errors", []))
            log.save(
                update_fields=["status", "delivered_at", "read_at", "error_message", "updated_at"]
            )

    @staticmethod
    def _process_messages(messages: list[dict]) -> None:
        for item in messages:
            event_id = item.get("id", "")
            if not event_id or NotificationLog.objects.filter(provider_event_id=event_id).exists():
                continue
            sender = normalize_phone_number(item.get("from", ""))
            text = (item.get("text") or {}).get("body", "")
            NotificationLog.objects.create(
                channel=NotificationLog.Channel.WHATSAPP,
                recipient=sender,
                template_name="whatsapp_incoming",
                message=text,
                provider_event_id=event_id,
                status=NotificationLog.Status.DELIVERED,
                delivered_at=timezone.now(),
            )
