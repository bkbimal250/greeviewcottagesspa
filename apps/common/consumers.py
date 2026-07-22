import json
from typing import Any

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone


class RealtimeConsumer(AsyncJsonWebsocketConsumer):
    group_name = "greenview.realtime"

    async def connect(self) -> None:
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_status("connected")

    async def disconnect(self, close_code: int) -> None:
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content: dict[str, Any], **kwargs: Any) -> None:
        event_type = content.get("type")
        if event_type == "ping":
            await self.send_status("pong")
            return

        await self.send_json(
            {
                "type": "error",
                "message": "Unsupported realtime message.",
                "time": timezone.now().isoformat(),
            }
        )

    async def broadcast_message(self, event: dict[str, Any]) -> None:
        payload = event.get("payload", {})
        if isinstance(payload, str):
            payload = json.loads(payload)
        await self.send_json(payload)

    async def send_status(self, status: str) -> None:
        await self.send_json(
            {
                "type": "status",
                "status": status,
                "time": timezone.now().isoformat(),
            }
        )
