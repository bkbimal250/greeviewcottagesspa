from django.db import models
from django.db.models import Q

from apps.bookings.models import Booking
from apps.common.models import BaseModel


class NotificationLog(BaseModel):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"

    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        SENT = "sent", "Sent"
        DELIVERED = "delivered", "Delivered"
        READ = "read", "Read"
        FAILED = "failed", "Failed"

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="notification_logs",
        null=True,
        blank=True,
    )
    channel = models.CharField(max_length=20, choices=Channel.choices, db_index=True)
    recipient = models.CharField(max_length=255, db_index=True)
    template_name = models.CharField(max_length=100, blank=True, db_index=True)
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.QUEUED,
        db_index=True,
    )
    provider_message_id = models.CharField(max_length=150, blank=True, db_index=True)
    provider_event_id = models.CharField(max_length=150, blank=True, db_index=True)
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveSmallIntegerField(default=0)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notification_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking", "created_at"], name="notif_booking_created_idx"),
            models.Index(fields=["channel", "status"], name="notif_channel_status_idx"),
            models.Index(fields=["status", "created_at"], name="notif_status_created_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["provider_event_id"],
                condition=~Q(provider_event_id=""),
                name="uniq_nonblank_notif_event_id",
            ),
        ]

    def __str__(self) -> str:
        target = self.booking.booking_id if self.booking_id else self.recipient
        return f"{target} - {self.channel} - {self.status}"
