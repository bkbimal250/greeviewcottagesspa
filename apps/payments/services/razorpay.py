from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
from datetime import timedelta
from decimal import Decimal
from urllib import request

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.db import transaction
from django.utils import timezone

from apps.bookings.models import Booking
from apps.payments.models import Payment, PaymentOrder
from apps.payments.services.payments import PaymentService

logger = logging.getLogger(__name__)


class RazorpayService:
    api_base_url = "https://api.razorpay.com/v1"

    @classmethod
    def create_order(cls, *, booking: Booking, amount: Decimal) -> PaymentOrder:
        cls.ensure_configured()
        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than zero."})
        if amount > booking.balance_amount:
            raise ValidationError({"amount": "Amount cannot be greater than booking balance."})

        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)
            cls.validate_booking_can_pay(booking)
            if amount > booking.balance_amount:
                raise ValidationError({"amount": "Amount cannot be greater than booking balance."})
            receipt = cls.receipt_for_booking(booking)
            payload = {
                "amount": cls.to_paise(amount),
                "currency": "INR",
                "receipt": receipt,
                "payment_capture": 1 if settings.RAZORPAY_AUTO_CAPTURE else 0,
                "notes": {
                    "booking_uuid": str(booking.id),
                    "booking_id": booking.booking_id,
                    "guest_name": booking.guest_name,
                    "guest_phone": booking.guest_phone,
                },
            }
            response = cls.post("/orders", payload)
            return PaymentOrder.objects.create(
                booking=booking,
                provider=PaymentOrder.Provider.RAZORPAY,
                amount=amount,
                receipt=receipt,
                razorpay_order_id=response["id"],
                status=cls.map_order_status(response.get("status", "created")),
                provider_payload=response,
                notes=payload["notes"],
                expires_at=timezone.now()
                + timedelta(minutes=settings.RAZORPAY_ORDER_EXPIRY_MINUTES),
            )

    @classmethod
    def confirm_payment(
        cls,
        *,
        booking: Booking,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> Payment:
        cls.ensure_configured()
        if not cls.verify_payment_signature(
            order_id=razorpay_order_id,
            payment_id=razorpay_payment_id,
            signature=razorpay_signature,
        ):
            raise ValidationError({"razorpay_signature": "Invalid Razorpay payment signature."})

        with transaction.atomic():
            order = PaymentOrder.objects.select_for_update().get(
                booking=booking,
                razorpay_order_id=razorpay_order_id,
                provider=PaymentOrder.Provider.RAZORPAY,
            )
            cls.validate_order_can_be_confirmed(order)
            existing_payment = Payment.objects.filter(
                gateway_payment_id=razorpay_payment_id,
                provider=Payment.Provider.RAZORPAY,
            ).first()
            if existing_payment:
                return existing_payment
            if order.status == PaymentOrder.Status.PAID:
                payment = Payment.objects.get(
                    gateway_order_id=razorpay_order_id,
                    provider=Payment.Provider.RAZORPAY,
                )
                return payment

            payment = PaymentService.record_payment(
                booking=booking,
                amount=order.amount,
                method=Booking.PaymentMethod.ONLINE_GATEWAY,
                provider=Payment.Provider.RAZORPAY,
                transaction_id=razorpay_payment_id,
                gateway_order_id=razorpay_order_id,
                gateway_payment_id=razorpay_payment_id,
                gateway_signature=razorpay_signature,
                notes="Verified Razorpay payment.",
            )
            order.status = PaymentOrder.Status.PAID
            order.paid_at = timezone.now()
            order.save(update_fields=["status", "paid_at", "updated_at"])
            return payment

    @classmethod
    def post(cls, path: str, payload: dict) -> dict:
        data = json.dumps(payload).encode("utf-8")
        http_request = request.Request(
            f"{cls.api_base_url}{path}",
            data=data,
            headers={
                "Authorization": f"Basic {cls.basic_auth_token()}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with request.urlopen(http_request, timeout=15) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as exc:
            logger.exception("Razorpay request failed for path %s", path)
            raise ValidationError(
                {"razorpay": "Unable to start online payment. Please try again."}
            ) from exc

    @staticmethod
    def verify_payment_signature(*, order_id: str, payment_id: str, signature: str) -> bool:
        payload = f"{order_id}|{payment_id}".encode()
        return RazorpayService.verify_signature(payload, signature, settings.RAZORPAY_KEY_SECRET)

    @staticmethod
    def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
        expected = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

    @staticmethod
    def to_paise(amount: Decimal) -> int:
        return int((amount * Decimal("100")).quantize(Decimal("1")))

    @staticmethod
    def basic_auth_token() -> str:
        credentials = f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}"
        return base64.b64encode(credentials.encode("utf-8")).decode("ascii")

    @staticmethod
    def ensure_configured() -> None:
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            raise ImproperlyConfigured("Razorpay key id and key secret are not configured.")

    @staticmethod
    def validate_booking_can_pay(booking: Booking) -> None:
        if booking.booking_status in {
            Booking.Status.CANCELLED,
            Booking.Status.CHECKED_OUT,
            Booking.Status.COMPLETED,
            Booking.Status.NO_SHOW,
        }:
            raise ValidationError({"booking": "This booking cannot accept online payments."})
        if booking.balance_amount <= 0:
            raise ValidationError({"booking": "This booking has no pending balance."})

    @staticmethod
    def validate_order_can_be_confirmed(order: PaymentOrder) -> None:
        if order.status in {
            PaymentOrder.Status.CANCELLED,
            PaymentOrder.Status.EXPIRED,
            PaymentOrder.Status.FAILED,
        }:
            raise ValidationError({"razorpay_order_id": "This payment order is not payable."})
        if order.expires_at and order.expires_at <= timezone.now():
            order.status = PaymentOrder.Status.EXPIRED
            order.save(update_fields=["status", "updated_at"])
            raise ValidationError({"razorpay_order_id": "This payment order has expired."})

    @staticmethod
    def receipt_for_booking(booking: Booking) -> str:
        return f"{booking.booking_id[:25]}-RZP"

    @staticmethod
    def map_order_status(status_value: str) -> str:
        return {
            "created": PaymentOrder.Status.CREATED,
            "attempted": PaymentOrder.Status.ATTEMPTED,
            "paid": PaymentOrder.Status.PAID,
        }.get(status_value, PaymentOrder.Status.CREATED)
