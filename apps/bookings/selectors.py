from apps.bookings.models import Booking


class BookingSelector:
    @staticmethod
    def admin_list():
        return Booking.objects.select_related("property", "cottage").only(
            "id",
            "booking_id",
            "property__name",
            "cottage__name",
            "guest_name",
            "guest_phone",
            "check_in_date",
            "check_out_date",
            "booking_status",
            "payment_status",
            "grand_total",
            "amount_paid",
            "balance_amount",
            "source",
            "created_at",
        )

    @staticmethod
    def detail():
        return Booking.objects.select_related("property", "cottage")

    @staticmethod
    def public_lookup(booking_id: str, guest_phone: str):
        return Booking.objects.select_related("property", "cottage").filter(
            booking_id=booking_id,
            guest_phone=guest_phone,
        )
