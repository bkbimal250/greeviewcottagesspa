from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from apps.bookings.models import Booking
from apps.common.models import BaseModel


class Payment(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESSFUL = "successful", "Successful"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class Provider(models.TextChoices):
        MANUAL = "manual", "Manual"
        CASH = "cash", "Cash"
        UPI = "upi", "UPI"
        CARD = "card", "Card"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        RAZORPAY = "razorpay", "Razorpay"
        ONLINE_GATEWAY = "online_gateway", "Online Gateway"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    method = models.CharField(max_length=30, choices=Booking.PaymentMethod.choices, db_index=True)
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.SUCCESSFUL,
        db_index=True,
    )
    provider = models.CharField(
        max_length=30,
        choices=Provider.choices,
        default=Provider.MANUAL,
        db_index=True,
    )
    transaction_id = models.CharField(max_length=150, blank=True, db_index=True)
    gateway_order_id = models.CharField(max_length=150, blank=True, db_index=True)
    gateway_payment_id = models.CharField(max_length=150, blank=True, db_index=True)
    gateway_signature = models.CharField(max_length=255, blank=True)
    currency = models.CharField(max_length=3, default="INR")
    notes = models.TextField(blank=True)
    received_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="received_payments",
        null=True,
        blank=True,
    )
    paid_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking", "created_at"], name="payment_booking_created_idx"),
            models.Index(fields=["status", "created_at"], name="payment_status_created_idx"),
            models.Index(fields=["method", "created_at"], name="payment_method_created_idx"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0), name="payment_amount_gt_zero"),
            models.UniqueConstraint(
                fields=["transaction_id"],
                condition=~Q(transaction_id=""),
                name="uniq_nonblank_payment_txn",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.booking.booking_id} - {self.amount} {self.status}"


class PaymentOrder(BaseModel):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        ATTEMPTED = "attempted", "Attempted"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    class Provider(models.TextChoices):
        RAZORPAY = "razorpay", "Razorpay"
        UPI_QR = "upi_qr", "UPI QR"

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment_orders",
    )
    provider = models.CharField(max_length=30, choices=Provider.choices, db_index=True)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
        db_index=True,
    )
    receipt = models.CharField(max_length=40, db_index=True)
    razorpay_order_id = models.CharField(max_length=150, blank=True, unique=True, null=True)
    upi_vpa = models.CharField(max_length=100, blank=True)
    upi_intent_url = models.TextField(blank=True)
    qr_code_data_uri = models.TextField(blank=True)
    provider_payload = models.JSONField(default=dict, blank=True)
    notes = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payment_orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["booking", "provider", "status"], name="payorder_booking_provider_idx"
            ),
            models.Index(fields=["status", "created_at"], name="payorder_status_created_idx"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0), name="payment_order_amount_gt_zero"),
        ]

    def __str__(self) -> str:
        return f"{self.booking.booking_id} - {self.provider} - {self.status}"
