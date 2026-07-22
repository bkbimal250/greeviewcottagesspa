from __future__ import annotations

from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from apps.bookings.models import Booking
from apps.bookings.services.booking import BookingService
from apps.common.realtime import broadcast_realtime_event
from apps.payments.models import Payment


class PaymentService:
    @classmethod
    def record_payment(
        cls,
        *,
        booking: Booking,
        amount: Decimal,
        method: str,
        status: str = Payment.Status.SUCCESSFUL,
        provider: str = Payment.Provider.MANUAL,
        transaction_id: str = "",
        gateway_order_id: str = "",
        gateway_payment_id: str = "",
        gateway_signature: str = "",
        notes: str = "",
        changed_by=None,
    ) -> Payment:
        with transaction.atomic():
            booking = Booking.objects.select_for_update().get(pk=booking.pk)
            if status == Payment.Status.SUCCESSFUL and amount > booking.balance_amount:
                raise ValidationError(
                    {"amount": "Payment amount cannot be greater than the booking balance."}
                )
            payment = Payment.objects.create(
                booking=booking,
                amount=amount,
                method=method,
                status=status,
                provider=provider,
                transaction_id=transaction_id,
                gateway_order_id=gateway_order_id,
                gateway_payment_id=gateway_payment_id,
                gateway_signature=gateway_signature,
                notes=notes,
                received_by=changed_by if getattr(changed_by, "is_authenticated", False) else None,
                paid_at=timezone.now() if status == Payment.Status.SUCCESSFUL else None,
            )
            cls.recalculate_booking_payment_summary(booking, changed_by=changed_by)
            if status == Payment.Status.SUCCESSFUL:
                transaction.on_commit(lambda: cls.enqueue_payment_notification(str(payment.id)))
                transaction.on_commit(
                    lambda: broadcast_realtime_event(
                        "payment.successful",
                        {
                            "booking_id": booking.booking_id,
                            "payment_id": str(payment.id),
                            "amount": str(payment.amount),
                            "method": payment.method,
                            "provider": payment.provider,
                        },
                    )
                )
            return payment

    @classmethod
    def recalculate_booking_payment_summary(cls, booking: Booking, changed_by=None) -> Booking:
        successful_total = booking.payments.filter(status=Payment.Status.SUCCESSFUL).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")
        refunded_total = booking.payments.filter(status=Payment.Status.REFUNDED).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")
        amount_paid = max(successful_total - refunded_total, Decimal("0.00"))
        if amount_paid > booking.grand_total:
            amount_paid = booking.grand_total
        return BookingService.update_payment_summary(
            booking,
            amount_paid=amount_paid,
            payment_reference=cls.latest_reference(booking),
            changed_by=changed_by,
            notify=False,
        )

    @staticmethod
    def latest_reference(booking: Booking) -> str:
        payment = (
            booking.payments.exclude(transaction_id="")
            .order_by("-created_at")
            .only("transaction_id")
            .first()
        )
        return payment.transaction_id if payment else booking.payment_reference

    @staticmethod
    def enqueue_payment_notification(payment_id: str) -> None:
        from apps.notifications.tasks import send_payment_received_notifications

        BookingService.enqueue_task(send_payment_received_notifications, payment_id)
