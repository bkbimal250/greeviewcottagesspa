from __future__ import annotations

from datetime import time
from pathlib import Path
from typing import Any

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils.text import slugify

from apps.common.cache import safe_cache_delete
from apps.common.models import BaseModel
from apps.common.utils import normalize_phone_number

PROPERTY_PUBLIC_CACHE_KEY = "properties:public:active"
PROPERTY_ADMIN_CACHE_PREFIX = "properties:admin:"


def default_check_in_time() -> time:
    return time(12, 0)


def default_check_out_time() -> time:
    return time(10, 0)


def property_image_upload_path(instance: Property, filename: str) -> str:
    """
    Upload single property images into an organised property directory.

    Example:
    properties/gvc-001/cover/cover-image.jpg
    """
    extension = Path(filename).suffix.lower()
    image_type = getattr(instance, "_upload_image_type", "general")
    property_code = slugify(instance.property_code or "property")

    return f"properties/{property_code}/{image_type}/" f"{image_type}{extension}"


def property_logo_upload_path(instance: Property, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    property_code = slugify(instance.property_code or "property")

    return f"properties/{property_code}/logo/logo{extension}"


def property_thumbnail_upload_path(
    instance: Property,
    filename: str,
) -> str:
    extension = Path(filename).suffix.lower()
    property_code = slugify(instance.property_code or "property")

    return f"properties/{property_code}/thumbnail/thumbnail{extension}"


def property_cover_upload_path(instance: Property, filename: str) -> str:
    extension = Path(filename).suffix.lower()
    property_code = slugify(instance.property_code or "property")

    return f"properties/{property_code}/cover/cover{extension}"


def validate_string_list(value: Any) -> None:
    """
    Validate JSON fields expected to contain a list of strings.

    Used for:
    - facilities
    - image URL collections
    - SEO keywords
    """
    if not isinstance(value, list):
        raise ValidationError("This field must contain a list.")

    for item in value:
        if not isinstance(item, str):
            raise ValidationError("Every item in this field must be a string.")

        if not item.strip():
            raise ValidationError("Empty values are not allowed.")


def validate_nearby_places(value: Any) -> None:
    """
    Validate nearby places stored inside the Property JSONField.

    Expected structure:

    [
        {
            "name": "Nakki Lake",
            "category": "Tourist attraction",
            "distance": "3 km",
            "travel_time": "10 minutes",
            "maps_url": "https://..."
        }
    ]
    """
    if not isinstance(value, list):
        raise ValidationError("Nearby places must be a list.")

    allowed_keys = {
        "name",
        "category",
        "distance",
        "travel_time",
        "maps_url",
    }

    for index, place in enumerate(value):
        if not isinstance(place, dict):
            raise ValidationError(f"Nearby place at position {index + 1} must be an object.")

        name = place.get("name")

        if not isinstance(name, str) or not name.strip():
            raise ValidationError(f"Nearby place at position {index + 1} requires a name.")

        unknown_keys = set(place.keys()) - allowed_keys

        if unknown_keys:
            raise ValidationError(
                f"Unsupported nearby-place fields: " f"{', '.join(sorted(unknown_keys))}."
            )

        for key, item in place.items():
            if item is not None and not isinstance(item, str):
                raise ValidationError(f"'{key}' in nearby place {index + 1} " "must be a string.")


class PropertyQuerySet(models.QuerySet):
    def active(self) -> PropertyQuerySet:
        return self.filter(status=Property.Status.ACTIVE)

    def publicly_available(self) -> PropertyQuerySet:
        return self.active().filter(booking_enabled=True)


class Property(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        TEMPORARILY_CLOSED = (
            "temporarily_closed",
            "Temporarily Closed",
        )

    class PropertyType(models.TextChoices):
        COTTAGE_RESORT = "cottage_resort", "Cottage Resort"
        RESORT = "resort", "Resort"
        HOTEL = "hotel", "Hotel"
        HOMESTAY = "homestay", "Homestay"
        GUEST_HOUSE = "guest_house", "Guest House"
        OTHER = "other", "Other"

    # ------------------------------------------------------------------
    # Basic information
    # ------------------------------------------------------------------

    name = models.CharField(
        max_length=200,
        verbose_name="Property name",
    )

    slug = models.SlugField(
        max_length=220,
        unique=True,
        db_index=True,
        blank=True,
    )

    property_code = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        default="GVC-001",
    )

    property_type = models.CharField(
        max_length=30,
        choices=PropertyType.choices,
        default=PropertyType.COTTAGE_RESORT,
        db_index=True,
    )

    tagline = models.CharField(
        max_length=255,
        blank=True,
    )

    short_description = models.TextField(
        blank=True,
        help_text="Short description shown on property cards and headers.",
    )

    description = models.TextField(
        blank=True,
        help_text="Complete customer-facing property description.",
    )

    # ------------------------------------------------------------------
    # Address and map
    # ------------------------------------------------------------------

    address_line_1 = models.CharField(
        max_length=255,
        blank=True,
    )

    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
    )

    locality = models.CharField(
        max_length=120,
        blank=True,
        db_index=True,
    )

    landmark = models.CharField(
        max_length=255,
        blank=True,
    )

    city = models.CharField(
        max_length=120,
        default="Mount Abu",
        db_index=True,
    )

    district = models.CharField(
        max_length=120,
        default="Sirohi",
        blank=True,
    )

    state = models.CharField(
        max_length=120,
        default="Rajasthan",
        db_index=True,
    )

    country = models.CharField(
        max_length=120,
        default="India",
    )

    pincode = models.CharField(
        max_length=12,
        default="307501",
        db_index=True,
    )

    google_plus_code = models.CharField(
        max_length=150,
        blank=True,
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90),
        ],
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180),
        ],
    )

    google_maps_url = models.URLField(
        max_length=1000,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Contact information
    # ------------------------------------------------------------------

    primary_phone = models.CharField(
        max_length=20,
        blank=True,
        db_index=True,
    )

    secondary_phone = models.CharField(
        max_length=20,
        blank=True,
    )

    whatsapp_number = models.CharField(
        max_length=20,
        blank=True,
        db_index=True,
    )

    email = models.EmailField(
        blank=True,
    )

    reservation_email = models.EmailField(
        blank=True,
    )

    website_url = models.URLField(
        max_length=500,
        blank=True,
    )

    instagram_url = models.URLField(
        max_length=500,
        blank=True,
    )

    facebook_url = models.URLField(
        max_length=500,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Property timings
    # ------------------------------------------------------------------

    check_in_time = models.TimeField(
        default=default_check_in_time,
    )

    check_out_time = models.TimeField(
        default=default_check_out_time,
    )

    reception_open_time = models.TimeField(
        null=True,
        blank=True,
    )

    reception_close_time = models.TimeField(
        null=True,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Main property images
    # ------------------------------------------------------------------

    logo = models.ImageField(
        upload_to=property_logo_upload_path,
        null=True,
        blank=True,
    )

    thumbnail = models.ImageField(
        upload_to=property_thumbnail_upload_path,
        null=True,
        blank=True,
    )

    cover_image = models.ImageField(
        upload_to=property_cover_upload_path,
        null=True,
        blank=True,
    )

    # Multiple images remain directly in this property record.
    # Upload endpoints should save files first and place their URLs here.

    exterior_images = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    reception_images = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    garden_images = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    common_area_images = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    gallery_images = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    # ------------------------------------------------------------------
    # Facilities and nearby locations
    # ------------------------------------------------------------------

    facilities = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
        help_text=("Property-level facilities such as parking, garden and Wi-Fi."),
    )

    nearby_places = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_nearby_places],
    )

    # ------------------------------------------------------------------
    # Rules and policies
    # ------------------------------------------------------------------

    house_rules = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    cancellation_policy = models.TextField(
        blank=True,
    )

    refund_policy = models.TextField(
        blank=True,
    )

    child_policy = models.TextField(
        blank=True,
    )

    pet_policy = models.TextField(
        blank=True,
    )

    extra_guest_policy = models.TextField(
        blank=True,
    )

    damage_policy = models.TextField(
        blank=True,
    )

    early_check_in_policy = models.TextField(
        blank=True,
    )

    late_check_out_policy = models.TextField(
        blank=True,
    )

    # ------------------------------------------------------------------
    # Guest and identity rules
    # ------------------------------------------------------------------

    minimum_check_in_age = models.PositiveSmallIntegerField(
        default=18,
        validators=[MinValueValidator(1)],
    )

    id_proof_required = models.BooleanField(
        default=True,
    )

    local_id_allowed = models.BooleanField(
        default=True,
    )

    unmarried_couples_allowed = models.BooleanField(
        default=True,
    )

    visitors_allowed = models.BooleanField(
        default=False,
    )

    pets_allowed = models.BooleanField(
        default=False,
    )

    smoking_allowed = models.BooleanField(
        default=False,
    )

    alcohol_allowed = models.BooleanField(
        default=False,
    )

    outside_food_allowed = models.BooleanField(
        default=True,
    )

    children_allowed = models.BooleanField(
        default=True,
    )

    children_free_below_age = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    quiet_hours_start = models.TimeField(
        null=True,
        blank=True,
    )

    quiet_hours_end = models.TimeField(
        null=True,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Booking configuration
    # ------------------------------------------------------------------

    booking_enabled = models.BooleanField(
        default=True,
        db_index=True,
    )

    same_day_booking_allowed = models.BooleanField(
        default=True,
    )

    minimum_stay_nights = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    maximum_stay_nights = models.PositiveSmallIntegerField(
        default=30,
        validators=[MinValueValidator(1)],
    )

    maximum_advance_booking_days = models.PositiveIntegerField(
        default=365,
        validators=[MinValueValidator(1)],
    )

    minimum_advance_booking_hours = models.PositiveIntegerField(
        default=0,
    )

    pay_at_property_allowed = models.BooleanField(
        default=True,
    )

    online_payment_enabled = models.BooleanField(
        default=False,
    )

    currency = models.CharField(
        max_length=3,
        default="INR",
    )

    default_tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    tax_included_in_price = models.BooleanField(
        default=False,
    )

    advance_payment_required = models.BooleanField(
        default=False,
    )

    advance_payment_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
    )

    # ------------------------------------------------------------------
    # Business and invoice information
    # ------------------------------------------------------------------

    legal_business_name = models.CharField(
        max_length=255,
        blank=True,
    )

    gst_number = models.CharField(
        max_length=20,
        blank=True,
    )

    pan_number = models.CharField(
        max_length=20,
        blank=True,
    )

    billing_address = models.TextField(
        blank=True,
    )

    invoice_prefix = models.CharField(
        max_length=20,
        default="GVC",
    )

    # ------------------------------------------------------------------
    # SEO
    # ------------------------------------------------------------------

    seo_title = models.CharField(
        max_length=255,
        blank=True,
    )

    seo_description = models.TextField(
        blank=True,
    )

    seo_keywords = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_string_list],
    )

    canonical_url = models.URLField(
        max_length=500,
        blank=True,
    )

    # ------------------------------------------------------------------
    # Administration
    # ------------------------------------------------------------------

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    admin_notes = models.TextField(
        blank=True,
    )

    objects = PropertyQuerySet.as_manager()

    class Meta:
        db_table = "properties"
        ordering = ("name",)
        verbose_name = "Property"
        verbose_name_plural = "Properties"

        indexes = [
            models.Index(
                fields=["status", "booking_enabled"],
                name="property_public_idx",
            ),
            models.Index(
                fields=["city", "state"],
                name="property_location_idx",
            ),
            models.Index(
                fields=["created_at"],
                name="property_created_idx",
            ),
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["status"],
                condition=Q(status="active"),
                name="only_one_active_property",
            ),
            models.CheckConstraint(
                condition=Q(minimum_stay_nights__gte=1),
                name="property_min_stay_gte_1",
            ),
            models.CheckConstraint(
                condition=Q(maximum_stay_nights__gte=models.F("minimum_stay_nights")),
                name="property_max_stay_gte_min_stay",
            ),
            models.CheckConstraint(
                condition=Q(default_tax_percentage__gte=0) & Q(default_tax_percentage__lte=100),
                name="property_tax_between_0_100",
            ),
            models.CheckConstraint(
                condition=Q(advance_payment_percentage__gte=0)
                & Q(advance_payment_percentage__lte=100),
                name="property_advance_between_0_100",
            ),
        ]

    def __str__(self) -> str:
        return self.name

    @property
    def full_address(self) -> str:
        address_parts = [
            self.address_line_1,
            self.address_line_2,
            self.locality,
            self.landmark,
            self.city,
            self.district,
            self.state,
            self.pincode,
            self.country,
        ]

        return ", ".join(str(part).strip() for part in address_parts if part and str(part).strip())

    @property
    def public_email(self) -> str:
        return self.reservation_email or self.email

    @property
    def public_phone(self) -> str:
        return self.primary_phone or self.whatsapp_number

    def clean(self) -> None:
        super().clean()

        errors: dict[str, str] = {}

        if self.maximum_stay_nights < self.minimum_stay_nights:
            errors["maximum_stay_nights"] = "Maximum stay cannot be shorter than minimum stay."

        if self.advance_payment_required and self.advance_payment_percentage <= 0:
            errors["advance_payment_percentage"] = (
                "Enter an advance percentage when advance payment " "is required."
            )

        if not self.online_payment_enabled and not self.pay_at_property_allowed:
            errors["pay_at_property_allowed"] = "At least one payment option must be enabled."

        if bool(self.latitude) != bool(self.longitude):
            errors["latitude"] = "Latitude and longitude must be provided together."
            errors["longitude"] = "Latitude and longitude must be provided together."

        if self.reception_open_time and not self.reception_close_time:
            errors["reception_close_time"] = "Reception closing time is required."

        if self.reception_close_time and not self.reception_open_time:
            errors["reception_open_time"] = "Reception opening time is required."

        if errors:
            raise ValidationError(errors)

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.slug:
            base_slug = slugify(self.name) or "property"
            candidate = base_slug
            counter = 2

            while Property.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{counter}"
                counter += 1

            self.slug = candidate

        self.currency = self.currency.upper().strip()
        self.property_code = self.property_code.upper().strip()
        self.invoice_prefix = self.invoice_prefix.upper().strip()
        self.primary_phone = self._normalize_optional_phone(self.primary_phone)
        self.secondary_phone = self._normalize_optional_phone(self.secondary_phone)
        self.whatsapp_number = self._normalize_optional_phone(self.whatsapp_number)

        self.full_clean()
        super().save(*args, **kwargs)
        self.invalidate_cache()

    def delete(self, *args: Any, **kwargs: Any) -> tuple[int, dict[str, int]]:
        deleted = super().delete(*args, **kwargs)
        self.invalidate_cache()
        return deleted

    @staticmethod
    def _normalize_optional_phone(value: str) -> str:
        return normalize_phone_number(value) if value else ""

    def invalidate_cache(self) -> None:
        safe_cache_delete(PROPERTY_PUBLIC_CACHE_KEY)
        safe_cache_delete(f"{PROPERTY_ADMIN_CACHE_PREFIX}{self.pk}")
