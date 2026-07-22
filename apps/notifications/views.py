from django.conf import settings
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrStaff
from apps.common.responses import success_response
from apps.notifications.models import NotificationLog
from apps.notifications.serializers import NotificationLogSerializer
from apps.notifications.services.whatsapp import WhatsAppWebhookService


@extend_schema(tags=["Admin Notifications"])
class AdminNotificationLogListView(generics.ListAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = NotificationLogSerializer

    def get_queryset(self):
        queryset = NotificationLog.objects.select_related("booking")
        booking_id = self.request.query_params.get("booking_id")
        channel = self.request.query_params.get("channel")
        status_value = self.request.query_params.get("status")
        if booking_id:
            queryset = queryset.filter(booking__booking_id=booking_id)
        if channel:
            queryset = queryset.filter(channel=channel)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset


@extend_schema(tags=["Admin Notifications"])
class AdminNotificationLogDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = NotificationLogSerializer
    queryset = NotificationLog.objects.select_related("booking")

    def retrieve(self, request, *args, **kwargs):
        return success_response(data=self.get_serializer(self.get_object()).data)


@extend_schema(exclude=True)
class WhatsAppWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge", "")
        if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
            return HttpResponse(challenge, status=status.HTTP_200_OK)
        return HttpResponse("Forbidden", status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        WhatsAppWebhookService.process_payload(request.data)
        return success_response(message="Webhook received.")
