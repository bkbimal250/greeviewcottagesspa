import logging
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

logger = logging.getLogger(__name__)


def broadcast_realtime_event(event_type: str, payload: dict[str, Any] | None = None) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    message = {
        "type": event_type,
        "payload": payload or {},
        "time": timezone.now().isoformat(),
    }

    try:
        async_to_sync(channel_layer.group_send)(
            "greenview.realtime",
            {
                "type": "broadcast.message",
                "payload": message,
            },
        )
    except Exception as exc:
        logger.warning("Realtime broadcast failed for %s: %s", event_type, exc)
