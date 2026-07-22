from django.contrib import admin
from django.db import models
from django.db.models import QuerySet
from django.forms import Textarea

from apps.cottages.models import Cottage
from apps.properties.models import Property


JSON_TEXTAREA = Textarea(
    attrs={
        "rows": 6,
        "style": "font-family: monospace; min-height: 120px;",
    },
)


class CottageInline(admin.TabularInline):
    model = Cottage
    fields = (
        "name",
        "cottage_code",
        "status",
        "base_price",
        "saturday_price",
        "sunday_price",
        "maximum_guests",
        "is_featured",
        "sort_order",
    )
    extra = 0
    show_change_link = True


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "property_code",
        "city",
        "state",
        "status",
        "booking_enabled",
        "online_payment_enabled",
        "updated_at",
    )
    list_display_links = ("name", "property_code")
    list_editable = (
        "status",
        "booking_enabled",
        "online_payment_enabled",
    )
    list_filter = (
        "status",
        "booking_enabled",
        "online_payment_enabled",
        "pay_at_property_allowed",
        "property_type",
        "city",
        "state",
    )
    search_fields = (
        "name",
        "property_code",
        "city",
        "state",
        "primary_phone",
        "whatsapp_number",
        "email",
        "reservation_email",
    )
    prepopulated_fields = {"slug": ("name",)}
    list_per_page = 25
    save_on_top = True
    actions = (
        "mark_active",
        "mark_inactive",
        "enable_booking",
        "disable_booking",
    )
    inlines = (CottageInline,)
    readonly_fields = (
        "id",
        "full_address",
        "public_email",
        "public_phone",
        "created_at",
        "updated_at",
    )
    formfield_overrides = {
        models.JSONField: {"widget": JSON_TEXTAREA},
    }

    fieldsets = (
        (
            "Basic information",
            {
                "fields": (
                    "id",
                    "name",
                    "slug",
                    "property_code",
                    "property_type",
                    "tagline",
                    "short_description",
                    "description",
                    "status",
                    "admin_notes",
                )
            },
        ),
        (
            "Address",
            {
                "fields": (
                    "address_line_1",
                    "address_line_2",
                    "locality",
                    "landmark",
                    "city",
                    "district",
                    "state",
                    "country",
                    "pincode",
                    "full_address",
                    "google_plus_code",
                    "latitude",
                    "longitude",
                    "google_maps_url",
                )
            },
        ),
        (
            "Contact",
            {
                "fields": (
                    "primary_phone",
                    "secondary_phone",
                    "whatsapp_number",
                    "email",
                    "reservation_email",
                    "public_email",
                    "public_phone",
                    "website_url",
                    "instagram_url",
                    "facebook_url",
                )
            },
        ),
        (
            "Timings",
            {
                "fields": (
                    "check_in_time",
                    "check_out_time",
                    "reception_open_time",
                    "reception_close_time",
                    "quiet_hours_start",
                    "quiet_hours_end",
                )
            },
        ),
        (
            "Images",
            {
                "description": (
                    "Upload main images directly. For gallery JSON fields, enter a JSON list "
                    'of image URLs, for example: ["/media/properties/gallery/photo.jpg"].'
                ),
                "fields": (
                    "logo",
                    "thumbnail",
                    "cover_image",
                    "exterior_images",
                    "reception_images",
                    "garden_images",
                    "common_area_images",
                    "gallery_images",
                )
            },
        ),
        (
            "Facilities and places",
            {
                "description": (
                    "Facilities and house rules must be JSON lists of strings. Nearby places "
                    "must be a JSON list of objects with name, category, distance, "
                    "travel_time and maps_url."
                ),
                "fields": ("facilities", "nearby_places", "house_rules"),
            },
        ),
        (
            "Policies",
            {
                "fields": (
                    "cancellation_policy",
                    "refund_policy",
                    "child_policy",
                    "pet_policy",
                    "extra_guest_policy",
                    "damage_policy",
                    "early_check_in_policy",
                    "late_check_out_policy",
                )
            },
        ),
        (
            "Guest rules",
            {
                "fields": (
                    "minimum_check_in_age",
                    "id_proof_required",
                    "local_id_allowed",
                    "unmarried_couples_allowed",
                    "visitors_allowed",
                    "pets_allowed",
                    "smoking_allowed",
                    "alcohol_allowed",
                    "outside_food_allowed",
                    "children_allowed",
                    "children_free_below_age",
                )
            },
        ),
        (
            "Booking",
            {
                "fields": (
                    "booking_enabled",
                    "same_day_booking_allowed",
                    "minimum_stay_nights",
                    "maximum_stay_nights",
                    "maximum_advance_booking_days",
                    "minimum_advance_booking_hours",
                    "pay_at_property_allowed",
                    "online_payment_enabled",
                    "currency",
                    "default_tax_percentage",
                    "tax_included_in_price",
                    "advance_payment_required",
                    "advance_payment_percentage",
                )
            },
        ),
        (
            "Business and invoice",
            {
                "fields": (
                    "legal_business_name",
                    "gst_number",
                    "pan_number",
                    "billing_address",
                    "invoice_prefix",
                )
            },
        ),
        (
            "SEO",
            {"fields": ("seo_title", "seo_description", "seo_keywords", "canonical_url")},
        ),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    @admin.action(description="Mark selected properties active")
    def mark_active(self, request, queryset: QuerySet[Property]) -> None:
        updated = queryset.update(status=Property.Status.ACTIVE)
        for property_obj in queryset:
            property_obj.invalidate_cache()
        self.message_user(request, f"{updated} property record(s) marked active.")

    @admin.action(description="Mark selected properties inactive")
    def mark_inactive(self, request, queryset: QuerySet[Property]) -> None:
        updated = queryset.update(status=Property.Status.INACTIVE)
        for property_obj in queryset:
            property_obj.invalidate_cache()
        self.message_user(request, f"{updated} property record(s) marked inactive.")

    @admin.action(description="Enable booking for selected properties")
    def enable_booking(self, request, queryset: QuerySet[Property]) -> None:
        updated = queryset.update(booking_enabled=True)
        for property_obj in queryset:
            property_obj.invalidate_cache()
        self.message_user(request, f"Booking enabled for {updated} property record(s).")

    @admin.action(description="Disable booking for selected properties")
    def disable_booking(self, request, queryset: QuerySet[Property]) -> None:
        updated = queryset.update(booking_enabled=False)
        for property_obj in queryset:
            property_obj.invalidate_cache()
        self.message_user(request, f"Booking disabled for {updated} property record(s).")
