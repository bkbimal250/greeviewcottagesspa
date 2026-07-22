from rest_framework import serializers

from apps.notifications.models import NotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source="booking.booking_id", read_only=True)

    class Meta:
        model = NotificationLog
        fields = (
            "id",
            "booking",
            "booking_id",
            "channel",
            "recipient",
            "template_name",
            "subject",
            "message",
            "status",
            "provider_message_id",
            "provider_event_id",
            "error_message",
            "retry_count",
            "sent_at",
            "delivered_at",
            "read_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
