from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from apps.accounts.managers import UserManager
from apps.common.models import BaseModel
from apps.common.utils import normalize_phone_number


class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ADMIN = "admin", "Admin"
        STAFF = "staff", "Staff"

    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "accounts_user"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["is_active", "is_staff"]),
        ]

    def __str__(self) -> str:
        return self.email

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower().strip()
        if self.phone:
            self.phone = normalize_phone_number(self.phone)
        else:
            self.phone = None
        super().save(*args, **kwargs)


class LoginOTP(BaseModel):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="login_otps"
    )
    channel = models.CharField(max_length=10, choices=Channel.choices)
    destination = models.CharField(max_length=254, db_index=True)
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField(db_index=True)
    consumed_at = models.DateTimeField(blank=True, null=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=5)

    class Meta:
        db_table = "accounts_login_otp"
        indexes = [
            models.Index(fields=["destination", "channel", "consumed_at"]),
            models.Index(fields=["user", "expires_at"]),
        ]

    @classmethod
    def create_for_user(cls, user: User, channel: str, destination: str, otp: str):
        expires_at = timezone.now() + timezone.timedelta(minutes=settings.AUTH_OTP_EXPIRY_MINUTES)
        return cls.objects.create(
            user=user,
            channel=channel,
            destination=destination,
            otp_hash=make_password(otp),
            expires_at=expires_at,
            max_attempts=settings.AUTH_OTP_MAX_ATTEMPTS,
        )

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @property
    def is_consumed(self) -> bool:
        return self.consumed_at is not None

    def verify(self, otp: str) -> bool:
        if self.is_consumed or self.is_expired or self.attempts >= self.max_attempts:
            return False

        self.attempts += 1
        is_valid = check_password(otp, self.otp_hash)
        if is_valid:
            self.consumed_at = timezone.now()
        self.save(update_fields=["attempts", "consumed_at", "updated_at"])
        return is_valid
