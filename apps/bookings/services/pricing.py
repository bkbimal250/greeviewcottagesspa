from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from apps.cottages.models import Cottage


class BookingPricingService:
    @staticmethod
    def calculate(
        cottage: Cottage,
        check_in_date: date,
        check_out_date: date,
        discount_amount: Decimal = Decimal("0.00"),
    ) -> dict:
        number_of_nights = (check_out_date - check_in_date).days
        weekday_nights = 0
        saturday_nights = 0
        sunday_nights = 0
        room_amount = Decimal("0.00")
        current = check_in_date

        while current < check_out_date:
            price = cottage.get_price_for_date(current)
            room_amount += price
            if current.weekday() == 5:
                saturday_nights += 1
            elif current.weekday() == 6:
                sunday_nights += 1
            else:
                weekday_nights += 1
            current += timedelta(days=1)

        subtotal = room_amount
        tax_amount = (subtotal * cottage.tax_percentage / Decimal("100")).quantize(Decimal("0.01"))
        grand_total = max(subtotal + tax_amount - discount_amount, Decimal("0.00"))

        return {
            "number_of_nights": number_of_nights,
            "weekday_nights": weekday_nights,
            "saturday_nights": saturday_nights,
            "sunday_nights": sunday_nights,
            "weekday_price": cottage.base_price,
            "saturday_price": cottage.saturday_price,
            "sunday_price": cottage.sunday_price,
            "room_amount": room_amount,
            "subtotal": subtotal,
            "tax_percentage": cottage.tax_percentage,
            "tax_amount": tax_amount,
            "discount_amount": discount_amount,
            "grand_total": grand_total,
        }
