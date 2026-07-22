from django.contrib import admin

from apps.bookings.models import Booking, BookingSequence, BookingStatusHistory, CancellationRequest


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "booking_id",
        "guest_name",
        "guest_phone",
        "cottage",
        "check_in_date",
        "check_out_date",
        "booking_status",
        "payment_status",
        "grand_total",
        "created_at",
    )
    list_filter = ("booking_status", "payment_status", "source", "check_in_date", "created_at")
    search_fields = ("booking_id", "guest_name", "guest_phone", "guest_email", "cottage__name")
    autocomplete_fields = ("property", "cottage")
    date_hierarchy = "check_in_date"
    readonly_fields = (
        "id",
        "booking_id",
        "number_of_nights",
        "weekday_nights",
        "saturday_nights",
        "sunday_nights",
        "weekday_price",
        "saturday_price",
        "sunday_price",
        "room_amount",
        "subtotal",
        "tax_percentage",
        "tax_amount",
        "discount_amount",
        "grand_total",
        "balance_amount",
        "ip_address",
        "user_agent",
        "created_at",
        "updated_at",
    )


@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "previous_booking_status",
        "new_booking_status",
        "previous_payment_status",
        "new_payment_status",
        "changed_by",
        "created_at",
    )
    list_filter = ("new_booking_status", "new_payment_status", "created_at")
    search_fields = ("booking__booking_id", "note")
    autocomplete_fields = ("booking", "changed_by")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(CancellationRequest)
class CancellationRequestAdmin(admin.ModelAdmin):
    list_display = ("booking", "status", "requested_phone", "reviewed_by", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("booking__booking_id", "requested_phone", "reason")
    autocomplete_fields = ("booking", "reviewed_by")
    readonly_fields = ("id", "request_reference", "created_at", "updated_at")


@admin.register(BookingSequence)
class BookingSequenceAdmin(admin.ModelAdmin):
    list_display = ("year", "last_number", "updated_at")
    readonly_fields = ("updated_at",)
