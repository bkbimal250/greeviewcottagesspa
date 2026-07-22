from __future__ import annotations

from datetime import date

from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone

from apps.bookings.models import Booking
from apps.cottages.models import Cottage, CottageBlock
from apps.properties.models import Property


class BookingAvailabilityService:
    @staticmethod
    def validate_dates(cottage: Cottage, check_in_date: date, check_out_date: date) -> int:
        today = timezone.localdate()
        if check_in_date < today:
            raise ValidationError({"check_in_date": "Check-in cannot be in the past."})
        if check_out_date <= check_in_date:
            raise ValidationError({"check_out_date": "Check-out date must be after check-in date."})

        nights = (check_out_date - check_in_date).days
        prop = cottage.property
        if nights < prop.minimum_stay_nights or nights < cottage.minimum_nights:
            raise ValidationError({"check_out_date": "Minimum stay requirement is not met."})
        if nights > prop.maximum_stay_nights:
            raise ValidationError({"check_out_date": "Maximum stay requirement is exceeded."})
        if (check_in_date - today).days > prop.maximum_advance_booking_days:
            raise ValidationError({"check_in_date": "Selected date is too far in advance."})
        if check_in_date == today and not prop.same_day_booking_allowed:
            raise ValidationError({"check_in_date": "Same-day booking is not allowed."})
        return nights

    @staticmethod
    def validate_bookable_cottage(cottage: Cottage) -> None:
        if cottage.status != Cottage.Status.ACTIVE:
            raise ValidationError({"cottage_id": "The selected cottage is not active."})
        if (
            cottage.property.status != Property.Status.ACTIVE
            or not cottage.property.booking_enabled
        ):
            raise ValidationError(
                {"cottage_id": "The property is not currently accepting bookings."}
            )

    @staticmethod
    def validate_capacity(cottage: Cottage, adults: int, children: int) -> None:
        if adults < 1:
            raise ValidationError({"adults": "At least one adult is required."})
        if adults > cottage.maximum_adults:
            raise ValidationError({"adults": "Adult count exceeds cottage capacity."})
        if children > cottage.maximum_children:
            raise ValidationError({"children": "Children count exceeds cottage capacity."})
        if adults + children > cottage.maximum_guests:
            raise ValidationError({"adults": "Total guests exceed cottage capacity."})

    @staticmethod
    def has_block(cottage: Cottage, check_in_date: date, check_out_date: date) -> bool:
        return CottageBlock.objects.filter(
            cottage=cottage,
            start_date__lt=check_out_date,
            end_date__gt=check_in_date,
        ).exists()

    @staticmethod
    def overlapping_bookings(cottage: Cottage, check_in_date: date, check_out_date: date):
        return Booking.objects.filter(
            cottage=cottage,
            check_in_date__lt=check_out_date,
            check_out_date__gt=check_in_date,
        ).filter(
            Q(booking_status__in=[Booking.Status.CONFIRMED, Booking.Status.CHECKED_IN])
            | Q(booking_status=Booking.Status.PENDING, hold_expires_at__gt=timezone.now())
        )

    @classmethod
    def ensure_available(cls, cottage: Cottage, check_in_date: date, check_out_date: date) -> None:
        if cls.has_block(cottage, check_in_date, check_out_date):
            raise ValidationError(
                {"cottage_id": "The selected cottage is blocked for these dates."}
            )
        if cls.overlapping_bookings(cottage, check_in_date, check_out_date).exists():
            raise ValidationError({"cottage_id": "The selected cottage is already booked."})

    @classmethod
    def validate_request(
        cls,
        cottage: Cottage,
        check_in_date: date,
        check_out_date: date,
        adults: int,
        children: int,
    ) -> None:
        cls.validate_bookable_cottage(cottage)
        cls.validate_dates(cottage, check_in_date, check_out_date)
        cls.validate_capacity(cottage, adults, children)
        cls.ensure_available(cottage, check_in_date, check_out_date)
