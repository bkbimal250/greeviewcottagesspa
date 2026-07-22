from __future__ import annotations

from django.conf import settings

from apps.bookings.models import Booking
from apps.notifications.services.email import EmailNotificationService
from apps.notifications.services.sms import SMSNotificationService
from apps.notifications.services.whatsapp import WhatsAppNotificationService
from apps.payments.models import Payment


class BookingNotificationService:
    @classmethod
    def send_booking_created(cls, booking_id: str) -> None:
        booking = cls.get_booking(booking_id)
        subject = f"New booking {booking.booking_id}"
        admin_message = cls.admin_booking_message(booking, "New booking received")
        guest_message = cls.guest_booking_message(booking, "Your booking request has been received")
        cls.notify_admins(booking, subject, admin_message, "booking_created_admin")
        cls.notify_guest(booking, subject, guest_message, "booking_created_guest")

    @classmethod
    def send_booking_confirmed(cls, booking_id: str) -> None:
        booking = cls.get_booking(booking_id)
        subject = f"Booking confirmed {booking.booking_id}"
        guest_message = cls.guest_booking_message(booking, "Your booking is confirmed")
        cls.notify_guest(booking, subject, guest_message, "booking_confirmed_guest")

    @classmethod
    def send_booking_cancelled(cls, booking_id: str) -> None:
        booking = cls.get_booking(booking_id)
        subject = f"Booking cancelled {booking.booking_id}"
        message = cls.guest_booking_message(booking, "This booking has been cancelled")
        cls.notify_admins(booking, subject, message, "booking_cancelled_admin")
        cls.notify_guest(booking, subject, message, "booking_cancelled_guest")

    @classmethod
    def send_payment_received(cls, payment_id: str) -> None:
        payment = Payment.objects.select_related(
            "booking", "booking__property", "booking__cottage"
        ).get(pk=payment_id)
        booking = payment.booking
        subject = f"Payment received {booking.booking_id}"
        message = (
            f"Payment received for {booking.booking_id}\n"
            f"Guest: {booking.guest_name}\n"
            f"Amount: INR {payment.amount}\n"
            f"Balance: INR {booking.balance_amount}"
        )
        cls.notify_admins(booking, subject, message, "payment_received_admin")
        cls.notify_guest(booking, subject, message, "payment_received_guest")

    @classmethod
    def send_payment_summary_updated(cls, booking_id: str) -> None:
        booking = cls.get_booking(booking_id)
        subject = f"Payment updated {booking.booking_id}"
        message = (
            f"Payment updated for {booking.booking_id}\n"
            f"Guest: {booking.guest_name}\n"
            f"Paid: INR {booking.amount_paid}\n"
            f"Balance: INR {booking.balance_amount}"
        )
        cls.notify_admins(booking, subject, message, "payment_updated_admin")
        cls.notify_guest(booking, subject, message, "payment_updated_guest")

    @staticmethod
    def get_booking(booking_id: str) -> Booking:
        return Booking.objects.select_related("property", "cottage").get(pk=booking_id)

    @classmethod
    def notify_admins(
        cls, booking: Booking, subject: str, message: str, template_name: str
    ) -> None:
        recipients = {
            settings.ADMIN_NOTIFICATION_EMAIL,
            booking.property.reservation_email,
            booking.property.email,
        }
        for email in filter(None, recipients):
            EmailNotificationService.send(
                recipient=email,
                subject=subject,
                message=message,
                booking=booking,
                template_name=template_name,
            )
        if settings.ADMIN_NOTIFICATION_WHATSAPP:
            WhatsAppNotificationService.send_text(
                recipient=settings.ADMIN_NOTIFICATION_WHATSAPP,
                message=message,
                booking=booking,
                template_name=template_name,
            )
        if settings.ADMIN_NOTIFICATION_PHONE:
            SMSNotificationService.send(
                recipient=settings.ADMIN_NOTIFICATION_PHONE,
                message=message,
                booking=booking,
                template_name=template_name,
            )

    @classmethod
    def notify_guest(cls, booking: Booking, subject: str, message: str, template_name: str) -> None:
        if booking.email_opt_in and booking.guest_email:
            EmailNotificationService.send(
                recipient=booking.guest_email,
                subject=subject,
                message=message,
                booking=booking,
                template_name=template_name,
            )
        if booking.whatsapp_opt_in and booking.guest_phone:
            WhatsAppNotificationService.send_text(
                recipient=booking.guest_phone,
                message=message,
                booking=booking,
                template_name=template_name,
            )
        if booking.sms_opt_in and booking.guest_phone:
            SMSNotificationService.send(
                recipient=booking.guest_phone,
                message=message,
                booking=booking,
                template_name=template_name,
            )

    @staticmethod
    def admin_booking_message(booking: Booking, title: str) -> str:
        return (
            f"{title}\n"
            f"Booking: {booking.booking_id}\n"
            f"Guest: {booking.guest_name} ({booking.guest_phone})\n"
            f"Cottage: {booking.cottage.name}\n"
            f"Dates: {booking.check_in_date} to {booking.check_out_date}\n"
            f"Guests: {booking.adults} adult(s), {booking.children} child(ren)\n"
            f"Total: INR {booking.grand_total}\n"
            f"Balance: INR {booking.balance_amount}"
        )

    @staticmethod
    def guest_booking_message(booking: Booking, title: str) -> str:
        return (
            f"{title}.\n"
            f"Booking ID: {booking.booking_id}\n"
            f"Cottage: {booking.cottage.name}\n"
            f"Check-in: {booking.check_in_date}\n"
            f"Check-out: {booking.check_out_date}\n"
            f"Total: INR {booking.grand_total}\n"
            f"Balance: INR {booking.balance_amount}"
        )
