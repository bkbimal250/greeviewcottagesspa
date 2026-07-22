from django.urls import path

from apps.payments.views import (
    AdminBookingPaymentCreateView,
    AdminPaymentDetailView,
    AdminPaymentListCreateView,
    RazorpayConfirmView,
    RazorpayOrderCreateView,
    UPIQRCodeCreateView,
)

app_name = "payments"

urlpatterns = [
    path("admin/payments/", AdminPaymentListCreateView.as_view(), name="admin-payment-list"),
    path(
        "admin/payments/<uuid:pk>/", AdminPaymentDetailView.as_view(), name="admin-payment-detail"
    ),
    path(
        "admin/bookings/<uuid:booking_pk>/payments/",
        AdminBookingPaymentCreateView.as_view(),
        name="admin-booking-payment-create",
    ),
    path(
        "payments/razorpay/orders/",
        RazorpayOrderCreateView.as_view(),
        name="razorpay-order-create",
    ),
    path(
        "payments/razorpay/confirm/",
        RazorpayConfirmView.as_view(),
        name="razorpay-confirm",
    ),
    path("payments/upi/qr/", UPIQRCodeCreateView.as_view(), name="upi-qr-create"),
]
