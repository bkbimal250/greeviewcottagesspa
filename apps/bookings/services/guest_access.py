from __future__ import annotations

import secrets

from django.core import signing
from django.core.cache import cache
from rest_framework import serializers

from apps.bookings.models import Booking
from apps.common.utils import normalize_phone_number
from apps.notifications.services.email import EmailNotificationService
from apps.notifications.services.sms import SMSNotificationService
from apps.notifications.services.whatsapp import WhatsAppNotificationService


class BookingGuestAccessService:
    cache_prefix = "booking-guest-otp"
    signer = signing.TimestampSigner(salt="booking-guest-access")
    token_max_age_seconds = 15 * 60

    @classmethod
    def request_otp(cls, *, booking_id: str, guest_phone: str) -> Booking:
        booking = cls.get_booking_for_phone(booking_id, guest_phone)
        otp = cls.generate_otp()
        cache.set(cls.cache_key(booking.booking_id, booking.guest_phone), otp, timeout=10 * 60)
        cls.deliver_otp(booking, otp)
        return booking

    @classmethod
    def verify_otp(cls, *, booking_id: str, guest_phone: str, otp: str) -> str:
        booking = cls.get_booking_for_phone(booking_id, guest_phone)
        cache_key = cls.cache_key(booking.booking_id, booking.guest_phone)
        cached_otp = cache.get(cache_key)
        if not cached_otp or str(cached_otp) != str(otp).strip():
            raise serializers.ValidationError({"otp": "Invalid or expired OTP."})
        cache.delete(cache_key)
        return cls.sign_access_token(booking)

    @classmethod
    def get_booking_from_token(cls, token: str) -> Booking:
        try:
            value = cls.signer.unsign(token, max_age=cls.token_max_age_seconds)
        except signing.BadSignature:
            raise serializers.ValidationError({"access_token": "Invalid or expired access token."})

        booking_id, guest_phone = value.split("|", 1)
        return cls.get_booking_for_phone(booking_id, guest_phone)

    @staticmethod
    def generate_otp() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"

    @staticmethod
    def cache_key(booking_id: str, guest_phone: str) -> str:
        return f"{BookingGuestAccessService.cache_prefix}:{booking_id}:{guest_phone}"

    @staticmethod
    def get_booking_for_phone(booking_id: str, guest_phone: str) -> Booking:
        phone = normalize_phone_number(guest_phone)
        booking = (
            Booking.objects.select_related("property", "cottage")
            .filter(booking_id=booking_id.strip().upper(), guest_phone=phone)
            .first()
        )
        if booking is None:
            raise serializers.ValidationError(
                "Booking was not found for the provided Booking ID and phone."
            )
        return booking

    @classmethod
    def sign_access_token(cls, booking: Booking) -> str:
        return cls.signer.sign(f"{booking.booking_id}|{booking.guest_phone}")

    @staticmethod
    def deliver_otp(booking: Booking, otp: str) -> None:
        message = (
            f"Your Green View Cottages booking OTP is {otp}. "
            "It expires in 10 minutes."
        )
        if booking.guest_email:
            EmailNotificationService.send(
                recipient=booking.guest_email,
                subject=f"Booking OTP {booking.booking_id}",
                message=message,
                booking=booking,
                template_name="booking_lookup_otp",
            )
        if booking.guest_phone:
            WhatsAppNotificationService.send_text(
                recipient=booking.guest_phone,
                message=message,
                booking=booking,
                template_name="booking_lookup_otp",
            )
            SMSNotificationService.send(
                recipient=booking.guest_phone,
                message=message,
                booking=booking,
                template_name="booking_lookup_otp",
            )
