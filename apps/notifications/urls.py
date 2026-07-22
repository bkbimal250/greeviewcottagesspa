from django.urls import path

from apps.notifications.views import (
    AdminNotificationLogDetailView,
    AdminNotificationLogListView,
    WhatsAppWebhookView,
)

app_name = "notifications"

urlpatterns = [
    path(
        "admin/notifications/",
        AdminNotificationLogListView.as_view(),
        name="admin-notification-list",
    ),
    path(
        "admin/notifications/<uuid:pk>/",
        AdminNotificationLogDetailView.as_view(),
        name="admin-notification-detail",
    ),
    path("webhooks/whatsapp/", WhatsAppWebhookView.as_view(), name="whatsapp-webhook"),
]
