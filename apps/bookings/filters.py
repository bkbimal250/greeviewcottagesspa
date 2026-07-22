import django_filters

from apps.bookings.models import Booking


class BookingFilter(django_filters.FilterSet):
    created_at_from = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_at_to = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")
    check_in_from = django_filters.DateFilter(field_name="check_in_date", lookup_expr="gte")
    check_out_to = django_filters.DateFilter(field_name="check_out_date", lookup_expr="lte")

    class Meta:
        model = Booking
        fields = (
            "booking_id",
            "guest_name",
            "guest_phone",
            "cottage",
            "booking_status",
            "payment_status",
            "source",
            "created_at_from",
            "created_at_to",
            "check_in_from",
            "check_out_to",
        )
