from __future__ import annotations

from django.core.exceptions import ValidationError

from apps.bookings.models import Booking, CancellationRequest
from apps.common.utils import normalize_phone_number


class CancellationService:
    @staticmethod
    def create_request(booking_id: str, guest_phone: str, reason: str) -> CancellationRequest:
        phone = normalize_phone_number(guest_phone)
        booking = Booking.objects.filter(booking_id=booking_id, guest_phone=phone).first()
        if booking is None:
            raise ValidationError({"booking_id": "Booking was not found for the provided phone."})
        if CancellationRequest.objects.filter(
            booking=booking, status=CancellationRequest.Status.PENDING
        ).exists():
            raise ValidationError({"booking_id": "A pending cancellation request already exists."})
        return CancellationRequest.objects.create(
            booking=booking, requested_phone=phone, reason=reason
        )
