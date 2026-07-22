from django.contrib import admin
from django.db import models
from django.db.models import QuerySet
from django.forms import Textarea

from apps.cottages.models import Cottage, CottageAvailabilityHold, CottageBlock


JSON_TEXTAREA = Textarea(
    attrs={
        "rows": 6,
        "style": "font-family: monospace; min-height: 120px;",
    },
)


@admin.register(Cottage)
class CottageAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "cottage_code",
        "property",
        "status",
        "base_price",
        "saturday_price",
        "sunday_price",
        "maximum_guests",
        "is_featured",
        "sort_order",
        "updated_at",
    )
    list_display_links = ("name", "cottage_code")
    list_editable = (
        "status",
        "base_price",
        "saturday_price",
        "sunday_price",
        "maximum_guests",
        "is_featured",
        "sort_order",
    )
    list_filter = (
        "status",
        "is_featured",
        "property",
        "room_type",
        "bed_type",
        "extra_bed_available",
    )
    search_fields = (
        "name",
        "slug",
        "cottage_code",
        "room_type",
        "bed_type",
        "property__name",
    )
    prepopulated_fields = {"slug": ("name",)}
    autocomplete_fields = ("property",)
    list_select_related = ("property",)
    list_per_page = 30
    save_on_top = True
    readonly_fields = ("id", "created_at", "updated_at")
    actions = (
        "mark_active",
        "mark_inactive",
        "mark_maintenance",
        "mark_featured",
        "remove_featured",
    )
    formfield_overrides = {
        models.JSONField: {"widget": JSON_TEXTAREA},
    }
    fieldsets = (
        (
            "Basic cottage details",
            {
                "fields": (
                    "id",
                    "property",
                    "name",
                    "slug",
                    "cottage_code",
                    "status",
                    "is_featured",
                    "sort_order",
                    "admin_notes",
                )
            },
        ),
        (
            "Descriptions",
            {
                "fields": (
                    "room_type",
                    "bed_type",
                    "short_description",
                    "description",
                    "location_note",
                    "view_type",
                )
            },
        ),
        (
            "Capacity",
            {
                "fields": (
                    "number_of_beds",
                    "number_of_bathrooms",
                    "maximum_guests",
                    "maximum_adults",
                    "maximum_children",
                    "extra_bed_available",
                    "minimum_nights",
                )
            },
        ),
        (
            "Pricing",
            {
                "description": (
                    "Base price is used for Monday to Friday. Saturday and Sunday "
                    "prices are used automatically by the booking pricing service."
                ),
                "fields": (
                    "base_price",
                    "saturday_price",
                    "sunday_price",
                    "extra_adult_price",
                    "extra_child_price",
                    "tax_percentage",
                ),
            },
        ),
        (
            "Images",
            {
                "description": (
                    "Upload thumbnail and cover directly. Image collection fields "
                    "must be JSON lists of image URLs."
                ),
                "fields": (
                    "thumbnail",
                    "cover_image",
                    "bed_images",
                    "bathroom_images",
                    "interior_images",
                    "exterior_images",
                    "gallery_images",
                ),
            },
        ),
        (
            "Amenities",
            {
                "description": 'Enter amenities as a JSON list, for example: ["Wi-Fi", "Parking"].',
                "fields": ("amenities",),
            },
        ),
        ("System", {"fields": ("created_at", "updated_at")}),
    )

    @admin.action(description="Mark selected cottages active")
    def mark_active(self, request, queryset: QuerySet[Cottage]) -> None:
        updated = queryset.update(status=Cottage.Status.ACTIVE)
        for cottage in queryset:
            cottage.invalidate_cache()
        self.message_user(request, f"{updated} cottage record(s) marked active.")

    @admin.action(description="Mark selected cottages inactive")
    def mark_inactive(self, request, queryset: QuerySet[Cottage]) -> None:
        updated = queryset.update(status=Cottage.Status.INACTIVE)
        for cottage in queryset:
            cottage.invalidate_cache()
        self.message_user(request, f"{updated} cottage record(s) marked inactive.")

    @admin.action(description="Mark selected cottages under maintenance")
    def mark_maintenance(self, request, queryset: QuerySet[Cottage]) -> None:
        updated = queryset.update(status=Cottage.Status.MAINTENANCE)
        for cottage in queryset:
            cottage.invalidate_cache()
        self.message_user(request, f"{updated} cottage record(s) moved to maintenance.")

    @admin.action(description="Feature selected cottages")
    def mark_featured(self, request, queryset: QuerySet[Cottage]) -> None:
        updated = queryset.update(is_featured=True)
        for cottage in queryset:
            cottage.invalidate_cache()
        self.message_user(request, f"{updated} cottage record(s) marked featured.")

    @admin.action(description="Remove selected cottages from featured")
    def remove_featured(self, request, queryset: QuerySet[Cottage]) -> None:
        updated = queryset.update(is_featured=False)
        for cottage in queryset:
            cottage.invalidate_cache()
        self.message_user(request, f"{updated} cottage record(s) removed from featured.")


@admin.register(CottageBlock)
class CottageBlockAdmin(admin.ModelAdmin):
    list_display = (
        "cottage",
        "start_date",
        "end_date",
        "block_type",
        "created_by",
        "created_at",
    )
    list_filter = ("block_type", "start_date", "end_date", "cottage__property")
    search_fields = ("cottage__name", "cottage__cottage_code", "reason")
    autocomplete_fields = ("cottage", "created_by")
    date_hierarchy = "start_date"
    readonly_fields = ("id", "created_at", "updated_at")

    def save_model(self, request, obj, form, change) -> None:
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CottageAvailabilityHold)
class CottageAvailabilityHoldAdmin(admin.ModelAdmin):
    list_display = (
        "cottage",
        "check_in_date",
        "check_out_date",
        "status",
        "expires_at",
        "guest_phone",
        "guest_email",
    )
    list_filter = ("status", "expires_at", "check_in_date", "cottage__property")
    search_fields = ("cottage__name", "cottage__cottage_code", "guest_phone", "guest_email")
    autocomplete_fields = ("cottage",)
    date_hierarchy = "check_in_date"
    readonly_fields = ("id", "created_at", "updated_at")
