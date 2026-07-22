from django.urls import path

from apps.bookings.views import (
    AdminBookingDetailView,
    AdminBookingListView,
    BookingLookupView,
    BookingLookupOTPRequestView,
    BookingLookupOTPVerifyView,
    BookingLookupTokenView,
    BookingQuoteView,
    CancelBookingView,
    CancellationRequestCreateView,
    CheckInBookingView,
    CheckOutBookingView,
    ConfirmBookingView,
    GuestBookingCreateView,
    MarkPaymentView,
    ResendNotificationView,
)

app_name = "bookings"

urlpatterns = [
    path("bookings/quote/", BookingQuoteView.as_view(), name="booking-quote"),
    path("bookings/", GuestBookingCreateView.as_view(), name="guest-booking-create"),
    path("bookings/lookup/", BookingLookupView.as_view(), name="booking-lookup"),
    path(
        "bookings/lookup/request-otp/",
        BookingLookupOTPRequestView.as_view(),
        name="booking-lookup-request-otp",
    ),
    path(
        "bookings/lookup/verify-otp/",
        BookingLookupOTPVerifyView.as_view(),
        name="booking-lookup-verify-otp",
    ),
    path(
        "bookings/lookup/details/",
        BookingLookupTokenView.as_view(),
        name="booking-lookup-details",
    ),
    path(
        "bookings/cancel-request/",
        CancellationRequestCreateView.as_view(),
        name="booking-cancel-request",
    ),
    path("admin/bookings/", AdminBookingListView.as_view(), name="admin-booking-list"),
    path(
        "admin/bookings/<uuid:pk>/", AdminBookingDetailView.as_view(), name="admin-booking-detail"
    ),
    path(
        "admin/bookings/<uuid:pk>/confirm/",
        ConfirmBookingView.as_view(),
        name="admin-booking-confirm",
    ),
    path(
        "admin/bookings/<uuid:pk>/cancel/", CancelBookingView.as_view(), name="admin-booking-cancel"
    ),
    path(
        "admin/bookings/<uuid:pk>/check-in/",
        CheckInBookingView.as_view(),
        name="admin-booking-check-in",
    ),
    path(
        "admin/bookings/<uuid:pk>/check-out/",
        CheckOutBookingView.as_view(),
        name="admin-booking-check-out",
    ),
    path(
        "admin/bookings/<uuid:pk>/mark-payment/",
        MarkPaymentView.as_view(),
        name="admin-booking-mark-payment",
    ),
    path(
        "admin/bookings/<uuid:pk>/resend-notification/",
        ResendNotificationView.as_view(),
        name="admin-booking-resend-notification",
    ),
]
