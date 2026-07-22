from __future__ import annotations

import base64
from datetime import timedelta
from decimal import Decimal
from io import BytesIO
from urllib.parse import urlencode

import qrcode
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import transaction
from django.utils import timezone

from apps.bookings.models import Booking
from apps.payments.models import PaymentOrder
from apps.payments.services.razorpay import RazorpayService


class UPIService:
    @classmethod
    def create_qr_order(cls, *, booking: Booking, amount: Decimal) -> PaymentOrder:
        if not settings.UPI_PAYEE_VPA:
            raise ImproperlyConfigured("UPI_PAYEE_VPA is not configured.")
        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than zero."})
        if amount > booking.balance_amount:
            raise ValidationError({"amount": "Amount cannot be greater than booking balance."})

        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)
            RazorpayService.validate_booking_can_pay(booking)
            if amount > booking.balance_amount:
                raise ValidationError({"amount": "Amount cannot be greater than booking balance."})
            intent_url = cls.build_intent_url(
                booking=booking,
                amount=amount,
                vpa=settings.UPI_PAYEE_VPA,
                payee_name=settings.UPI_PAYEE_NAME,
            )
            return PaymentOrder.objects.create(
                booking=booking,
                provider=PaymentOrder.Provider.UPI_QR,
                amount=amount,
                receipt=cls.receipt_for_booking(booking),
                upi_vpa=settings.UPI_PAYEE_VPA,
                upi_intent_url=intent_url,
                qr_code_data_uri=cls.qr_data_uri(intent_url),
                expires_at=timezone.now() + timedelta(minutes=30),
                notes={"booking_id": booking.booking_id},
            )

    @staticmethod
    def build_intent_url(*, booking: Booking, amount: Decimal, vpa: str, payee_name: str) -> str:
        query = urlencode(
            {
                "pa": vpa,
                "pn": payee_name,
                "am": f"{amount:.2f}",
                "cu": "INR",
                "tn": f"Booking {booking.booking_id}",
                "tr": booking.booking_id,
            }
        )
        return f"upi://pay?{query}"

    @staticmethod
    def qr_data_uri(value: str) -> str:
        image = qrcode.make(value)
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/png;base64,{encoded}"

    @staticmethod
    def receipt_for_booking(booking: Booking) -> str:
        return f"{booking.booking_id[:25]}-UPI"
