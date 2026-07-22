from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify

from apps.common.cache import safe_cache_delete
from apps.common.models import BaseModel
from apps.properties.models import Property

COTTAGE_PUBLIC_LIST_CACHE_KEY = "cottages:public:list"
COTTAGE_DETAIL_CACHE_PREFIX = "cottages:public:detail:"


def cottage_thumbnail_upload_path(instance: Cottage, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    cottage_code = slugify(instance.cottage_code or "cottage")
    return f"cottages/{cottage_code}/thumbnail/thumbnail{extension}"


def cottage_cover_upload_path(instance: Cottage, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    cottage_code = slugify(instance.cottage_code or "cottage")
    return f"cottages/{cottage_code}/cover/cover{extension}"


def validate_string_list(value: Any) -> None:
    if not isinstance(value, list):
        raise ValidationError("This field must contain a list.")

    for index, item in enumerate(value):
        if not isinstance(item, str):
            raise ValidationError(f"Item at position {index + 1} must be a string.")
        if not item.strip():
            raise ValidationError(f"Item at position {index + 1} cannot be empty.")


class CottageQuerySet(models.QuerySet):
    def active(self) -> CottageQuerySet:
        return self.filter(status=Cottage.Status.ACTIVE)

    def bookable(self) -> CottageQuerySet:
        return self.active().filter(
            property__status=Property.Status.ACTIVE,
            property__booking_enabled=True,
        )

    def featured(self) -> CottageQuerySet:
        return self.filter(is_featured=True)


class Cottage(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        MAINTENANCE = "maintenance", "Maintenance"
        BLOCKED = "blocked", "Blocked"

    property = models.ForeignKey(Property, on_delete=models.PROTECT, related_name="cottages")
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True, db_index=True)
    cottage_code = models.CharField(max_length=30, unique=True, db_index=True)
    room_type = models.CharField(max_length=100, blank=True)
    bed_type = models.CharField(max_length=100, blank=True)
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    location_note = models.CharField(max_length=255, blank=True)
    view_type = models.CharField(max_length=100, blank=True)

    number_of_beds = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    number_of_bathrooms = models.PositiveSmallIntegerField(
        default=1, validators=[MinValueValidator(1)]
    )
    maximum_guests = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1)])
    maximum_adults = models.PositiveSmallIntegerField(default=2, validators=[MinValueValidator(1)])
    maximum_children = models.PositiveSmallIntegerField(default=0)
    extra_bed_available = models.BooleanField(default=False)

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        db_index=True,
        help_text="Default Monday to Friday price.",
    )
    saturday_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Saturday night price.",
    )
    sunday_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Sunday night price.",
    )
    extra_adult_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    extra_child_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))],
    )
    minimum_nights = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])

    thumbnail = models.ImageField(upload_to=cottage_thumbnail_upload_path, null=True, blank=True)
    cover_image = models.ImageField(upload_to=cottage_cover_upload_path, null=True, blank=True)
    bed_images = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    bathroom_images = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    interior_images = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    exterior_images = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    gallery_images = models.JSONField(default=list, blank=True, validators=[validate_string_list])
    amenities = models.JSONField(default=list, blank=True, validators=[validate_string_list])

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    sort_order = models.PositiveIntegerField(default=0)
    admin_notes = models.TextField(blank=True)

    objects = CottageQuerySet.as_manager()

    class Meta:
        db_table = "cottages"
        ordering = ["sort_order", "name"]
        indexes = [
            models.Index(fields=["property"], name="cottage_property_idx"),
            models.Index(fields=["slug"], name="cottage_slug_idx"),
            models.Index(fields=["cottage_code"], name="cottage_code_idx"),
            models.Index(fields=["status"], name="cottage_status_idx"),
            models.Index(fields=["is_featured"], name="cottage_featured_idx"),
            models.Index(fields=["base_price"], name="cottage_base_price_idx"),
            models.Index(fields=["status", "sort_order"], name="cottage_public_order_idx"),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(maximum_guests__gte=1), name="cottage_guests_gte_1"),
            models.CheckConstraint(condition=Q(maximum_adults__gte=1), name="cottage_adults_gte_1"),
            models.CheckConstraint(
                condition=Q(maximum_guests__gte=models.F("maximum_adults")),
                name="cottage_guests_gte_adults",
            ),
            models.CheckConstraint(condition=Q(base_price__gte=0), name="cottage_base_price_gte_0"),
            models.CheckConstraint(
                condition=Q(saturday_price__gte=0), name="cottage_saturday_price_gte_0"
            ),
            models.CheckConstraint(
                condition=Q(sunday_price__gte=0), name="cottage_sunday_price_gte_0"
            ),
            models.CheckConstraint(
                condition=Q(tax_percentage__gte=0) & Q(tax_percentage__lte=100),
                name="cottage_tax_between_0_100",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.cottage_code})"

    def get_price_for_date(self, stay_date) -> Decimal:
        weekday = stay_date.weekday()
        if weekday == 5:
            return self.saturday_price
        if weekday == 6:
            return self.sunday_price
        return self.base_price

    def clean(self) -> None:
        super().clean()
        errors: dict[str, str] = {}
        if self.maximum_guests < self.maximum_adults:
            errors["maximum_guests"] = "Maximum guests cannot be less than maximum adults."
        if self.maximum_children > self.maximum_guests:
            errors["maximum_children"] = "Maximum children cannot exceed maximum guests."
        if errors:
            raise ValidationError(errors)

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.name = self.name.strip()
        self.cottage_code = self.cottage_code.upper().strip()
        self.room_type = self.room_type.strip()
        self.bed_type = self.bed_type.strip()

        if not self.slug:
            base_slug = slugify(self.name) or "cottage"
            slug_value = base_slug
            counter = 2
            while Cottage.objects.filter(slug=slug_value).exclude(pk=self.pk).exists():
                slug_value = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug_value

        self.full_clean()
        super().save(*args, **kwargs)
        self.invalidate_cache()

    def delete(self, *args: Any, **kwargs: Any) -> tuple[int, dict[str, int]]:
        deleted = super().delete(*args, **kwargs)
        self.invalidate_cache()
        return deleted

    def invalidate_cache(self) -> None:
        safe_cache_delete(COTTAGE_PUBLIC_LIST_CACHE_KEY)
        safe_cache_delete(f"{COTTAGE_DETAIL_CACHE_PREFIX}{self.slug}")


class CottageBlock(BaseModel):
    class BlockType(models.TextChoices):
        MAINTENANCE = "maintenance", "Maintenance"
        REPAIR = "repair", "Repair"
        CLEANING = "cleaning", "Cleaning"
        PRIVATE_USE = "private_use", "Private Use"
        RENOVATION = "renovation", "Renovation"
        OTHER = "other", "Other"

    cottage = models.ForeignKey(Cottage, on_delete=models.CASCADE, related_name="blocks")
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    block_type = models.CharField(
        max_length=20, choices=BlockType.choices, default=BlockType.MAINTENANCE
    )
    reason = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="created_cottage_blocks",
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "cottage_blocks"
        ordering = ["-start_date"]
        indexes = [
            models.Index(
                fields=["cottage", "start_date", "end_date"], name="cottage_block_date_idx"
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(end_date__gt=models.F("start_date")),
                name="cottage_block_end_after_start",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.cottage.name}: {self.start_date} to {self.end_date}"

    def clean(self) -> None:
        super().clean()
        if not self.start_date or not self.end_date:
            return
        if self.end_date <= self.start_date:
            raise ValidationError({"end_date": "End date must be after the start date."})

    def save(self, *args: Any, **kwargs: Any) -> None:
        self.full_clean()
        super().save(*args, **kwargs)
        self.cottage.invalidate_cache()

    def delete(self, *args: Any, **kwargs: Any) -> tuple[int, dict[str, int]]:
        cottage = self.cottage
        deleted = super().delete(*args, **kwargs)
        cottage.invalidate_cache()
        return deleted


class CottageAvailabilityHold(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        RELEASED = "released", "Released"
        CONVERTED = "converted", "Converted to Booking"

    cottage = models.ForeignKey(
        Cottage, on_delete=models.CASCADE, related_name="availability_holds"
    )
    check_in_date = models.DateField(db_index=True)
    check_out_date = models.DateField(db_index=True)
    guest_phone = models.CharField(max_length=20, blank=True, db_index=True)
    guest_email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )
    expires_at = models.DateTimeField(db_index=True)
    released_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = "cottage_availability_holds"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["cottage", "check_in_date", "check_out_date", "status"],
                name="cottage_hold_overlap_idx",
            ),
            models.Index(fields=["expires_at", "status"], name="cottage_hold_expiry_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(check_out_date__gt=models.F("check_in_date")),
                name="cottage_hold_checkout_after_checkin",
            ),
        ]

    def clean(self) -> None:
        super().clean()
        if self.check_out_date <= self.check_in_date:
            raise ValidationError({"check_out_date": "Check-out must be after check-in."})

    @classmethod
    def default_expiry(cls):
        return timezone.now() + timedelta(hours=24)

    @property
    def is_active(self) -> bool:
        return self.status == self.Status.ACTIVE and self.expires_at > timezone.now()

    def release(self) -> None:
        self.status = self.Status.RELEASED
        self.released_at = timezone.now()
        self.save(update_fields=["status", "released_at", "updated_at"])

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.expires_at:
            self.expires_at = self.default_expiry()
        self.full_clean()
        super().save(*args, **kwargs)
        self.cottage.invalidate_cache()
