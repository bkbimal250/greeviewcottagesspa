from django.contrib import admin

from apps.notifications.models import NotificationLog


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ("booking", "channel", "recipient", "template_name", "status", "created_at")
    list_filter = ("channel", "status", "template_name", "created_at")
    search_fields = (
        "booking__booking_id",
        "booking__guest_name",
        "recipient",
        "provider_message_id",
        "provider_event_id",
    )
    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
        "sent_at",
        "delivered_at",
        "read_at",
    )
