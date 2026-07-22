from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db import transaction

from apps.bookings.models import Booking, BookingStatusHistory
from apps.bookings.services.availability import BookingAvailabilityService
from apps.bookings.services.pricing import BookingPricingService
from apps.common.realtime import broadcast_realtime_event
from apps.common.utils import normalize_phone_number
from apps.cottages.models import Cottage

logger = logging.getLogger(__name__)


class BookingService:
    allowed_transitions = {
        Booking.Status.PENDING: {Booking.Status.CONFIRMED, Booking.Status.CANCELLED},
        Booking.Status.CONFIRMED: {
            Booking.Status.CHECKED_IN,
            Booking.Status.CANCELLED,
            Booking.Status.NO_SHOW,
        },
        Booking.Status.CHECKED_IN: {Booking.Status.CHECKED_OUT},
        Booking.Status.CHECKED_OUT: {Booking.Status.COMPLETED},
    }

    @classmethod
    def create_guest_booking(cls, validated_data: dict, request=None) -> Booking:
        with transaction.atomic():
            cottage = (
                Cottage.objects.select_for_update()
                .select_related("property")
                .get(id=validated_data["cottage_id"])
            )
            check_in = validated_data["check_in_date"]
            check_out = validated_data["check_out_date"]
            adults = validated_data["adults"]
            children = validated_data.get("children", 0)
            payment_method = validated_data.get(
                "payment_method", Booking.PaymentMethod.PAY_AT_PROPERTY
            )

            cls.validate_public_payment_method(cottage.property, payment_method)
            BookingAvailabilityService.validate_request(
                cottage, check_in, check_out, adults, children
            )
            price = BookingPricingService.calculate(cottage, check_in, check_out)
            guest_phone = normalize_phone_number(validated_data["guest_phone"])

            booking = Booking.objects.create(
                property=cottage.property,
                cottage=cottage,
                guest_name=validated_data["guest_name"],
                guest_phone=guest_phone,
                guest_email=validated_data.get("guest_email", ""),
                guest_address=validated_data.get("guest_address", ""),
                guest_city=validated_data.get("guest_city", ""),
                guest_state=validated_data.get("guest_state", ""),
                guest_country=validated_data.get("guest_country", "India"),
                guest_pincode=validated_data.get("guest_pincode", ""),
                check_in_date=check_in,
                check_out_date=check_out,
                adults=adults,
                children=children,
                expected_arrival_time=validated_data.get("expected_arrival_time"),
                payment_method=payment_method,
                special_request=validated_data.get("special_request", ""),
                whatsapp_opt_in=validated_data.get("whatsapp_opt_in", True),
                sms_opt_in=validated_data.get("sms_opt_in", False),
                email_opt_in=validated_data.get("email_opt_in", True),
                preferred_notification_channel=validated_data.get(
                    "preferred_notification_channel", Booking.NotificationChannel.WHATSAPP
                ),
                ip_address=cls._get_ip_address(request),
                user_agent=cls._get_user_agent(request),
                **price,
                amount_paid=Decimal("0.00"),
            )
            cls.create_history(booking, note="Booking created.")

            def notify():
                from apps.bookings.tasks import send_booking_created_notifications

                cls.enqueue_task(send_booking_created_notifications, str(booking.id))
                broadcast_realtime_event(
                    "booking.created",
                    {
                        "booking_id": booking.booking_id,
                        "booking_status": booking.booking_status,
                        "payment_status": booking.payment_status,
                        "cottage_id": str(booking.cottage_id),
                        "check_in_date": booking.check_in_date.isoformat(),
                        "check_out_date": booking.check_out_date.isoformat(),
                    },
                )

            transaction.on_commit(notify)
            return booking

    @classmethod
    def transition(
        cls,
        booking: Booking,
        new_status: str,
        *,
        changed_by=None,
        note: str = "",
        cancellation_reason: str = "",
    ) -> Booking:
        allowed = cls.allowed_transitions.get(booking.booking_status, set())
        if new_status not in allowed:
            raise ValidationError({"booking_status": "Invalid booking status transition."})

        previous_status = booking.booking_status
        previous_payment = booking.payment_status
        booking.booking_status = new_status
        if cancellation_reason:
            booking.cancellation_reason = cancellation_reason

        from django.utils import timezone

        now = timezone.now()
        if new_status == Booking.Status.CONFIRMED:
            booking.confirmed_at = now
        elif new_status == Booking.Status.CANCELLED:
            booking.cancelled_at = now
        elif new_status == Booking.Status.CHECKED_IN:
            booking.checked_in_at = now
        elif new_status == Booking.Status.CHECKED_OUT:
            booking.checked_out_at = now

        booking.save()
        cls.create_history(
            booking,
            previous_booking_status=previous_status,
            previous_payment_status=previous_payment,
            changed_by=changed_by,
            note=note,
        )
        return booking

    @staticmethod
    def validate_public_payment_method(prop, payment_method: str) -> None:
        if payment_method == Booking.PaymentMethod.PAY_AT_PROPERTY:
            if not prop.pay_at_property_allowed:
                raise ValidationError(
                    {"payment_method": "Pay at property is not enabled for this property."}
                )
            return

        if payment_method == Booking.PaymentMethod.ONLINE_GATEWAY:
            if not prop.online_payment_enabled:
                raise ValidationError(
                    {"payment_method": "Online payment is not enabled for this property."}
                )
            return

        raise ValidationError(
            {
                "payment_method": (
                    "Website bookings support pay_at_property or online_gateway only."
                )
            }
        )

    @staticmethod
    def minimum_online_payment_amount(prop, grand_total: Decimal) -> Decimal:
        if not prop.advance_payment_required:
            return grand_total
        percentage = prop.advance_payment_percentage or Decimal("0.00")
        amount = (grand_total * percentage / Decimal("100")).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )
        return max(amount, Decimal("0.01")) if grand_total > 0 else Decimal("0.00")

    @classmethod
    def confirm_booking(cls, booking: Booking, changed_by=None) -> Booking:
        booking = cls.transition(booking, Booking.Status.CONFIRMED, changed_by=changed_by)

        def notify():
            from apps.bookings.tasks import send_booking_confirmed_notifications

            cls.enqueue_task(send_booking_confirmed_notifications, str(booking.id))
            broadcast_realtime_event(
                "booking.confirmed",
                {
                    "booking_id": booking.booking_id,
                    "booking_status": booking.booking_status,
                    "payment_status": booking.payment_status,
                    "cottage_id": str(booking.cottage_id),
                    "check_in_date": booking.check_in_date.isoformat(),
                    "check_out_date": booking.check_out_date.isoformat(),
                },
            )

        transaction.on_commit(notify)
        return booking

    @classmethod
    def cancel_booking(cls, booking: Booking, reason: str, changed_by=None) -> Booking:
        booking = cls.transition(
            booking,
            Booking.Status.CANCELLED,
            changed_by=changed_by,
            cancellation_reason=reason,
            note=reason,
        )

        def notify():
            from apps.bookings.tasks import send_booking_cancelled_notifications

            cls.enqueue_task(send_booking_cancelled_notifications, str(booking.id))

        transaction.on_commit(notify)
        return booking

    @classmethod
    def check_in_booking(cls, booking: Booking, changed_by=None) -> Booking:
        return cls.transition(booking, Booking.Status.CHECKED_IN, changed_by=changed_by)

    @classmethod
    def check_out_booking(cls, booking: Booking, changed_by=None) -> Booking:
        return cls.transition(booking, Booking.Status.CHECKED_OUT, changed_by=changed_by)

    @classmethod
    def update_payment_summary(
        cls,
        booking: Booking,
        amount_paid: Decimal,
        payment_reference: str = "",
        changed_by=None,
        notify: bool = True,
    ) -> Booking:
        previous_status = booking.booking_status
        previous_payment = booking.payment_status
        booking.amount_paid = amount_paid
        booking.payment_reference = payment_reference
        if amount_paid <= 0:
            booking.payment_status = Booking.PaymentStatus.UNPAID
        elif amount_paid < booking.grand_total:
            booking.payment_status = Booking.PaymentStatus.PARTIALLY_PAID
        else:
            booking.payment_status = Booking.PaymentStatus.PAID
        booking.save()
        cls.create_history(
            booking,
            previous_booking_status=previous_status,
            previous_payment_status=previous_payment,
            changed_by=changed_by,
            note="Payment summary updated.",
        )
        if (
            booking.payment_status == Booking.PaymentStatus.PAID
            and booking.booking_status == Booking.Status.PENDING
        ):
            booking = cls.confirm_booking(booking, changed_by=changed_by)

        if notify and booking.amount_paid > 0:

            def send_payment_notification():
                from apps.notifications.tasks import send_payment_summary_updated_notifications

                cls.enqueue_task(send_payment_summary_updated_notifications, str(booking.id))

            transaction.on_commit(send_payment_notification)
        return booking

    @staticmethod
    def create_history(
        booking: Booking,
        previous_booking_status: str = "",
        previous_payment_status: str = "",
        changed_by=None,
        note: str = "",
    ) -> BookingStatusHistory:
        return BookingStatusHistory.objects.create(
            booking=booking,
            previous_booking_status=previous_booking_status,
            new_booking_status=booking.booking_status,
            previous_payment_status=previous_payment_status,
            new_payment_status=booking.payment_status,
            changed_by=changed_by,
            note=note,
        )

    @staticmethod
    def _get_ip_address(request) -> str | None:
        if request is None:
            return None
        forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")

    @staticmethod
    def _get_user_agent(request) -> str:
        if request is None:
            return ""
        return request.META.get("HTTP_USER_AGENT", "")[:500]

    @staticmethod
    def enqueue_task(task, *args) -> None:
        try:
            task.delay(*args)
        except Exception as exc:
            logger.warning("Unable to enqueue booking notification task: %s", exc)
