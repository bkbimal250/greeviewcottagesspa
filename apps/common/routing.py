from django.urls import path

from apps.common.consumers import RealtimeConsumer

websocket_urlpatterns = [
    path("ws/realtime/", RealtimeConsumer.as_asgi()),
]
