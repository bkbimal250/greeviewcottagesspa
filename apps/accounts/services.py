import logging
import secrets

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.models import LoginOTP, User
from apps.common.utils import normalize_phone_number

logger = logging.getLogger(__name__)


class AuthService:
    @staticmethod
    def normalize_identifier(identifier: str) -> tuple[str, str]:
        value = (identifier or "").strip()
        if not value:
            raise serializers.ValidationError("Email or phone number is required.")
        if "@" in value:
            return LoginOTP.Channel.EMAIL, value.lower()
        return LoginOTP.Channel.PHONE, normalize_phone_number(value)

    @staticmethod
    def get_staff_user_by_identifier(identifier: str) -> User:
        channel, normalized = AuthService.normalize_identifier(identifier)
        lookup = (
            Q(email__iexact=normalized)
            if channel == LoginOTP.Channel.EMAIL
            else Q(phone=normalized)
        )
        user = User.objects.filter(lookup, is_active=True, is_staff=True).first()
        if user is None:
            raise serializers.ValidationError("No active staff account found for this login.")
        return user

    @staticmethod
    def generate_otp() -> str:
        upper_bound = 10**settings.AUTH_OTP_LENGTH
        return f"{secrets.randbelow(upper_bound):0{settings.AUTH_OTP_LENGTH}d}"

    @staticmethod
    def create_login_otp(identifier: str) -> tuple[LoginOTP, str]:
        channel, normalized = AuthService.normalize_identifier(identifier)
        user = AuthService.get_staff_user_by_identifier(normalized)
        otp = AuthService.generate_otp()

        LoginOTP.objects.filter(
            user=user,
            channel=channel,
            destination=normalized,
            consumed_at__isnull=True,
            expires_at__gt=timezone.now(),
        ).update(consumed_at=timezone.now())

        login_otp = LoginOTP.create_for_user(
            user=user, channel=channel, destination=normalized, otp=otp
        )
        AuthService.deliver_login_otp(login_otp, otp)
        return login_otp, otp

    @staticmethod
    def deliver_login_otp(login_otp: LoginOTP, otp: str) -> None:
        if login_otp.channel == LoginOTP.Channel.EMAIL:
            message = (
                f"Your Hotel Green View Cottages login OTP is {otp}. "
                f"It expires in {settings.AUTH_OTP_EXPIRY_MINUTES} minutes."
            )
            send_mail(
                subject="Hotel Green View Cottages login OTP",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[login_otp.destination],
                fail_silently=False,
            )
            return

        logger.info(
            "Generated phone login OTP for staff account.",
            extra={"destination": login_otp.destination, "otp_id": str(login_otp.id)},
        )

    @staticmethod
    def verify_login_otp(identifier: str, otp: str) -> User:
        channel, normalized = AuthService.normalize_identifier(identifier)
        login_otp = (
            LoginOTP.objects.select_related("user")
            .filter(
                channel=channel,
                destination=normalized,
                consumed_at__isnull=True,
                expires_at__gt=timezone.now(),
                user__is_active=True,
                user__is_staff=True,
            )
            .order_by("-created_at")
            .first()
        )
        if login_otp is None or not login_otp.verify(otp):
            raise serializers.ValidationError("Invalid or expired OTP.")
        return login_otp.user
