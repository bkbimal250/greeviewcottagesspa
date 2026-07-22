from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from django.apps import apps
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from django.utils import timezone

from apps.cottages.models import Cottage, CottageAvailabilityHold, CottageBlock


class AvailabilityService:
    blocking_booking_statuses = {"pending", "confirmed", "checked_in"}

    @staticmethod
    def validate_date_range(check_in: date, check_out: date) -> int:
        if check_in < timezone.localdate():
            raise ValidationError("Check-in cannot be in the past.")
        if check_out <= check_in:
            raise ValidationError("Check-out must be after check-in.")
        return (check_out - check_in).days

    @staticmethod
    def validate_guest_capacity(cottage: Cottage, adults: int, children: int) -> None:
        if adults < 1:
            raise ValidationError("At least one adult is required.")
        if adults > cottage.maximum_adults:
            raise ValidationError("Adult count exceeds cottage capacity.")
        if children > cottage.maximum_children:
            raise ValidationError("Children count exceeds cottage capacity.")
        if adults + children > cottage.maximum_guests:
            raise ValidationError("Guest count exceeds cottage capacity.")

    @staticmethod
    def get_overlapping_blocks(cottage: Cottage, check_in: date, check_out: date) -> QuerySet:
        return CottageBlock.objects.filter(
            cottage=cottage,
            start_date__lt=check_out,
            end_date__gt=check_in,
        )

    @staticmethod
    def get_overlapping_holds(cottage: Cottage, check_in: date, check_out: date) -> QuerySet:
        return CottageAvailabilityHold.objects.filter(
            cottage=cottage,
            status=CottageAvailabilityHold.Status.ACTIVE,
            expires_at__gt=timezone.now(),
            check_in_date__lt=check_out,
            check_out_date__gt=check_in,
        )

    @classmethod
    def get_overlapping_bookings(
        cls, cottage: Cottage, check_in: date, check_out: date
    ) -> QuerySet | None:
        try:
            Booking = apps.get_model("bookings", "Booking")
        except LookupError:
            return None

        if not hasattr(Booking, "objects"):
            return None

        return Booking.objects.filter(
            cottage=cottage,
            booking_status__in=cls.blocking_booking_statuses,
            check_in_date__lt=check_out,
            check_out_date__gt=check_in,
        )

    @classmethod
    def is_cottage_available(cls, cottage: Cottage, check_in: date, check_out: date) -> bool:
        if cottage.status != Cottage.Status.ACTIVE:
            return False
        if cls.get_overlapping_blocks(cottage, check_in, check_out).exists():
            return False
        if cls.get_overlapping_holds(cottage, check_in, check_out).exists():
            return False
        bookings = cls.get_overlapping_bookings(cottage, check_in, check_out)
        return False if bookings is not None and bookings.exists() else True

    @classmethod
    def get_unavailable_cottage_ids(cls, check_in: date, check_out: date) -> set:
        blocked_ids = set(
            CottageBlock.objects.filter(
                start_date__lt=check_out,
                end_date__gt=check_in,
            ).values_list("cottage_id", flat=True)
        )
        held_ids = set(
            CottageAvailabilityHold.objects.filter(
                status=CottageAvailabilityHold.Status.ACTIVE,
                expires_at__gt=timezone.now(),
                check_in_date__lt=check_out,
                check_out_date__gt=check_in,
            ).values_list("cottage_id", flat=True)
        )
        booking_ids: set = set()
        try:
            Booking = apps.get_model("bookings", "Booking")
            booking_ids = set(
                Booking.objects.filter(
                    booking_status__in=cls.blocking_booking_statuses,
                    check_in_date__lt=check_out,
                    check_out_date__gt=check_in,
                ).values_list("cottage_id", flat=True)
            )
        except (LookupError, AttributeError):
            booking_ids = set()

        return blocked_ids | held_ids | booking_ids

    @classmethod
    def calculate_booking_price(
        cls,
        cottage: Cottage,
        check_in: date,
        check_out: date,
        adults: int,
        children: int,
    ) -> dict:
        total_nights = cls.validate_date_range(check_in, check_out)
        cls.validate_guest_capacity(cottage, adults, children)

        room_amount = Decimal("0.00")
        saturday_nights = 0
        sunday_nights = 0
        weekday_nights = 0
        nightly_prices = []

        current = check_in
        while current < check_out:
            price = cottage.get_price_for_date(current)
            room_amount += price
            if current.weekday() == 5:
                saturday_nights += 1
            elif current.weekday() == 6:
                sunday_nights += 1
            else:
                weekday_nights += 1
            nightly_prices.append({"date": current.isoformat(), "price": price})
            current += timedelta(days=1)

        tax_amount = (room_amount * cottage.tax_percentage / Decimal("100")).quantize(
            Decimal("0.01")
        )
        total_amount = room_amount + tax_amount

        return {
            "price_per_night": cottage.base_price,
            "total_nights": total_nights,
            "weekday_nights": weekday_nights,
            "saturday_nights": saturday_nights,
            "sunday_nights": sunday_nights,
            "nightly_prices": nightly_prices,
            "subtotal": room_amount,
            "tax_percentage": cottage.tax_percentage,
            "tax": tax_amount,
            "total_amount": total_amount,
            "availability_status": "available",
        }

    @classmethod
    def get_available_cottages(
        cls,
        check_in: date,
        check_out: date,
        adults: int,
        children: int,
    ) -> list[dict]:
        cls.validate_date_range(check_in, check_out)
        unavailable_ids = cls.get_unavailable_cottage_ids(check_in, check_out)
        cottages = (
            Cottage.objects.bookable()
            .select_related("property")
            .exclude(id__in=unavailable_ids)
            .order_by("sort_order", "base_price", "name")
        )

        results = []
        for cottage in cottages:
            try:
                cls.validate_guest_capacity(cottage, adults, children)
            except ValidationError:
                continue
            price = cls.calculate_booking_price(cottage, check_in, check_out, adults, children)
            results.append({"cottage": cottage, "pricing": price})
        return results

    @classmethod
    def create_24_hour_hold(
        cls,
        cottage: Cottage,
        check_in: date,
        check_out: date,
        adults: int,
        children: int,
        guest_phone: str = "",
        guest_email: str = "",
    ) -> CottageAvailabilityHold:
        cls.validate_date_range(check_in, check_out)
        cls.validate_guest_capacity(cottage, adults, children)
        if not cls.is_cottage_available(cottage, check_in, check_out):
            raise ValidationError("Cottage is not available for the selected dates.")
        return CottageAvailabilityHold.objects.create(
            cottage=cottage,
            check_in_date=check_in,
            check_out_date=check_out,
            guest_phone=guest_phone,
            guest_email=guest_email,
        )
