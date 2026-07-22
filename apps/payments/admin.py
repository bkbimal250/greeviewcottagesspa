from django.contrib import admin

from apps.payments.models import Payment, PaymentOrder


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("booking", "amount", "method", "status", "provider", "paid_at", "created_at")
    list_filter = ("status", "method", "provider", "paid_at", "created_at")
    search_fields = (
        "booking__booking_id",
        "booking__guest_name",
        "booking__guest_phone",
        "transaction_id",
        "gateway_order_id",
        "gateway_payment_id",
    )
    readonly_fields = ("id", "created_at", "updated_at", "paid_at")


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "provider",
        "amount",
        "currency",
        "status",
        "razorpay_order_id",
        "created_at",
    )
    list_filter = ("provider", "status", "currency", "created_at")
    search_fields = (
        "booking__booking_id",
        "booking__guest_name",
        "booking__guest_phone",
        "receipt",
        "razorpay_order_id",
        "upi_vpa",
    )
    readonly_fields = ("id", "created_at", "updated_at", "paid_at")
