from __future__ import annotations

from builtins import property as builtin_property
from datetime import date, timedelta
from decimal import Decimal
from typing import Any
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.core.validators import (
    MinValueValidator,
    RegexValidator,
)
from django.db import models, transaction
from django.db.models import F, Q
from django.utils import timezone

from apps.common.models import BaseModel
from apps.cottages.models import Cottage
from apps.properties.models import Property

phone_validator = RegexValidator(
    regex=r"^\+?[1-9]\d{7,14}$",
    message=("Enter a valid phone number with country code, " "for example +919876543210."),
)


class BookingSequence(models.Model):
    """
    Maintains a safe yearly sequence for public booking IDs.

    Example:
    GVC-2026-000001
    """

    year = models.PositiveSmallIntegerField(
        unique=True,
    )

    last_number = models.PositiveIntegerField(
        default=0,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "booking_sequences"
        ordering = ["-year"]

    def __str__(self) -> str:
        return f"{self.year}: {self.last_number}"

    @classmethod
    def next_booking_id(cls) -> str:
        current_year = timezone.localdate().year

        with transaction.atomic():
            sequence, _ = cls.objects.select_for_update().get_or_create(
                year=current_year,
                defaults={"last_number": 0},
            )

            sequence.last_number = F("last_number") + 1
            sequence.save(update_fields=["last_number", "updated_at"])
            sequence.refresh_from_db(fields=["last_number"])

        return f"GVC-{current_year}-{sequence.last_number:06d}"


class BookingQuerySet(models.QuerySet):
    def active(self) -> BookingQuerySet:
        return self.filter(
            Q(booking_status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN])
            | Q(booking_status=Booking.Status.PENDING, hold_expires_at__gt=timezone.now())
        )

    def confirmed(self) -> BookingQuerySet:
        return self.filter(
            booking_status=Booking.Status.CONFIRMED,
        )

    def upcoming(self) -> BookingQuerySet:
        return self.active().filter(
            check_in_date__gte=timezone.localdate(),
        )

    def current_stays(self) -> BookingQuerySet:
        today = timezone.localdate()

        return self.filter(
            booking_status=Booking.Status.CHECKED_IN,
            check_in_date__lte=today,
            check_out_date__gt=today,
        )

    def arrivals_on(self, selected_date: date) -> BookingQuerySet:
        return self.exclude(
            booking_status=Booking.Status.CANCELLED,
        ).filter(
            check_in_date=selected_date,
        )

    def departures_on(self, selected_date: date) -> BookingQuerySet:
        return self.exclude(
            booking_status=Booking.Status.CANCELLED,
        ).filter(
            check_out_date=selected_date,
        )

    def overlapping(
        self,
        cottage: Cottage,
        check_in_date: date,
        check_out_date: date,
    ) -> BookingQuerySet:
        """
        Checkout date does not block the next booking.

        Existing booking:
        10 August to 12 August

        Allowed:
        12 August to 14 August
        """
        return self.active().filter(
            cottage=cottage,
            check_in_date__lt=check_out_date,
            check_out_date__gt=check_in_date,
        )


class Booking(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CHECKED_IN = "checked_in", "Checked In"
        CHECKED_OUT = "checked_out", "Checked Out"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No Show"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PARTIALLY_PAID = "partially_paid", "Partially Paid"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class PaymentMethod(models.TextChoices):
        PAY_AT_PROPERTY = "pay_at_property", "Pay at Property"
        CASH = "cash", "Cash"
        UPI = "upi", "UPI"
        CARD = "card", "Card"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        ONLINE_GATEWAY = "online_gateway", "Online Gateway"

    class Source(models.TextChoices):
        WEBSITE = "website", "Website"
        ADMIN = "admin", "Admin"
        PHONE = "phone", "Phone"
        WHATSAPP = "whatsapp", "WhatsApp"
        WALK_IN = "walk_in", "Walk-in"

    class NotificationChannel(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        ALL = "all", "All"

    class IdentityProofType(models.TextChoices):
        AADHAAR = "aadhaar", "Aadhaar Card"
        PAN = "pan", "PAN Card"
        PASSPORT = "passport", "Passport"
        DRIVING_LICENCE = "driving_licence", "Driving Licence"
        VOTER_ID = "voter_id", "Voter ID"
        OTHER = "other", "Other"

    # ------------------------------------------------------------------
    # Booking identification
    # ------------------------------------------------------------------

    booking_id = models.CharField(
        max_length=25,
        unique=True,
        db_index=True,
        editable=False,
    )

    property = models.ForeignKey(
        Property,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    cottage = models.ForeignKey(
        Cottage,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    # ------------------------------------------------------------------
    # Primary guest information
    # ------------------------------------------------------------------

    guest_name = models.CharField(
        max_length=150,
        db_index=True,
    )

    guest_phone = models.CharField(
        max_length=16,
        validators=[phone_validator],
        db_index=True,
        help_text="Store in international format, for example +919876543210.",
    )

    guest_email = models.EmailField(
        blank=True,
        db_index=True,
    )

    guest_address = models.TextField(
        blank=True,
    )

    guest_city = models.CharField(
        max_length=100,
        blank=True,
    )

    guest_state = models.CharField(
        max_length=100,
        blank=True,
    )

    guest_country = models.CharField(
        max_length=100,
        default="India",
        blank=True,
    )

    guest_pincode = models.CharField(
        max_length=12,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Guest identity
    # ------------------------------------------------------------------

    id_proof_type = models.CharField(
        max_length=30,
        choices=IdentityProofType.choices,
        blank=True,
    )

    id_proof_number = models.CharField(
        max_length=100,
        blank=True,
    )

    id_proof_image = models.ImageField(
        upload_to="bookings/id-proofs/%Y/%m/",
        null=True,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Stay information
    # ------------------------------------------------------------------

    check_in_date = models.DateField(
        db_index=True,
    )

    check_out_date = models.DateField(
        db_index=True,
    )

    number_of_nights = models.PositiveSmallIntegerField(
        editable=False,
        validators=[MinValueValidator(1)],
    )

    adults = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    children = models.PositiveSmallIntegerField(
        default=0,
    )

    expected_arrival_time = models.TimeField(
        null=True,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Price snapshot
    #
    # Prices are copied when booking is created so that future cottage
    # price changes do not affect an existing booking.
    # ------------------------------------------------------------------

    weekday_nights = models.PositiveSmallIntegerField(
        default=0,
        editable=False,
    )

    saturday_nights = models.PositiveSmallIntegerField(
        default=0,
        editable=False,
    )

    sunday_nights = models.PositiveSmallIntegerField(
        default=0,
        editable=False,
    )

    weekday_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    saturday_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    sunday_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    room_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # ------------------------------------------------------------------
    # Payment summary
    # ------------------------------------------------------------------

    payment_status = models.CharField(
        max_length=25,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
        db_index=True,
    )

    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        default=PaymentMethod.PAY_AT_PROPERTY,
        db_index=True,
    )

    payment_reference = models.CharField(
        max_length=150,
        blank=True,
        db_index=True,
    )

    hold_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Pending bookings block availability only until this time.",
    )

    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    balance_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # ------------------------------------------------------------------
    # Booking status and operations
    # ------------------------------------------------------------------

    booking_status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    source = models.CharField(
        max_length=20,
        choices=Source.choices,
        default=Source.WEBSITE,
        db_index=True,
    )

    special_request = models.TextField(
        blank=True,
    )

    admin_notes = models.TextField(
        blank=True,
    )

    cancellation_reason = models.TextField(
        blank=True,
    )

    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    checked_in_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    checked_out_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Notification preferences
    # ------------------------------------------------------------------

    whatsapp_opt_in = models.BooleanField(
        default=True,
    )

    sms_opt_in = models.BooleanField(
        default=False,
    )

    email_opt_in = models.BooleanField(
        default=True,
    )

    preferred_notification_channel = models.CharField(
        max_length=20,
        choices=NotificationChannel.choices,
        default=NotificationChannel.WHATSAPP,
    )

    # ------------------------------------------------------------------
    # Request metadata
    # ------------------------------------------------------------------

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    user_agent = models.CharField(
        max_length=500,
        blank=True,
    )

    objects = BookingQuerySet.as_manager()

    class Meta:
        db_table = "bookings"
        ordering = ["-created_at"]
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

        indexes = [
            models.Index(
                fields=["cottage", "check_in_date", "check_out_date"],
                name="booking_cottage_dates_idx",
            ),
            models.Index(
                fields=["cottage", "booking_status"],
                name="booking_cottage_status_idx",
            ),
            models.Index(
                fields=["booking_status", "check_in_date"],
                name="booking_status_checkin_idx",
            ),
            models.Index(
                fields=["booking_status", "check_out_date"],
                name="booking_status_checkout_idx",
            ),
            models.Index(
                fields=["guest_phone", "booking_id"],
                name="booking_phone_lookup_idx",
            ),
            models.Index(
                fields=["payment_status", "created_at"],
                name="booking_payment_created_idx",
            ),
            models.Index(
                fields=["source", "created_at"],
                name="booking_source_created_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(check_out_date__gt=F("check_in_date")),
                name="booking_checkout_after_checkin",
            ),
            models.CheckConstraint(
                condition=Q(number_of_nights__gte=1),
                name="booking_nights_gte_1",
            ),
            models.CheckConstraint(
                condition=Q(adults__gte=1),
                name="booking_adults_gte_1",
            ),
            models.CheckConstraint(
                condition=Q(children__gte=0),
                name="booking_children_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(room_amount__gte=0),
                name="booking_room_amount_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(subtotal__gte=0),
                name="booking_subtotal_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(tax_amount__gte=0),
                name="booking_tax_amount_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(discount_amount__gte=0),
                name="booking_discount_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(grand_total__gte=0),
                name="booking_total_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(amount_paid__gte=0),
                name="booking_paid_amount_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(balance_amount__gte=0),
                name="booking_balance_gte_0",
            ),
            models.CheckConstraint(
                condition=Q(amount_paid__lte=F("grand_total")),
                name="booking_paid_not_above_total",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.booking_id} - {self.guest_name}"

    @builtin_property
    def total_guests(self) -> int:
        return self.adults + self.children

    @builtin_property
    def is_active_booking(self) -> bool:
        if self.booking_status in {self.Status.CONFIRMED, self.Status.CHECKED_IN}:
            return True
        return self.booking_status == self.Status.PENDING and bool(
            self.hold_expires_at and self.hold_expires_at > timezone.now()
        )

    @builtin_property
    def is_cancelled(self) -> bool:
        return self.booking_status == self.Status.CANCELLED

    @builtin_property
    def check_in_time(self):
        """
        Check-in time comes from the property.

        Example:
        10:00 AM
        """
        return self.property.check_in_time

    @builtin_property
    def check_out_time(self):
        """
        Check-out time comes from the property.

        Example:
        10:00 AM
        """
        return self.property.check_out_time

    def overlaps(
        self,
        check_in_date: date,
        check_out_date: date,
    ) -> bool:
        return check_in_date < self.check_out_date and check_out_date > self.check_in_date

    def normalize_phone(self) -> None:
        value = self.guest_phone.strip()
        value = value.replace(" ", "")
        value = value.replace("-", "")
        value = value.replace("(", "")
        value = value.replace(")", "")

        if value.startswith("0") and len(value) == 11:
            value = f"+91{value[1:]}"

        elif len(value) == 10 and value.isdigit():
            value = f"+91{value}"

        elif value.startswith("91") and not value.startswith("+"):
            value = f"+{value}"

        self.guest_phone = value

    def clean(self) -> None:
        super().clean()

        errors: dict[str, str] = {}

        if self.check_in_date and self.check_out_date:
            if self.check_out_date <= self.check_in_date:
                errors["check_out_date"] = "Check-out date must be after the check-in date."

            nights = (self.check_out_date - self.check_in_date).days

            if nights < 1:
                errors["check_out_date"] = "The booking must be for at least one night."

            if self.cottage_id:
                if nights < 1:
                    errors["check_out_date"] = "The cottage must be booked for at least 24 hours."

        if self.cottage_id:
            if self.property_id != self.cottage.property_id:
                errors["property"] = "The selected cottage does not belong to this property."

            if self.cottage.status != Cottage.Status.ACTIVE:
                errors["cottage"] = "The selected cottage is not currently bookable."

            if self.total_guests > self.cottage.maximum_guests:
                errors["adults"] = (
                    f"This cottage allows a maximum of " f"{self.cottage.maximum_guests} guests."
                )

        if self.amount_paid > self.grand_total:
            errors["amount_paid"] = "Paid amount cannot be greater than the booking total."

        if self.discount_amount > self.subtotal + self.tax_amount:
            errors["discount_amount"] = "Discount cannot be greater than the booking amount."

        if self.payment_status == self.PaymentStatus.PAID and self.amount_paid < self.grand_total:
            errors["payment_status"] = "Payment cannot be marked as paid while a balance remains."

        if self.payment_status == self.PaymentStatus.UNPAID and self.amount_paid > 0:
            errors["payment_status"] = "Use partially paid when an amount has been received."

        if (
            self.preferred_notification_channel == self.NotificationChannel.EMAIL
            and not self.guest_email
        ):
            errors["preferred_notification_channel"] = (
                "Email cannot be preferred without a guest email address."
            )

        if self.booking_status == self.Status.CANCELLED and not self.cancellation_reason.strip():
            errors["cancellation_reason"] = "A cancellation reason is required."

        if errors:
            raise ValidationError(errors)

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.guest_name = self.guest_name.strip()
        self.guest_email = self.guest_email.strip().lower()
        self.normalize_phone()

        if self.check_in_date and self.check_out_date:
            self.number_of_nights = (self.check_out_date - self.check_in_date).days

        if not self.booking_id:
            self.booking_id = BookingSequence.next_booking_id()

        if self.booking_status == self.Status.PENDING and not self.hold_expires_at:
            self.hold_expires_at = timezone.now() + timedelta(hours=24)

        self.balance_amount = max(
            self.grand_total - self.amount_paid,
            Decimal("0.00"),
        )

        self.full_clean()
        super().save(*args, **kwargs)


class BookingStatusHistory(BaseModel):
    """
    Stores an audit trail whenever booking or payment status changes.
    """

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    previous_booking_status = models.CharField(
        max_length=25,
        choices=Booking.Status.choices,
        blank=True,
    )

    new_booking_status = models.CharField(
        max_length=25,
        choices=Booking.Status.choices,
    )

    previous_payment_status = models.CharField(
        max_length=25,
        choices=Booking.PaymentStatus.choices,
        blank=True,
    )

    new_payment_status = models.CharField(
        max_length=25,
        choices=Booking.PaymentStatus.choices,
    )

    note = models.TextField(
        blank=True,
    )

    changed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="booking_status_changes",
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "booking_status_history"
        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["booking", "created_at"],
                name="booking_history_created_idx",
            ),
        ]

    def __str__(self) -> str:
        return (
            f"{self.booking.booking_id}: "
            f"{self.previous_booking_status or 'new'} "
            f"→ {self.new_booking_status}"
        )


class CancellationRequest(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="cancellation_requests",
    )

    request_reference = models.UUIDField(
        default=uuid4,
        unique=True,
        editable=False,
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    requested_phone = models.CharField(
        max_length=16,
        validators=[phone_validator],
    )

    reviewed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="reviewed_cancellation_requests",
        null=True,
        blank=True,
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    admin_note = models.TextField(
        blank=True,
    )

    class Meta:
        db_table = "booking_cancellation_requests"
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["booking"],
                condition=Q(status="pending"),
                name="one_pending_cancellation_per_booking",
            ),
        ]

        indexes = [
            models.Index(
                fields=["status", "created_at"],
                name="cancel_request_status_idx",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.booking.booking_id} - {self.status}"

    def clean(self) -> None:
        super().clean()

        if self.booking_id and self.booking.booking_status in {
            Booking.Status.CANCELLED,
            Booking.Status.CHECKED_OUT,
            Booking.Status.COMPLETED,
        }:
            raise ValidationError(
                {"booking": ("A cancellation request cannot be created " "for this booking.")}
            )
